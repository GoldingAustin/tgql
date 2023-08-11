import type { tGQLObject } from '../types-builder/index.ts';
import { tGQLResolver } from '../types-builder/index.ts';
import { SchemaBuilder } from './schema-builder.ts';
import type { ResolverMap, ResolverType } from './types.ts';

export function query<TContext, TSource extends tGQLObject<any, any> = tGQLObject<any, any>>(): tGQLResolver<
	TContext,
	TSource,
	any,
	any,
	'Query'
> {
	return new tGQLResolver('Query');
}

export function mutation<TContext, TSource extends tGQLObject<any, any> = tGQLObject<any, any>>(): tGQLResolver<
	TContext,
	TSource,
	any,
	any,
	'Mutation'
> {
	return new tGQLResolver('Mutation');
}

export function registerResolvers<Resolvers extends ResolverMap<ResolverType>>(
	resolvers: Resolvers
): SchemaBuilder<Resolvers> {
	return new SchemaBuilder(resolvers);
}
