import type { tGQLBaseTypeAny } from '../../types.ts';
import { tGQLBase, tGQLNullable } from '../index.ts';
import type { GraphQLNonNull, GraphQLType as GraphQLTypes } from 'graphql';

export abstract class tGQLNonNull<
	tGQLType extends tGQLBaseTypeAny,
	TypescriptType,
	GraphQLType extends GraphQLTypes
> extends tGQLBase<tGQLType, TypescriptType, GraphQLNonNull<GraphQLType>> {
	override _nullable = false;
	abstract readonly _class: string;

	nullable(): tGQLNullable<this> {
		return new tGQLNullable<this>(this);
	}
}
