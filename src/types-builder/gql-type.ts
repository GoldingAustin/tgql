import { GraphQLNonNull, GraphQLType as GraphQLTypes } from 'graphql';
import { tGQLNullable } from './index.ts';
import type { tGQLBaseTypeAny, GraphQLNullCheck } from '../types.ts';

export abstract class tGQLBase<tGQLType extends tGQLBaseTypeAny, TypescriptType, GraphQLType extends GraphQLTypes> {
	declare _type: TypescriptType;
	_nullable = false;
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

export class tGQLNonNull<
	tGQLType extends tGQLBaseTypeAny,
	TypescriptType,
	GraphQLType extends GraphQLTypes,
> extends tGQLBase<tGQLType, TypescriptType, GraphQLNonNull<GraphQLType>> {
	nullable(): tGQLNullable<this> {
		return new tGQLNullable<this>(this);
	}
}
