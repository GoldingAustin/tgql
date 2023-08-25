import type { tGQLBaseTypeAny } from '../../types.ts';
import type { GraphQLType as GraphQLTypes } from 'graphql';
import { isNonNullType } from 'graphql';

export abstract class tGQLBase<
	tGQLType extends tGQLBaseTypeAny,
	TypescriptType,
	GraphQLType extends GraphQLTypes & { description?: string; deprecationReason?: string },
	Name extends string = string,
	Class extends string = string
> {
	abstract readonly _class: Class;
	abstract _nullable: boolean;
	declare _type: TypescriptType;
	_graphQLType!: GraphQLType;
	readonly _tGQLType!: tGQLType;
	readonly name: Name | undefined;

	_deprecationReason: string | undefined;
	_description: string | undefined;

	constructor({ tGQLType, graphQLType, name }: { tGQLType?: tGQLType; graphQLType: GraphQLTypes; name?: Name }) {
		if (tGQLType) this._tGQLType = tGQLType;
		if (graphQLType) this._graphQLType = graphQLType as GraphQLType;
		this.name = name;
	}

	deprecated(reason: string): this {
		this._deprecationReason = reason;
		const baseGQLType = getBaseGQLType(this);
		if (baseGQLType && 'deprecationReason' in baseGQLType) baseGQLType.deprecationReason = reason;
		return this;
	}

	description(description: string): this {
		this._description = description;
		const baseGQLType = getBaseGQLType(this);
		if (baseGQLType && 'description' in baseGQLType) baseGQLType.description = description;
		return this;
	}

	public get fieldConfig(): any {
		return {
			type: this._graphQLType,
			description: this._description,
			deprecationReason: this._deprecationReason,
		};
	}
}

export const getBaseGQLType = <T extends tGQLBase<any, any, any, any, any>, ReturnType extends GraphQLTypes>(
	tGQLType: T
): ReturnType | undefined => {
	if (!tGQLType._graphQLType) return undefined;
	if (isNonNullType(tGQLType._graphQLType)) return tGQLType._graphQLType.ofType as ReturnType;
	else return tGQLType._graphQLType;
};
