import { GraphQLNonNull, GraphQLType as GraphQLTypes } from 'graphql';
import type { GraphQLNullCheck, tGQLBaseTypeAny } from '../../types.ts';

export abstract class tGQLBase<tGQLType extends tGQLBaseTypeAny, TypescriptType, GraphQLType extends GraphQLTypes> {
	abstract readonly _class: string;
	abstract _nullable: boolean;
	declare _type: TypescriptType;
	readonly _graphQLType!: GraphQLType;
	readonly _tGQLType!: tGQLType;
	readonly name: string | undefined;

	_description: string | undefined;

	constructor({ tGQLType, graphQLType, name }: { tGQLType?: tGQLType; graphQLType?: GraphQLTypes; name?: string }) {
		if (tGQLType) this._tGQLType = tGQLType;
		if (graphQLType) this._graphQLType = graphQLType as GraphQLType;
		this.name = name;
	}

	description(description: string): this {
		this._description = description;
		return this;
	}

	_createGraphQLType<Override extends GraphQLNullCheck<GraphQLType>>(overrideType?: Override): GraphQLType {
		return (this._nullable
			? overrideType || this._graphQLType
			: new GraphQLNonNull(overrideType || this._graphQLType)) as unknown as GraphQLType;
	}

	fieldConfig(): any {
		const graphQLType = this._createGraphQLType();
		return {
			type: graphQLType,
			description: this._description,
		};
	}
}
