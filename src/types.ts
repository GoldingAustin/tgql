import type {
	tGQLBase,
	tGQLEnum,
	tGQLObject,
	tGQLInputObject,
	tGQLList,
	tGQLNullable,
	tGQLFloat,
	tGQLID,
	tGQLInt,
	tGQLString,
	tGQLBool,
	tGQLFieldResolver,
	tGQLNullableBase
} from './types-builder/index.ts';
import type { GraphQLNonNull, GraphQLType as GraphQLTypes } from 'graphql';
export type tGQLBaseTypeAny = tGQLBase<any, any, any>;

export type tGQLBaseTypes =
	| tGQLString
	| tGQLInt
	| tGQLFloat
	| tGQLID
	| tGQLBool
	| tGQLEnum<string[] | readonly string[]>;

export type tGQLOutputTypes =
	| tGQLBaseTypes
	| tGQLObject<any>
	| tGQLList<tGQLOutputTypes>
	| tGQLNullable<tGQLOutputTypes>
	| tGQLFieldResolver<any, any, any>;

export type tGQLInputTypes =
	| tGQLBaseTypes
	| tGQLInputObject<any>
	| tGQLList<tGQLInputTypes>
	| tGQLNullableBase<tGQLInputTypes>;

export type Infer<T extends tGQLBaseTypeAny> = T['_type'];

export type Expand<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
export type tGQLObjectFieldsBase<Type extends tGQLBaseTypeAny = tGQLBaseTypeAny> = Record<string, Type>;
export type GraphQLNullCheck<GraphQLType extends GraphQLTypes> = GraphQLType extends GraphQLNonNull<infer R>
	? R
	: GraphQLType;
export type UndefinedAsOptional<
	T extends tGQLObjectFieldsBase,
	ComparisonType = tGQLNullable<any>,
> = Partial<{
	[P in keyof T as T[P] extends ComparisonType ? P : never]: Infer<T[P]>;
}> & {
	[P in keyof T as T[P] extends ComparisonType ? never : P]: Infer<T[P]>;
};