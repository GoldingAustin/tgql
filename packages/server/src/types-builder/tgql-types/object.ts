import type { Expand, tGQLOutputTypes, UndefinedAsOptional } from '../../types.ts';
import type { tGQLObjectFieldsBase } from '../../types.ts';
import { tGQLNonNull } from '../index.ts';
import type { tGQLFieldResolver } from './field-resolver.ts';
import { FieldResolverBuilder } from './field-resolver.ts';
import { toInputObject } from './input-object.ts';
import type { tGQLInterface } from './interface.ts';
import type { GraphQLFieldConfig, GraphQLFieldConfigMap } from 'graphql';
import { GraphQLObjectType } from 'graphql';

export class tGQLObject<Fields extends tGQLObjectFieldsBase<tGQLOutputTypes>, Name extends string> extends tGQLNonNull<
	tGQLObject<Fields, Name>,
	Expand<UndefinedAsOptional<Fields>>,
	GraphQLObjectType
> {
	declare name: Name;
	override readonly _class = 'tGQLObject' as const;
	public resolvers?: (builder: FieldResolverBuilder<any, this>) => Record<string, tGQLFieldResolver<any, any, any>>;
	constructor(name: string, public fields: Fields, private interfaces: tGQLInterface<any>[] = []) {
		super({
			name,
			graphQLType: new GraphQLObjectType({
				name: name,
				fields: tGQLObject.buildFields(fields),
				interfaces: interfaces?.map((i) => i._graphQLType) as any,
			}),
		});
	}

	private static buildFields<Fields extends tGQLObjectFieldsBase<tGQLOutputTypes>>(
		_fields: Fields
	): GraphQLFieldConfigMap<any, any> {
		const fields: GraphQLFieldConfigMap<any, any> = {};
		for (const [key, tGQLType] of Object.entries(_fields)) {
			fields[key] = tGQLType.fieldConfig as unknown as GraphQLFieldConfig<any, any>;
		}
		return fields;
	}

	public fieldResolvers<
		tContext,
		FieldReturn extends Record<string, tGQLFieldResolver<tGQLOutputTypes, any, any>> = Record<
			string,
			tGQLFieldResolver<tGQLOutputTypes, any, any>
		>
	>(fields: (builder: FieldResolverBuilder<tContext, this>) => FieldReturn) {
		this.resolvers = fields;
		const newFields = { ...this.fields, ...this.resolvers(new FieldResolverBuilder(this as any)) };
		const newObject = new GraphQLObjectType({
			name: this.name,
			fields: tGQLObject.buildFields(newFields),
		});
		// @ts-ignore
		// Reassign the current graphQLType fields to the new fields with the resolvers
		this._graphQLType.ofType._fields = newObject._fields;
		return this;
	}

	public toInput<NewName extends string>(
		name: NewName
	): ReturnType<typeof toInputObject<tGQLObject<Fields, Name>, NewName>> {
		return toInputObject(name, this) as unknown as ReturnType<typeof toInputObject<tGQLObject<Fields, Name>, NewName>>;
	}

	/**
	 * Extends the object with the fields of the given interface
	 * @param tgqlInterface {tGQLInterface<any>}
	 * @returns {tGQLObject<Expand<Fields & Interfaces['fields'], Name>>}
	 */
	public extends<Interfaces extends tGQLInterface<any, any>>(
		tgqlInterface: Interfaces & { fields: { [K in keyof Fields]?: never } }
	): tGQLObject<Expand<Fields & Interfaces['fields']>, Name> {
		return new tGQLObject(
			this.name,
			{
				...this.fields,
				...tgqlInterface.fields,
			},
			[...this.interfaces, tgqlInterface]
		);
	}
}
