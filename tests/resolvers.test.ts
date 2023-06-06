import { expect, test, describe } from 'bun:test';
import { tgql } from '../src/index.ts';
import { graphql, printSchema } from 'graphql';
import exp from 'constants';

describe('tGQL Resolvers', () => {
	const User = tgql
		.object('User', {
			id: tgql.id(),
			firstName: tgql.string(),
			lastName: tgql.string(),
			age: tgql.int(),
			weight: tgql.float().nullable(),
			favoriteNumbers: tgql.list(tgql.int()),
		})
		.fieldResolvers((builder) => ({
			fullName: builder.fieldResolver(tgql.string(), (user) => `${user.firstName} ${user.lastName}`),
			fullMiddleName: builder.fieldResolver(
				tgql.string(),
				{ middle: tgql.string() },
				(user, args) => `${user.firstName} ${user.lastName} ${args.middle}`,
			),
		}));

	const UserInput = tgql.inputObject('UserInput', {
		firstName: tgql.string().nullable().defaultValue('Bob'),
		lastName: tgql.string(),
		age: tgql.int(),
		isCool: tgql.boolean(),
		weight: tgql.float(),
	});

	test('basic', async () => {
		const resolvers = new tgql.SchemaBuilder<{ currentUser: string }>();

		resolvers
			.query('user')
			.returns(User)
			.args({ id: tgql.id() })
			.resolver(async ({ args: { id }, context }) => {
				expect(context.currentUser).toMatch('Bob 2');
				return {
					id,
					firstName: 'first',
					lastName: 'last',
					age: 10,
					favoriteNumbers: [1, 2],
				};
			});

		const schema = resolvers.createSchema();
		expect(schema).toBeDefined();

		expect(printSchema(schema)).toMatch(expectedSchema);

		const result = await graphql({
			schema,
			source: `query ExampleQuery {
								user(id: "10") {
									id
									favoriteNumbers
									weight
									fullMiddleName(middle: "middle")
								}
							}`,
			contextValue: { currentUser: 'Bob 2' },
		});
		expect(result.data).toEqual({
			user: {
				id: '10',
				favoriteNumbers: [1, 2],
				weight: null,
				fullMiddleName: 'first last middle',
			},
		});
	});

	test('mutation', () => {
		const resolvers = new tgql.SchemaBuilder();

		resolvers
			.mutation('createUser')
			.returns(User)
			.args({ user: UserInput })
			.resolver(async ({ args: { user } }) => {
				return {
					id: 'some-id',
					firstName: user.firstName,
					lastName: user.lastName,
					age: user.age,
					weight: user.weight,
					favoriteNumbers: [1, 2],
				};
			});
	});

	test('simple middleware', async () => {
		type Context = { currentUser: string };
		const resolvers = new tgql.SchemaBuilder<Context>();
		const simpleMiddleware: tgql.Middleware<Context, any, any, any> = async ({context}) => {
			expect(context.currentUser).toMatch('Bob 2');
		}
		resolvers
			.query('user')
			.returns(User)
			.args({ id: tgql.id() })
			.middleware(simpleMiddleware)
			.resolver(async ({ args: { id }, context }) => {
				return {
					id,
					firstName: 'first',
					lastName: 'last',
					age: 10,
					favoriteNumbers: [1, 2],
				};
			});

		const schema = resolvers.createSchema();
		await graphql({
			schema,
			source: `query ExampleQuery {
								user(id: "10") {
									id
									favoriteNumbers
									weight
									fullMiddleName(middle: "middle")
								}
							}`,
			contextValue: { currentUser: 'Bob 2' },
		});
	});
});

const expectedSchema = `type Query {
  user(id: ID!): User!
}

type User {
  id: ID!
  firstName: String!
  lastName: String!
  age: Int!
  weight: Float
  favoriteNumbers: [Int!]!
  fullName: String!
  fullMiddleName(middle: String!): String!
}`;
