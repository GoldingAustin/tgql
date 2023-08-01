import { describe, expect, test } from 'bun:test';
import { setupMovieTests } from './movieMocks.ts';
import { graphql, printSchema } from 'graphql';

describe('tGQL Field Resolvers', () => {
	test('field resolvers correctly resolve with context', async () => {
		const { createMocks, createSchema } = setupMovieTests();
		const schema = createSchema();
		const { data } = await graphql({
			schema,
			source: String`			
query Movie {
	movie(id: "cowboys_aliens") {
		id
		title
        studioId
		studio {
			id
			name
		}
	}
}
`,
			contextValue: createMocks(),
		});
		expect(data).toEqual({
			movie: {
				id: 'cowboys_aliens',
				title: 'Cowboys and Aliens',
				studioId: 'universal',
				studio: {
					id: 'universal',
					name: 'Universal Pictures',
				},
			},
		});
	});

	test('deep field resolutions resolve correctly with context', async () => {
		const { createMocks, createSchema } = setupMovieTests();
		const schema = createSchema();
		const { data } = await graphql({
			schema,
			source: String`
	query Movie {
		movie(id: "cowboys_aliens") {
			id
			title
			cast {
				id
				movies {
					id
				}
			}
		}
	}
	`,
			contextValue: createMocks(),
		});
		expect(data).toEqual({
			movie: {
				id: 'cowboys_aliens',
				title: 'Cowboys and Aliens',
				cast: [
					{
						id: 'favreau',
						movies: [
							{
								id: 'cowboys_aliens',
							},
							{
								id: 'iron_man',
							},
						],
					},
					{
						id: 'ford',
						movies: [
							{
								id: 'cowboys_aliens',
							},
						],
					},

					{
						id: 'craige',
						movies: [
							{
								id: 'cowboys_aliens',
							},
						],
					},
				],
			},
		});
	});

	test('schema to be defined as expected', () => {
		const { createSchema } = setupMovieTests();
		const schema = createSchema();
		expect(schema).toBeDefined();
		let expectedSchema = String`
type Query {
  movie(id: ID!): Movie!
  movies: [Movie!]!
  castMember(id: ID!): CastMember!
  cast: [CastMember!]!
  studio(id: ID!): Studio!
  studios: [Studio!]!
}

type Movie {
  id: ID!
  title: String!
  genre: [Genre!]!
  studioId: String!
  releaseYear: Int!
  cast: [CastMember!]!
  studio: Studio!
}

enum Genre {
  SCIENCE_FICTION
  WESTERN
  ACTION
  ADVENTURE
}

type CastMember {
  id: ID!
  name: String!
  birthdate: Date!
  movies: [Movie!]!
}

\"\"\"Date custom scalar type\"\"\"
scalar Date

type Studio {
  id: ID!
  name: String!
}
`;
		expectedSchema = expectedSchema.trim();
		expect(printSchema(schema)).toMatch(expectedSchema);
	});
});
