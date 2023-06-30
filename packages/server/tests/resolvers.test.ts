import { expect, test, describe } from 'bun:test';
import { tgql } from '../src';
import { graphql, printSchema } from 'graphql';
import { User } from './shared.ts';

describe('tGQL Resolvers', () => {
	const birthdate = new Date('2020-01-01');

	test('basic', async () => {
		type Context = { currentUser: string };
		const user = tgql
			.query<Context>()
			.returns(User)
			.args({ id: tgql.id() })
			.resolver(async ({ args: { id }, context }) => {
				expect(context.currentUser).toMatch('Bob 2');
				return {
					id,
					firstName: 'first',
					lastName: 'last',
					age: 10,
					birthdate,
					favoriteNumbers: [1, 2],
				};
			});

		const users = tgql
			.query<Context>()
			.returns(tgql.list(User))
			.resolver(async () => {
				return [
					{
						id: '10',
						firstName: 'first',
						lastName: 'last',
						age: 10,
						birthdate,
						favoriteNumbers: [1, 2],
					},
				];
			});

		const schema = tgql.registerResolvers({ user, users }).createSchema();
		expect(schema).toBeDefined();
		expect(printSchema(schema)).toMatch(expectedSchema);

		const result = await graphql({
			schema,
			source: `
				fragment PartialUser on User {
					id
					favoriteNumbers
					weight
					birthdate
					fullMiddleName(middle: "middle")
				}
			
				query ExampleQuery {
					user(id: "10") {
						...PartialUser
					}
					users {
						...PartialUser
					}
				}`,
			contextValue: { currentUser: 'Bob 2' },
		});

		expect(result.data).toEqual({
			user: {
				id: '10',
				favoriteNumbers: [1, 2],
				weight: null,
				birthdate: birthdate.getTime(),
				fullMiddleName: 'first last middle',
			},
			users: [
				{
					id: '10',
					favoriteNumbers: [1, 2],
					weight: null,
					birthdate: birthdate.getTime(),
					fullMiddleName: 'first last middle',
				},
			],
		});
	});

	test('mutation', () => {
		const UserInput = tgql.inputObject('UserInput', {
			firstName: tgql.string().nullable().defaultValue('Bob'),
			lastName: tgql.string(),
			age: tgql.int(),
			isCool: tgql.boolean(),
			weight: tgql.float(),
		});
		tgql
			.mutation()
			.returns(User)
			.args({ user: UserInput })
			.resolver(async ({ args: { user } }) => {
				return {
					id: 'some-id',
					firstName: user.firstName,
					lastName: user.lastName,
					age: user.age,
					birthdate,
					weight: user.weight,
					favoriteNumbers: [1, 2],
				};
			});
	});

	test('simple middleware', async () => {
		type Context = { currentUser: string };
		const simpleMiddleware: tgql.Middleware<Context, any, any, any> = async ({ context }) => {
			expect(context.currentUser).toMatch('Bob 2');
		};
		const user = tgql
			.query<Context>()
			.returns(User)
			.args({ id: tgql.id() })
			.middleware(simpleMiddleware)
			.resolver(async ({ args: { id } }) => {
				return {
					id,
					firstName: 'first',
					lastName: 'last',
					birthdate,
					age: 10,
					favoriteNumbers: [1, 2],
				};
			});

		const schema = tgql.registerResolvers({ user }).createSchema();
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
  users: [User!]!
}

type User {
  id: ID!
  firstName: String!
  lastName: String!
  age: Int!
  weight: Float
  favoriteNumbers: [Int!]!
  birthdate: Date!
  fullName: String!
  fullMiddleName(middle: String!): String!
}

"""Date custom scalar type"""
scalar Date`;
