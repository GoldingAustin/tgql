import { expect, test, describe } from 'bun:test';
import { tgql } from '../src/index.ts';
import { GraphQLFloat, GraphQLInt, GraphQLNonNull, GraphQLScalarType, GraphQLString, Kind } from 'graphql';
import { tGQLInputObject } from '../src/types-builder';
import { dateScalar, User } from './shared.ts';

describe('tGQL Types', () => {
	test('Scalar Types', () => {
		expect(tgql.string()._createGraphQLType().ofType.name).toBe('String');
		expect(tgql.int()._createGraphQLType().ofType.name).toBe('Int');
		expect(tgql.float()._createGraphQLType().ofType.name).toBe('Float');
		expect(tgql.id()._createGraphQLType().ofType.name).toBe('ID');
		expect(tgql.boolean()._createGraphQLType().ofType.name).toBe('Boolean');

		expect(tgql.string().nullable()._createGraphQLType().name).toBe('String');
		expect(tgql.string().nullable()._createGraphQLType()).toBe(GraphQLString);
		expect(tgql.string().fieldConfig().type).toEqual(new GraphQLNonNull(GraphQLString));
	});

	test('Enum Types', () => {
		const enumType = tgql.enum('TestEnum', ['A', 'B', 'C']);
		expect(enumType.name).toBe('TestEnum');
		expect(
			enumType
				._createGraphQLType()
				.ofType.getValues()
				.map((v) => v.value),
		).toEqual(['A', 'B', 'C']);
	});

	test('Array Types', () => {
		const arrayType = tgql.list(tgql.string());
		expect(arrayType._createGraphQLType().ofType.ofType.ofType.name).toBe('String');
	});

	test('Object Types', () => {
		const User = tgql.object('User', {
			id: tgql.id(),
			firstName: tgql.string(),
			lastName: tgql.string(),
			age: tgql.int().description('Age in years'),
			weight: tgql.float().nullable(),
		});
		expect(User.name).toBe('User');
		expect(User.fields.age._description).toBe('Age in years');
		expect(User.fields.age._createGraphQLType().ofType).toBe(GraphQLInt);
		expect(User.fields.weight._createGraphQLType()).toBe(GraphQLFloat);
		expect(User._createGraphQLType().ofType.name).toBe('User');
		expect(User.nullable()._createGraphQLType().name).toBe('User');

		const UserInput = tgql.inputObject('UserInput', {});
		expect(UserInput._class).toBe('tGQLInputObject');
	});
	test('Object to Input Object', () => {
		const user = User.toInput('UserInput2')
			.extend({ age2: tgql.int() })
			.required(['weight'])
			.exclude(['age'])
			.optional(['firstName'])
			.create();

		expect(Object.entries(user.fields).map(([key, field]) => [key, field._class])).toEqual([
			['id', 'tGQLID'],
			['firstName', 'tGQLNullable'],
			['lastName', 'tGQLString'],
			['weight', 'tGQLFloat'],
			['favoriteNumbers', 'tGQLList'],
			['birthdate', 'tGQLCustomScalar'],
			['age2', 'tGQLInt'],
		]);
	});

	test('Custom Scalar Types', () => {
		const dateType = tgql.scalar(dateScalar);
		const date: tgql.Infer<typeof dateType> = new Date();
		expect(dateType._createGraphQLType().ofType).toBe(dateScalar);
	});
});
