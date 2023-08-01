import type { Infer, tGQLBaseTypeAny } from '../../types.ts';
import { tGQLNonNull } from '../index.ts';
import { GraphQLList } from 'graphql';

export class tGQLList<tGQLType extends tGQLBaseTypeAny> extends tGQLNonNull<
	tGQLType,
	Infer<tGQLType>[],
	GraphQLList<tGQLType['_graphQLType']>
> {
	override readonly _class = 'tGQLList' as const;
	constructor(tGQLType: tGQLType) {
		super({ tGQLType, graphQLType: new GraphQLList(tGQLType._graphQLType) });
	}
}
