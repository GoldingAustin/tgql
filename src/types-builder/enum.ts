import { GraphQLEnumType } from 'graphql';
import type { GraphQLEnumValueConfigMap } from 'graphql/type/definition';

import { tGQLNonNull } from './base/non-null.ts';

export class tGQLEnum<InputType extends string[] | readonly string[]> extends tGQLNonNull<
	tGQLEnum<InputType>,
	InputType[number],
	GraphQLEnumType
> {
	override readonly _class = 'tGQLEnum' as const;
	declare name: string;

	constructor(name: string, private readonly values: InputType) {
		super({ name });
	}

	private get valuesMap(): GraphQLEnumValueConfigMap {
		const values: GraphQLEnumValueConfigMap = {};
		for (const value of this.values) {
			values[value] = { value };
		}
		return values;
	}

	override _createGraphQLType() {
		return super._createGraphQLType(
			new GraphQLEnumType({
				name: this.name,
				values: this.valuesMap,
				description: this._description,
			}),
		);
	}
}
