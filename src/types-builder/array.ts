import { GraphQLList } from 'graphql';
import type { Infer, tGQLBaseTypeAny } from '../types.ts';
import { tGQLNonNull } from './index.ts';

export class tGQLList<tGQLType extends tGQLBaseTypeAny> extends tGQLNonNull<
	tGQLType,
	Infer<tGQLType>[],
	GraphQLList<tGQLType['_graphQLType']>
> {
	constructor(tGQLType: tGQLType) {
		super({ tGQLType });
	}

	override _createGraphQLType() {
		return super._createGraphQLType(new GraphQLList(this._tGQLType._createGraphQLType()));
	}
}
