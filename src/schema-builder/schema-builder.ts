import { type GraphQLFieldConfigMap, GraphQLInputFieldMap, GraphQLObjectType } from 'graphql';
import type { tGQLObject } from '../types-builder';
import { ResolverBuilder } from './resolver-builder.ts';
import { GraphQLSchema } from 'graphql';

export class SchemaBuilder<TContext> {
	private queries: Record<string, ResolverBuilder<TContext, any, any, any>> = {};
	private mutations: Record<string, ResolverBuilder<TContext, any, any, any>> = {};
	private graphqlTypeMap: GraphQLFieldConfigMap<any, any> = {};
	private graphqlInputTypeMap: GraphQLInputFieldMap = {};

	query<TSource extends tGQLObject<any>>(name: string): ResolverBuilder<TContext, TSource, any, any> {
		this.queries[name] = new ResolverBuilder<TContext, TSource, any, any>(name);
		return this.queries[name];
	}

	mutation<TSource extends tGQLObject<any>>(name: string): ResolverBuilder<TContext, TSource, any, any> {
		this.mutations[name] = new ResolverBuilder<TContext, TSource, any, any>(name);
		return this.mutations[name];
	}

	private createResolverMap(name: 'Query' | 'Mutation') {
		const entries = Object.entries(name === 'Query' ? this.queries : this.mutations);
		if (entries.length) {
			return new GraphQLObjectType({
				name,
				fields: Object.fromEntries(
					entries.map(([key, builder]) => [key, builder.build(this.graphqlTypeMap, this.graphqlInputTypeMap)]),
				),
			});
		}
	}

	public createSchema(): GraphQLSchema {
		const gqlResolvers: { query: GraphQLObjectType | undefined; mutation?: GraphQLObjectType | undefined } = {
			query: this.createResolverMap('Query'),
			mutation: this.createResolverMap('Mutation'),
		};
		return new GraphQLSchema(gqlResolvers);
	}
}
