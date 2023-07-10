import type { tGQLBaseTypeAny, tGQLInputTypes, tGQLObjectFieldsBase, tGQLOutputTypes } from '../types.ts';
import {
	tGQLBool,
	tGQLEnum,
	tGQLFloat,
	tGQLID,
	tGQLInputObject,
	tGQLInt,
	tGQLInterface,
	tGQLList,
	tGQLObject,
	tGQLString,
} from './index.ts';
import { tGQLCustomScalar } from './tgql-types/scalars.ts';
import { tGQLUnion } from './tgql-types/union.ts';
import type { GraphQLScalarType } from 'graphql';
import { GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';

export function id(): tGQLID {
	return new tGQLID({ graphQLType: GraphQLID });
}

export function string(): tGQLString {
	return new tGQLString({ graphQLType: GraphQLString });
}

export function int(): tGQLInt {
	return new tGQLInt({ graphQLType: GraphQLInt });
}

export function float(): tGQLFloat {
	return new tGQLFloat({ graphQLType: GraphQLFloat });
}

export function boolean(): tGQLBool {
	return new tGQLBool({ graphQLType: GraphQLBoolean });
}

export function scalar<GraphQLType extends GraphQLScalarType>(graphQLType: GraphQLType): tGQLCustomScalar<GraphQLType> {
	return new tGQLCustomScalar({ name: graphQLType.name, graphQLType });
}

function enum_<T extends string[] | readonly string[], Name extends string>(name: Name, values: T): tGQLEnum<T, Name> {
	return new tGQLEnum(name, values);
}

export function list<T extends tGQLBaseTypeAny>(type: T): tGQLList<T> {
	return new tGQLList(type);
}

export function object<T extends tGQLObjectFieldsBase<tGQLOutputTypes>, Name extends string>(
	name: Name,
	fields: T
): tGQLObject<T, Name> {
	return new tGQLObject<T, Name>(name, fields);
}

function interface_<T extends tGQLObjectFieldsBase<tGQLOutputTypes>, Name extends string>(
	name: Name,
	fields: T
): tGQLInterface<T, Name> {
	return new tGQLInterface<T, Name>(name, fields);
}

export function union<T extends tGQLObject<any, any>[], Name extends string>(name: Name, types: T): tGQLUnion<T, Name> {
	return new tGQLUnion<T, Name>(name, types);
}

export function inputObject<T extends tGQLObjectFieldsBase<tGQLInputTypes>, Name extends string>(
	name: Name,
	fields: T
): tGQLInputObject<T, Name> {
	return new tGQLInputObject(name, fields);
}

export { enum_ as enum, interface_ as interface };
