import { tGQLObject } from '../types-builder';
import { ResolverBuilder } from './resolver-builder.ts';
import { SchemaBuilder } from './schema-builder.ts';
import { ResolverMap, ResolverType } from './types.ts';
import { GraphQLSchema } from 'graphql/index';

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

export function createSchema<Resolvers extends ResolverMap<ResolverType>>(resolvers: Resolvers): GraphQLSchema {
	return new SchemaBuilder().createSchema(resolvers);
}
