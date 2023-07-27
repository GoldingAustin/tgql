import type { tGQLBaseTypeAny } from '../../types.ts';
import type { GraphQLType as GraphQLTypes } from 'graphql';

export abstract class tGQLBase<
	tGQLType extends tGQLBaseTypeAny,
	TypescriptType,
	GraphQLType extends GraphQLTypes & { description?: string; deprecationReason?: string }
> {
	abstract readonly _class: string;
	abstract _nullable: boolean;
	declare _type: TypescriptType;
	_graphQLType!: GraphQLType;
	readonly _tGQLType!: tGQLType;
	readonly name: string | undefined;

	_deprecationReason: string | undefined;
	_description: string | undefined;

	constructor({ tGQLType, graphQLType, name }: { tGQLType?: tGQLType; graphQLType: GraphQLTypes; name?: string }) {
		if (tGQLType) this._tGQLType = tGQLType;
		if (graphQLType) this._graphQLType = graphQLType as GraphQLType;
		this.name = name;
	}

	deprecated(reason: string): this {
		this._deprecationReason = reason;
		this._graphQLType.deprecationReason = reason;
		return this;
	}

	description(description: string): this {
		this._description = description;
		this._graphQLType.description = description;
		return this;
	}

	get fieldConfig(): any {
		return {
			type: this._graphQLType,
			description: this._description,
			deprecationReason: this._deprecationReason,
		};
	}
}
