import type { ResolverMap, ResolverType } from './types.ts';
import { GraphQLObjectType } from 'graphql';
import { GraphQLSchema } from 'graphql';

export class SchemaBuilder<Resolvers extends ResolverMap<ResolverType>> {
	public graphQLSchema!: GraphQLSchema;
	constructor(public resolvers: Resolvers) {
		this.resolvers = resolvers;
		this.createSchema();
	}

	private createResolverMap(name: ResolverType, resolvers: ResolverMap<ResolverType>) {
		const entries = Object.entries(resolvers);
		if (entries.length) {
			return new GraphQLObjectType({
				name,
				fields: Object.fromEntries(entries.map(([key, builder]) => [key, builder.build()])),
			});
		}
	}

	public createSchema() {
		const queries: ResolverMap<ResolverType> = {};
		const mutations: ResolverMap<ResolverType> = {};
		for (const [key, builder] of Object.entries(this.resolvers)) {
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
		this.graphQLSchema = new GraphQLSchema(gqlResolvers);
	}
}
