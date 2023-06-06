import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';
import { FieldResolverBuilder, tGQLFieldResolver } from './field-resolver.ts';
import type { Expand, Infer, tGQLOutputTypes, UndefinedAsOptional } from '../types.ts';
import { tGQLObjectFieldsBase } from '../types.ts';
import { ArgsInput } from '../schema-builder/types.ts';
import { tGQLNonNull } from './index.ts';

export class tGQLObject<Fields extends tGQLObjectFieldsBase<tGQLOutputTypes>,> extends tGQLNonNull<
	tGQLObject<Fields>,
	Expand<UndefinedAsOptional<Fields>>,
	GraphQLObjectType
> {
	declare name: string;

	private resolvers?: (builder: FieldResolverBuilder<this>) => Record<string, tGQLFieldResolver<any, any, any>>;

	constructor(name: string, public fields: Fields) {
		super({ name });
	}

	private get builtFields(): GraphQLFieldConfigMap<any, any> {
		const fields: GraphQLFieldConfigMap<any, any> = {};
		for (const [key, tGQLType] of Object.entries(this.fields)) {
			fields[key] = tGQLType.fieldConfig() as unknown as GraphQLFieldConfig<any, any>;
		}
		if (this.resolvers) {
			const resolvers = this.resolvers(this as unknown as FieldResolverBuilder<this>);
			for (const [key, resolver] of Object.entries(resolvers)) {
				fields[key] = resolver.fieldConfig() as unknown as GraphQLFieldConfig<any, any>;
			}
		}
		return fields;
	}

	override _createGraphQLType() {
		return super._createGraphQLType(
			new GraphQLObjectType({ name: this.name, fields: this.builtFields, description: this._description }),
		);
	}

	public fieldResolvers<FieldReturn extends Record<string, tGQLFieldResolver<tGQLOutputTypes, any, any>>>(
		fields: (builder: FieldResolverBuilder<this>) => FieldReturn,
	) {
		this.resolvers = fields;
		// TODO: Figure out why this is the only way to get the type to work
		return this as unknown as tGQLObject<{ [K in keyof (Fields & FieldReturn)]: (Fields & FieldReturn)[K] }>;
	}
	private fieldResolver<ResolveType extends tGQLOutputTypes, Args extends ArgsInput>(
		type: ResolveType,
		args: Args | ((value: Infer<this>) => Infer<ResolveType>),
		resolver?: (value: Infer<this>, args: Args) => Infer<ResolveType>,
	): tGQLFieldResolver<ResolveType, Args, Infer<this>> {
		return resolver
			? new tGQLFieldResolver(type, resolver, args as Args)
			: new tGQLFieldResolver(type, args as (value: Infer<this>) => Infer<ResolveType>);
	}

	// public toInput(name: string): tGQLInputObject<InputFields> {
	// 	return new tGQLInputObject<InputFields>(name || this.name, this.fields);
	// }
}
