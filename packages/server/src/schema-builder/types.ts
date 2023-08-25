import type { tGQLNullable, tGQLObject, tGQLList, tGQLResolver } from '../types-builder/index.ts';
import type { Expand, Infer, tGQLBaseTypeAny, tGQLInputTypes, tGQLOutputTypes, UndefinedAsOptional } from '../types.ts';
import type { GraphQLResolveInfo } from 'graphql';

export type ArgsInput = Record<string, tGQLInputTypes>;

export type InferArgs<Args extends ArgsInput> = Expand<UndefinedAsOptional<Args>>;

export type ResolverReturnType<T extends Record<string, tGQLBaseTypeAny>> = Expand<
	UndefinedAsOptional<T, tGQLResolver<any, any, any, any, any> | tGQLNullable<any>>
>;
export type InferResolverReturn<T extends tGQLOutputTypes> = T extends tGQLObject<infer R, any>
	? ResolverReturnType<R>
	: T extends tGQLList<infer R extends tGQLOutputTypes>
	? InferResolverReturn<R>[]
	: Infer<T>;

export type ResolverType = 'Query' | 'Mutation';

export type ResolverMap<Type extends ResolverType> = Record<string, tGQLResolver<any, any, any, any, Type>>;

export type Resolver<
	TContext,
	TSource extends tGQLObject<any, any>,
	TArgs extends ArgsInput,
	TResult extends tGQLOutputTypes
> = (params: {
	source: Infer<TSource>;
	args: InferArgs<TArgs>;
	context: TContext;
	info: GraphQLResolveInfo;
}) => Promise<InferResolverReturn<TResult>>;

export type Middleware<
	TContext,
	TResult extends tGQLOutputTypes,
	TArgs extends ArgsInput,
	TSource extends tGQLObject<any, any>
> = Resolver<TContext, TSource, TArgs, TResult>;
