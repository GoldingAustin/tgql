import { GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';
import { tGQLNonNull } from './index.ts';

export class tGQLString extends tGQLNonNull<tGQLString, string, typeof GraphQLString> {}
export class tGQLInt extends tGQLNonNull<tGQLInt, number, typeof GraphQLInt> {}
export class tGQLFloat extends tGQLNonNull<tGQLFloat, number, typeof GraphQLFloat> {}
export class tGQLBool extends tGQLNonNull<tGQLBool, boolean, typeof GraphQLBoolean> {}
export class tGQLID extends tGQLNonNull<tGQLID, string, typeof GraphQLID> {}
