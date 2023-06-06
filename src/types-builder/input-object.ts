import type { Expand, tGQLInputTypes, tGQLObjectFieldsBase, UndefinedAsOptional } from '../types.ts';
import { GraphQLInputFieldConfig, GraphQLInputObjectType, GraphQLInputFieldConfigMap } from 'graphql';
import { tGQLObject, tGQLNonNull } from './index.ts';

export class tGQLInputObject<InputFields extends Record<string, tGQLInputTypes>> extends tGQLNonNull<
	tGQLInputObject<InputFields>,
	Expand<UndefinedAsOptional<InputFields>>,
	GraphQLInputObjectType
> {
	declare name: string;

	constructor(name: string, public fields: InputFields) {
		super({ name });
	}

	private get builtFields(): GraphQLInputFieldConfigMap {
		const fields: GraphQLInputFieldConfigMap = {};
		for (const [key, tGQLType] of Object.entries(this.fields)) {
			if (tGQLType instanceof tGQLObject) {
				throw new Error(`Cannot use output type ${tGQLType.name} in input object`);
			}
			fields[key] = tGQLType.fieldConfig() as unknown as GraphQLInputFieldConfig;
		}
		return fields;
	}

	override _createGraphQLType() {
		return super._createGraphQLType(
			new GraphQLInputObjectType({ name: this.name, fields: this.builtFields, description: this._description }),
		);
	}
}
