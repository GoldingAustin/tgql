import type { ArgsInput, InferArgs } from '../../schema-builder/types.ts';
import type { GraphQLTypeMap, Infer, tGQLBaseTypeAny, tGQLOutputTypes } from '../../types.ts';
import { tGQLNonNull } from '../index.ts';
import type { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap, GraphQLOutputType } from 'graphql';

export class tGQLFieldResolver<
	tGQLType extends tGQLOutputTypes,
	Args extends ArgsInput | undefined,
	Parent
> extends tGQLNonNull<tGQLType, Infer<tGQLType>, GraphQLOutputType> {
	private readonly _args: Args | undefined;
	override readonly _class = 'tGQLFieldResolver' as const;

	constructor(tGQLType: tGQLType, public resolver: (parent: Parent, args: Args) => Infer<tGQLType>, args?: Args) {
		super({ tGQLType });
		this._args = args;
	}

	override fieldConfig(graphqlTypeMap?: GraphQLTypeMap): Partial<GraphQLFieldConfig<any, any>> {
		return {
			type: this._tGQLType.fieldConfig(graphqlTypeMap).type,
			resolve: this.resolver,
			args: (this._args
				? Object.fromEntries(
						Object.entries(this._args).map(([key, tGQLType]) => [key, tGQLType.fieldConfig(graphqlTypeMap)])
				  )
				: undefined) as GraphQLFieldConfigArgumentMap,
			description: this._description,
		};
	}
}

export class FieldResolverBuilder<tGQLType extends tGQLBaseTypeAny> extends tGQLNonNull<
	tGQLType,
	Infer<tGQLType> | undefined,
	tGQLType['_graphQLType']['ofType']
> {
	override readonly _class = 'FieldResolverBuilder' as const;

	fieldResolver<ReturnType extends tGQLOutputTypes>(
		returnType: ReturnType,
		resolver: (value: Infer<tGQLType>, args: undefined) => Infer<ReturnType>
	): tGQLFieldResolver<ReturnType, ArgsInput | undefined, Infer<tGQLType>>;
	fieldResolver<ReturnType extends tGQLOutputTypes, Args extends ArgsInput>(
		returnType: ReturnType,
		args: Args,
		resolver: (value: Infer<tGQLType>, args: InferArgs<Args>) => Infer<ReturnType>
	): tGQLFieldResolver<ReturnType, Args, Infer<tGQLType>>;
	fieldResolver<ResolveType extends tGQLOutputTypes, Args extends ArgsInput>(
		type: ResolveType,
		args: Args | ((value: Infer<tGQLType>) => Infer<ResolveType>),
		resolver?: (value: Infer<tGQLType>, args: Args) => Infer<ResolveType>
	): tGQLFieldResolver<ResolveType, Args, Infer<tGQLType>> {
		return resolver
			? new tGQLFieldResolver(type, resolver, args as Args)
			: new tGQLFieldResolver(type, args as (value: Infer<this>) => Infer<ResolveType>);
	}
}
