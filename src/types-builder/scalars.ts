import { GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLScalarType, GraphQLString } from 'graphql';
import { tGQLNonNull } from './index.ts';
import type { RemoveNull } from '../types.ts';

export class tGQLString extends tGQLNonNull<tGQLString, string, typeof GraphQLString> {
	override readonly _class = 'tGQLString' as const;
}
export class tGQLInt extends tGQLNonNull<tGQLInt, number, typeof GraphQLInt> {
	override readonly _class = 'tGQLInt' as const;
}
export class tGQLFloat extends tGQLNonNull<tGQLFloat, number, typeof GraphQLFloat> {
	override readonly _class = 'tGQLFloat' as const;
}
export class tGQLBool extends tGQLNonNull<tGQLBool, boolean, typeof GraphQLBoolean> {
	override readonly _class = 'tGQLBool' as const;
}
export class tGQLID extends tGQLNonNull<tGQLID, string, typeof GraphQLID> {
	override readonly _class = 'tGQLID' as const;
}

export class tGQLCustomScalar<GraphQLType extends GraphQLScalarType> extends tGQLNonNull<
	tGQLCustomScalar<any>,
	RemoveNull<ReturnType<GraphQLType['parseValue']>>,
	GraphQLType
> {
	override readonly _class = 'tGQLCustomScalar' as const;
}
