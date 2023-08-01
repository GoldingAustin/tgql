import type { tGQLBaseTypeAny } from '../../types.ts';
import { tGQLBase, tGQLNullable } from '../index.ts';
import type { GraphQLType as GraphQLTypes } from 'graphql';
import { GraphQLNonNull } from 'graphql';

export abstract class tGQLNonNull<
	tGQLType extends tGQLBaseTypeAny,
	TypescriptType,
	GraphQLType extends GraphQLTypes
> extends tGQLBase<tGQLType, TypescriptType, GraphQLNonNull<GraphQLType>> {
	override _nullable = false;
	abstract readonly _class: string;

	constructor({
		tGQLType,
		graphQLType,
		name,
		noWrap,
	}: {
		tGQLType?: tGQLType;
		graphQLType: GraphQLTypes;
		name?: string;
		noWrap?: boolean;
	}) {
		super({ tGQLType, graphQLType: graphQLType && !noWrap ? new GraphQLNonNull(graphQLType) : graphQLType, name });
	}

	nullable(): tGQLNullable<this> {
		return new tGQLNullable<this>(this);
	}
}
