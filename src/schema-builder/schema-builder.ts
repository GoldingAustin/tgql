import { GraphQLTypeMap } from '../types.ts';
import { ResolverMap, ResolverType } from './types.ts';
import { GraphQLObjectType } from 'graphql';
import { GraphQLSchema } from 'graphql';

export class SchemaBuilder {
	private graphqlTypeMap: GraphQLTypeMap = {};
	private graphqlInputTypeMap: GraphQLTypeMap = {};

	private createResolverMap(name: ResolverType, resolvers: ResolverMap<ResolverType>) {
		const entries = Object.entries(resolvers);
		if (entries.length) {
			return new GraphQLObjectType({
				name,
				fields: Object.fromEntries(
					entries.map(([key, builder]) => [key, builder.build(this.graphqlTypeMap, this.graphqlInputTypeMap)]),
				),
			});
		}
	}

	public createSchema<Resolvers extends ResolverMap<ResolverType>>(resolvers: Resolvers): GraphQLSchema {
		const queries: ResolverMap<ResolverType> = {};
		const mutations: ResolverMap<ResolverType> = {};
		for (const [key, builder] of Object.entries(resolvers)) {
			if (builder.type === 'Query') {
				queries[key] = builder;
			} else if (builder.type === 'Mutation') {
				mutations[key] = builder;
			}
		}
		const gqlResolvers: {
			query: GraphQLObjectType | undefined;
			mutation?: GraphQLObjectType | undefined;
		} = {
			query: this.createResolverMap('Query', queries),
			mutation: this.createResolverMap('Mutation', mutations),
		};
		return new GraphQLSchema(gqlResolvers);
	}
}
