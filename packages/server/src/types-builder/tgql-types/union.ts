import type { Infer } from '../../types.ts';
import { tGQLNonNull } from '../index.ts';
import type { tGQLObject } from '../index.ts';
import type { ThunkReadonlyArray } from 'graphql';
import { GraphQLUnionType } from 'graphql';

export class tGQLUnion<tGQLTypes extends tGQLObject<any>[]> extends tGQLNonNull<
	tGQLUnion<tGQLTypes>,
	Infer<tGQLTypes[number]>,
	GraphQLUnionType
> {
	declare name: string;

	override readonly _class = 'tGQLUnion' as const;

	constructor(name: string, public types: tGQLTypes) {
		super({
			name,
			graphQLType: new GraphQLUnionType({
				name,
				types: types.map((tGQLType) => ('ofType' in tGQLType._graphQLType) ? tGQLType._graphQLType.ofType : tGQLType._graphQLType) as ThunkReadonlyArray<any>,
			}),
		});
	}
}
