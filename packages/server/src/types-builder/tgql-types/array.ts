import type { GraphQLTypeMap, Infer, tGQLBaseTypeAny } from '../../types.ts';
import { tGQLNonNull } from '../index.ts';
import { GraphQLList } from 'graphql';

export class tGQLList<tGQLType extends tGQLBaseTypeAny> extends tGQLNonNull<
	tGQLType,
	Infer<tGQLType>[],
	GraphQLList<tGQLType['_graphQLType']>
> {
	override readonly _class = 'tGQLList' as const;
	constructor(tGQLType: tGQLType) {
		super({ tGQLType });
	}

	override _createGraphQLType({ graphqlTypeMap }: { graphqlTypeMap?: GraphQLTypeMap } = {}) {
		return super._createGraphQLType({
			graphqlTypeMap,
			overrideType: new GraphQLList(this._tGQLType._createGraphQLType({ graphqlTypeMap })),
		});
	}
}
