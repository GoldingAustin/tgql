import type { GraphQLTypeMap, Infer } from '../../types.ts';
import { tGQLNonNull } from '../index.ts';
import type { tGQLObject } from '../index.ts';
import { GraphQLUnionType } from 'graphql';

export class tGQLUnion<tGQLTypes extends tGQLObject<any>[]> extends tGQLNonNull<
	tGQLUnion<tGQLTypes>,
	Infer<tGQLTypes[number]>,
	GraphQLUnionType
> {
	declare name: string;

	override readonly _class = 'tGQLUnion' as const;

	constructor(name: string, public types: tGQLTypes) {
		super({ name });
	}

	override _createGraphQLType({ graphqlTypeMap }: { graphqlTypeMap?: GraphQLTypeMap }) {
		return super._createGraphQLType({
			graphqlTypeMap,
			overrideType: new GraphQLUnionType({
				name: this.name,
				types: this.types.map((tGQLType) => tGQLType._createGraphQLType({ graphqlTypeMap }).ofType),
				description: this._description,
			}),
		});
	}
}
