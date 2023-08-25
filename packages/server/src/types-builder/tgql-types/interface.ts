import type { Expand, tGQLObjectFieldsBase, tGQLOutputTypes, UndefinedAsOptional } from '../../types.ts';
import { tGQLNonNull } from '../index.ts';
import { tGQLObject } from './object.ts';
import type { GraphQLFieldConfig, GraphQLFieldConfigMap } from 'graphql';
import { GraphQLInterfaceType } from 'graphql';

export class tGQLInterface<
	Fields extends tGQLObjectFieldsBase<tGQLOutputTypes>,
	Name extends string
> extends tGQLNonNull<tGQLInterface<Fields, Name>, Expand<UndefinedAsOptional<Fields>>, GraphQLInterfaceType> {
	declare name: Name;
	override readonly _class = 'tGQLInterface' as const;
	constructor(name: string, public fields: Fields) {
		super({
			name,
			noWrap: true,
			graphQLType: new GraphQLInterfaceType({
				name: name,
				fields: tGQLInterface.buildFields(fields),
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

	public implement<
		T extends tGQLObjectFieldsBase<tGQLOutputTypes> & {
			[K in keyof Fields]?: never;
		},
		ObjectName extends string
	>(name: ObjectName, fields: T): tGQLObject<Expand<Fields & Omit<T, keyof Fields>>, ObjectName> {
		return new tGQLObject(name, { ...fields, ...this.fields }, [this]) as unknown as tGQLObject<
			Expand<Fields & Omit<T, keyof Fields>>,
			ObjectName
		>;
	}
}
