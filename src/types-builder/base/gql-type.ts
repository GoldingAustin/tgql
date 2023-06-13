import type { GraphQLNullCheck, GraphQLTypeMap, tGQLBaseTypeAny } from '../../types.ts';
import { GraphQLNonNull, GraphQLType as GraphQLTypes } from 'graphql';

export abstract class tGQLBase<tGQLType extends tGQLBaseTypeAny, TypescriptType, GraphQLType extends GraphQLTypes> {
	abstract readonly _class: string;
	abstract _nullable: boolean;
	declare _type: TypescriptType;
	readonly _graphQLType!: GraphQLType;
	readonly _tGQLType!: tGQLType;
	readonly name: string | undefined;

	_deprecationReason: string | undefined;
	_description: string | undefined;

	constructor({ tGQLType, graphQLType, name }: { tGQLType?: tGQLType; graphQLType?: GraphQLTypes; name?: string }) {
		if (tGQLType) this._tGQLType = tGQLType;
		if (graphQLType) this._graphQLType = graphQLType as GraphQLType;
		this.name = name;
	}

	deprecated(reason: string): this {
		this._deprecationReason = reason;
		return this;
	}

	description(description: string): this {
		this._description = description;
		return this;
	}

	_createGraphQLType<Override extends GraphQLNullCheck<GraphQLType>>({
		overrideType,
		graphqlTypeMap,
	}: {
		overrideType?: Override;
		graphqlTypeMap?: GraphQLTypeMap;
	} = {}): GraphQLType {
		if (this.name && graphqlTypeMap && graphqlTypeMap[this.name]) {
			return graphqlTypeMap[this.name] as GraphQLType;
		} else {
			const type = (this._nullable
				? overrideType || this._graphQLType
				: new GraphQLNonNull(overrideType || this._graphQLType)) as unknown as GraphQLType;
			if (this.name && graphqlTypeMap) graphqlTypeMap[this.name] = type;
			return type;
		}
	}

	fieldConfig(graphqlTypeMap?: GraphQLTypeMap): any {
		const graphQLType = this._createGraphQLType({ graphqlTypeMap });
		return {
			type: graphQLType,
			description: this._description,
			deprecationReason: this._deprecationReason,
		};
	}
}
