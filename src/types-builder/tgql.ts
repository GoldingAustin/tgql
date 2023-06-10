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
import { GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLScalarType, GraphQLString } from 'graphql';

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

function enum_<T extends string[] | readonly string[]>(name: string, values: T): tGQLEnum<T> {
	return new tGQLEnum(name, values);
}

export function list<T extends tGQLBaseTypeAny>(type: T): tGQLList<T> {
	return new tGQLList(type);
}

export function object<T extends tGQLObjectFieldsBase<tGQLOutputTypes>>(name: string, fields: T): tGQLObject<T> {
	return new tGQLObject<T>(name, fields);
}

function interface_<T extends tGQLObjectFieldsBase<tGQLOutputTypes>>(name: string, fields: T): tGQLInterface<T> {
	return new tGQLInterface<T>(name, fields);
}

export function union<T extends tGQLObject<any>[]>(name: string, types: T): tGQLUnion<T> {
	return new tGQLUnion<T>(name, types);
}

export function inputObject<T extends tGQLObjectFieldsBase<tGQLInputTypes>>(
	name: string,
	fields: T,
): tGQLInputObject<T> {
	return new tGQLInputObject(name, fields);
}

export { enum_ as enum, interface_ as interface };
