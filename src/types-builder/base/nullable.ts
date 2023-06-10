import type { GraphQLNullCheck, GraphQLTypeMap, Infer, tGQLBaseTypeAny } from '../../types.ts';
import { tGQLBase } from '../index.ts';

export abstract class tGQLNullableBase<tGQLType extends tGQLBase<any, any, any>,> extends tGQLBase<
	tGQLType,
	Infer<tGQLType> | undefined,
	GraphQLNullCheck<tGQLType['_graphQLType']>
> {
	override _nullable = true;
	abstract readonly _class: string;

	constructor(tGQLType: tGQLType) {
		tGQLType._nullable = true;
		super({
			tGQLType,
			graphQLType: tGQLType._graphQLType as GraphQLNullCheck<tGQLType['_graphQLType']>,
			name: tGQLType.name as string,
		});
	}

	override fieldConfig(graphqlTypeMap?: GraphQLTypeMap): any {
		return this._tGQLType.fieldConfig(graphqlTypeMap);
	}

	override _createGraphQLType<Override extends GraphQLNullCheck<tGQLType['_graphQLType']>,>({
		graphqlTypeMap,
		overrideType,
	}: {
		graphqlTypeMap?: GraphQLTypeMap;
		overrideType?: Override;
	} = {}): GraphQLNullCheck<tGQLType['_graphQLType']> {
		if (this.name && graphqlTypeMap && graphqlTypeMap[this.name]) {
			return graphqlTypeMap[this.name] as GraphQLNullCheck<tGQLType['_graphQLType']>;
		} else {
			const type = overrideType || this._tGQLType._createGraphQLType({ graphqlTypeMap });
			if (this.name && graphqlTypeMap) graphqlTypeMap[this.name] = type;
			return type;
		}
	}
}

export class tGQLNullable<tGQLType extends tGQLBaseTypeAny,> extends tGQLNullableBase<tGQLType> {
	override readonly _class = 'tGQLNullable' as const;
	override _nullable = true;

	defaultValue(value: Infer<tGQLType>) {
		const input = new tGQLNullableWithDefault(this._tGQLType);
		input._defaultValue = value;
		return input;
	}
}

export class tGQLNullableWithDefault<tGQLType extends tGQLBaseTypeAny,> extends tGQLNullableBase<tGQLType> {
	override readonly _class = 'tGQLNullableWithDefault' as const;
	override _nullable = true;
	declare _type: Infer<tGQLType>;
	_defaultValue!: Infer<tGQLType>;

	override fieldConfig(graphqlTypeMap?: GraphQLTypeMap): any {
		return {
			...super.fieldConfig(graphqlTypeMap),
			defaultValue: this._defaultValue,
		};
	}
}
