import type { tGQLObject } from '../types-builder/index.ts';
import { ResolverBuilder } from './resolver-builder.ts';
import { SchemaBuilder } from './schema-builder.ts';
import type { ResolverMap, ResolverType } from './types.ts';

export function query<TContext, TSource extends tGQLObject<any> = tGQLObject<any>>(): ResolverBuilder<
	TContext,
	TSource,
	any,
	any,
	'Query'
> {
	return new ResolverBuilder('Query');
}

export function mutation<TContext, TSource extends tGQLObject<any> = tGQLObject<any>>(): ResolverBuilder<
	TContext,
	TSource,
	any,
	any,
	'Mutation'
> {
	return new ResolverBuilder('Mutation');
}

export function registerResolvers<Resolvers extends ResolverMap<ResolverType>>(
	resolvers: Resolvers
): SchemaBuilder<Resolvers> {
	return new SchemaBuilder(resolvers);
}
