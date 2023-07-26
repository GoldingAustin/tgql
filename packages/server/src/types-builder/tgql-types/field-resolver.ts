import type { ArgsInput, InferArgs } from '../../schema-builder/types.ts';
import type { Infer, tGQLBaseTypeAny, tGQLOutputTypes } from '../../types.ts';
import { tGQLNonNull } from '../index.ts';
import type { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap, GraphQLOutputType } from 'graphql';

export class tGQLFieldResolver<
	tGQLType extends tGQLOutputTypes,
	Args extends ArgsInput | undefined,
	Parent
> extends tGQLNonNull<tGQLType, Infer<tGQLType>, GraphQLOutputType> {
	override readonly _class = 'tGQLFieldResolver' as const;

	constructor(
		tGQLType: tGQLType,
		public resolver: (parent: Parent, args: Args, context: any) => Infer<tGQLType>,
		private readonly _args: Args
	) {
		super({ tGQLType, graphQLType: undefined as any });
	}

	get fieldConfig(): Partial<GraphQLFieldConfig<any, any>> {
		return {
			type: (this._tGQLType as tGQLBaseTypeAny)._graphQLType,
			resolve: this.resolver,
			args: this._args
				? (Object.fromEntries(
						Object.entries(this._args).map(([key, tGQLType]) => [key, tGQLType.fieldConfig])
				  ) as GraphQLFieldConfigArgumentMap)
				: undefined,
		};
	}
}

export class FieldResolverBuilder<TContext, tGQLType extends tGQLBaseTypeAny> extends tGQLNonNull<
	tGQLType,
	Infer<tGQLType> | undefined,
	tGQLType['_graphQLType']
> {
	override readonly _class = 'FieldResolverBuilder' as const;

	fieldResolver<ReturnType extends tGQLOutputTypes>(
		returnType: ReturnType,
		resolver: (value: Infer<tGQLType>, args: undefined, context: TContext) => Infer<ReturnType>
	): tGQLFieldResolver<ReturnType, ArgsInput | undefined, Infer<tGQLType>>;
	fieldResolver<ReturnType extends tGQLOutputTypes, Args extends ArgsInput>(
		returnType: ReturnType,
		args: Args,
		resolver: (value: Infer<tGQLType>, args: InferArgs<Args>, context: TContext) => Infer<ReturnType>
	): tGQLFieldResolver<ReturnType, Args, Infer<tGQLType>>;
	fieldResolver<ResolveType extends tGQLOutputTypes, Args extends ArgsInput>(
		type: ResolveType,
		args: Args | ((value: Infer<tGQLType>) => Infer<ResolveType>),
		resolver?: (value: Infer<tGQLType>, args: Args, context: TContext) => Infer<ResolveType>
	): tGQLFieldResolver<ResolveType, Args, Infer<tGQLType>> {
		return resolver
			? new tGQLFieldResolver(type, resolver, args as Args)
			: new tGQLFieldResolver(type, args as (value: Infer<this>) => Infer<ResolveType>, undefined as any);
	}
}
