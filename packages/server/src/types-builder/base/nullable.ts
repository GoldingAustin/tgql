import type { GraphQLNullCheck, Infer, tGQLBaseTypeAny } from '../../types.ts';
import { tGQLBase } from '../index.ts';

export abstract class tGQLNullableBase<
	tGQLType extends tGQLBaseTypeAny,
	WithDefault extends boolean = false
> extends tGQLBase<
	tGQLType,
	WithDefault extends true ? Infer<tGQLType> : Infer<tGQLType> | undefined,
	GraphQLNullCheck<tGQLType['_graphQLType']>
> {
	override _nullable = true;

	constructor(tGQLType: tGQLType) {
		tGQLType._nullable = true;
		super({
			tGQLType,
			graphQLType: tGQLType._graphQLType.ofType as GraphQLNullCheck<tGQLType['_graphQLType']>,
			name: tGQLType.name as string,
		});
	}

	override get fieldConfig(): any {
		const fieldConf = this._tGQLType.fieldConfig;
		return {
			...fieldConf,
			type: fieldConf.type.ofType,
		};
	}
}

export class tGQLNullable<tGQLType extends tGQLBaseTypeAny> extends tGQLNullableBase<tGQLType> {
	override readonly _class = 'tGQLNullable' as const;
	override _nullable = true;

	defaultValue(value: Infer<tGQLType>) {
		const input = new tGQLNullableWithDefault(this._tGQLType);
		input._defaultValue = value;
		return input;
	}
}

export class tGQLNullableWithDefault<tGQLType extends tGQLBaseTypeAny> extends tGQLNullableBase<tGQLType, true> {
	override readonly _class = 'tGQLNullableWithDefault' as const;
	override _nullable = true;
	_defaultValue!: Infer<tGQLType>;

	override get fieldConfig(): any {
		return {
			...super.fieldConfig,
			defaultValue: this._defaultValue,
		};
	}
}
