import type { Expand, tGQLOutputTypes, UndefinedAsOptional } from '../../types.ts';
import type { GraphQLTypeMap, tGQLObjectFieldsBase } from '../../types.ts';
import { tGQLNonNull } from '../index.ts';
import type { tGQLFieldResolver } from './field-resolver.ts';
import { FieldResolverBuilder } from './field-resolver.ts';
import { toInputObject } from './input-object.ts';
import type { tGQLInterface } from './interface.ts';
import type { GraphQLFieldConfig, GraphQLFieldConfigMap } from 'graphql';
import { GraphQLObjectType } from 'graphql';

export class tGQLObject<Fields extends tGQLObjectFieldsBase<tGQLOutputTypes>> extends tGQLNonNull<
	tGQLObject<Fields>,
	Expand<UndefinedAsOptional<Fields>>,
	GraphQLObjectType
> {
	declare name: string;
	override readonly _class = 'tGQLObject' as const;
	private resolvers?: (builder: FieldResolverBuilder<any, this>) => Record<string, tGQLFieldResolver<any, any, any>>;
	constructor(name: string, public fields: Fields, private interfaces: tGQLInterface<any>[] = []) {
		super({ name });
	}

	private buildFields(graphqlTypeMap?: GraphQLTypeMap): GraphQLFieldConfigMap<any, any> {
		const fields: GraphQLFieldConfigMap<any, any> = {};
		for (const [key, tGQLType] of Object.entries(this.fields)) {
			fields[key] = tGQLType.fieldConfig(graphqlTypeMap) as unknown as GraphQLFieldConfig<any, any>;
		}
		if (this.resolvers) {
			const resolvers = this.resolvers(new FieldResolverBuilder<any, this>(this));
			for (const [key, resolver] of Object.entries(resolvers)) {
				fields[key] = resolver.fieldConfig(graphqlTypeMap) as unknown as GraphQLFieldConfig<any, any>;
			}
		}
		return fields;
	}

	override _createGraphQLType({ graphqlTypeMap }: { graphqlTypeMap?: GraphQLTypeMap } = {}) {
		return super._createGraphQLType({
			graphqlTypeMap,
			overrideType: new GraphQLObjectType({
				name: this.name,
				fields: this.buildFields(graphqlTypeMap),
				description: this._description,
				interfaces: this.interfaces?.map((i) => i._createGraphQLType({ graphqlTypeMap }).ofType) as any,
			}),
		});
	}

	public fieldResolvers<
		tContext,
		FieldReturn extends Record<string, tGQLFieldResolver<tGQLOutputTypes, any, any>> = {}
	>(fields: (builder: FieldResolverBuilder<tContext, this>) => FieldReturn) {
		this.resolvers = fields;
		// TODO: Figure out why this is the only way to get the type to work
		return this as unknown as tGQLObject<{
			[K in keyof (Fields & FieldReturn)]: (Fields & FieldReturn)[K];
		}>;
	}

	public toInput(name: string): ReturnType<typeof toInputObject<tGQLObject<Fields>>> {
		return toInputObject<tGQLObject<Fields>>(name, this);
	}

	/**
	 * Extends the object with the fields of the given interface
	 * @param tgqlInterface {tGQLInterface<any>}
	 * @returns {tGQLObject<Expand<Fields & Interfaces['fields']>>}
	 */
	public extends<Interfaces extends tGQLInterface<any>>(
		tgqlInterface: Interfaces & { fields: { [K in keyof Fields]?: never } }
	): tGQLObject<Expand<Fields & Interfaces['fields']>> {
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
