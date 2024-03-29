import { tGQLNonNull } from '../index.ts';
import { GraphQLEnumType } from 'graphql';
import type { GraphQLEnumValueConfigMap } from 'graphql';

export class tGQLEnum<InputType extends string[] | readonly string[], Name extends string> extends tGQLNonNull<
	tGQLEnum<InputType, Name>,
	InputType[number],
	GraphQLEnumType
> {
	override readonly _class = 'tGQLEnum' as const;
	declare name: Name;

	constructor(name: string, public values: InputType) {
		const _values: GraphQLEnumValueConfigMap = {};

		for (const value of values) {
			_values[value] = { value };
		}
		super({
			name,
			graphQLType: new GraphQLEnumType({
				name: name,
				values: _values,
			}),
		});
		this.values = values;
	}
}
