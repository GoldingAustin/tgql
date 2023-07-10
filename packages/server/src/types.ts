import type {
	tGQLBase,
	tGQLBool,
	tGQLEnum,
	tGQLFieldResolver,
	tGQLFloat,
	tGQLID,
	tGQLInputObject,
	tGQLInt,
	tGQLList,
	tGQLNonNull,
	tGQLNullable,
	tGQLNullableBase,
	tGQLObject,
	tGQLString,
} from './types-builder/index.ts';
import type { tGQLInterface } from './types-builder/index.ts';
import type { tGQLCustomScalar } from './types-builder/tgql-types/scalars.ts';
import type { tGQLUnion } from './types-builder/tgql-types/union.ts';
import type { GraphQLNonNull, GraphQLScalarType, GraphQLType as GraphQLTypes } from 'graphql';
import type { tGQLNullableWithDefault } from './types-builder/index.ts';

export type tGQLBaseTypeAny = tGQLBase<any, any, any>;

export type tGQLBaseTypes =
	| tGQLString
	| tGQLInt
	| tGQLFloat
	| tGQLID
	| tGQLBool
	| tGQLCustomScalar<GraphQLScalarType>
	| tGQLEnum<string[] | readonly string[], any>;

export type tGQLOutputTypes =
	| tGQLBaseTypes
	| tGQLObject<any, any>
	| tGQLList<tGQLOutputTypes>
	| tGQLNullable<tGQLOutputTypes>
	| tGQLInterface<any, any>
	| tGQLUnion<tGQLObject<any, any>[], any>
	| tGQLFieldResolver<any, any, any>;

export type tGQLInputTypes =
	| tGQLBaseTypes
	| tGQLInputObject<any, any>
	| tGQLList<tGQLInputTypes>
	| tGQLNullable<tGQLInputTypes>
	| tGQLNullableWithDefault<tGQLInputTypes>;

export type tGQLTypes = tGQLOutputTypes | tGQLInputTypes;

export type GraphQLTypeMap = Record<string, GraphQLTypes>;
export type Infer<T extends tGQLBaseTypeAny> = T['_type'];

export type Expand<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
export type tGQLObjectFieldsBase<Type extends tGQLBaseTypeAny = tGQLBaseTypeAny> = Record<string, Type>;
export type GraphQLNullCheck<GraphQLType extends GraphQLTypes> = GraphQLType extends GraphQLNonNull<infer R>
	? R
	: GraphQLType;

export type ToOptional<T extends tGQLObjectFieldsBase, Keys extends keyof T> = {
	[P in keyof T]: P extends Keys ? (T[P] extends tGQLNonNull<any, any, any> ? tGQLNullable<T[P]> : T[P]) : T[P];
};
export type ToRequired<T extends tGQLObjectFieldsBase, Keys extends keyof T> = {
	[P in keyof T]: P extends Keys ? (T[P] extends tGQLNullableBase<any> ? T[P]['_tGQLType'] : T[P]) : T[P];
};

export type UndefinedAsOptional<T extends tGQLObjectFieldsBase, ComparisonType = tGQLNullable<any>> = Partial<{
	[P in keyof T as T[P] extends ComparisonType ? P : never]: Infer<T[P]>;
}> & {
	[P in keyof T as T[P] extends ComparisonType ? never : P]: Infer<T[P]>;
};

// type that removes or null from a type
export type RemoveNull<T> = Exclude<T, null>;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
