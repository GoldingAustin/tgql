import type { GraphQLNullCheck, Infer, tGQLBaseTypeAny } from '../types.ts';
import { tGQLBase } from './index.ts';

export class tGQLNullableBase<tGQLType extends tGQLBaseTypeAny> extends tGQLBase<
	tGQLType,
	Infer<tGQLType> | undefined,
	tGQLType['_graphQLType']['ofType']
> {
	override _nullable = true;

	constructor(tGQLType: tGQLType) {
		super({
			tGQLType,
			graphQLType: tGQLType._graphQLType as GraphQLNullCheck<tGQLType['_graphQLType']>,
			name: tGQLType.name as string,
		});
		this._tGQLType._nullable = true;
	}

	override fieldConfig(nullable?: boolean): any {
		return this._tGQLType.fieldConfig();
	}

	override _createGraphQLType() {
		return this._tGQLType._createGraphQLType();
	}
}

export class tGQLNullable<tGQLType extends tGQLBaseTypeAny> extends tGQLNullableBase<tGQLType> {
	defaultValue(value: Infer<tGQLType>) {
		const input = new tGQLNullableWithDefault(this._tGQLType);
		input._defaultValue = value;
		return input;
	}
}

export class tGQLNullableWithDefault<tGQLType extends tGQLBaseTypeAny> extends tGQLNullableBase<tGQLType> {
	declare _type: Infer<tGQLType>;
	_defaultValue!: Infer<tGQLType>;

	override fieldConfig(nullable?: boolean): any {
		return { ...super.fieldConfig(), defaultValue: this._defaultValue };
	}
}
