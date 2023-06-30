import { GraphQLScalarType, Kind } from 'graphql/index';
import { tgql } from '../src';

export const dateScalar = new GraphQLScalarType({
	name: 'Date',
	description: 'Date custom scalar type',
	serialize(value) {
		if (value instanceof Date) {
			return value.getTime(); // Convert outgoing Date to integer for JSON
		}
		throw Error('GraphQL Date Scalar serializer expected a `Date` object');
	},
	parseValue(value) {
		if (typeof value === 'number') {
			return new Date(value); // Convert incoming integer to Date
		}
		throw new Error('GraphQL Date Scalar parser expected a `number`');
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
			// Convert hard-coded AST string to integer and then to Date
			return new Date(parseInt(ast.value, 10));
		}
		// Invalid hard-coded value (not an integer)
		return null;
	},
});

export const User = tgql
	.object('User', {
		id: tgql.id(),
		firstName: tgql.string(),
		lastName: tgql.string(),
		age: tgql.int(),
		weight: tgql.float().nullable(),
		favoriteNumbers: tgql.list(tgql.int()),
		birthdate: tgql.scalar(dateScalar),
	})
	.fieldResolvers((builder) => ({
		fullName: builder.fieldResolver(tgql.string(), (user) => `${user.firstName} ${user.lastName}`),
		fullMiddleName: builder.fieldResolver(
			tgql.string(),
			{ middle: tgql.string() },
			(user, args) => `${user.firstName} ${user.lastName} ${args.middle}`
		),
	}));
