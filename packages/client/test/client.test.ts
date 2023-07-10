import { createClient } from '../src';
import { tgql } from '../../server';
import { describe, expect, test } from 'bun:test';

const Food = tgql
	.object('Food', {
		ttt: tgql.string(),
		id: tgql.id(),
		name: tgql.string(),
		calories: tgql.int(),
	})
	.fieldResolvers((builder) => ({
		servings: builder.fieldResolver(
			tgql.int(),
			{ portions: tgql.int() },
			(food, { portions }) => food.calories * portions
		),
	}));

const Meal = tgql.object('Meal', {
	id: tgql.id(),
	name: tgql.string().nullable(),
	test: tgql.list(tgql.string()),
	foods: tgql.list(Food),
});

const Colors = tgql.enum('Colors', ['red', 'blue', 'green'] as const);
const User = tgql
	.object('User', {
		id: tgql.id().deprecated('test deprecated'),
		firstName: tgql.string(),
		lastName: tgql.string(),
		age: tgql.int(),
		weight: tgql.float().nullable(),
		favoriteNumbers: tgql.list(tgql.int()),
		color: Colors,
		favoriteMeals: tgql.list(Meal).nullable(),
	})
	.fieldResolvers((builder) => ({
		fullName: builder.fieldResolver(
			tgql.string().nullable(),
			{ middle: tgql.string() },
			(user, { middle }) => `${user.firstName} ${user.lastName} ${middle}`
		),
	}));

const Vehicle = tgql.interface('Vehicle', {
	color: tgql.string(),
	brand: tgql.string(),
});

const ElectricCar = Vehicle.implement('ElectricCar', {
	batteryCapacity: tgql.float(),
});

const Node = tgql.interface('Node', {
	id: tgql.id(),
});
const GasCar = tgql
	.object('GasCar', {
		tankCapacity: tgql.float(),
	})
	.extends(Node)
	.extends(Vehicle);
const Cars = tgql.union('Cars', [ElectricCar, GasCar]);

const user = tgql
	.query()
	.deprecated('This is deprecated')
	.returns(User)
	.args({ id: tgql.id() })
	.resolver(async ({ args: { id } }) => {
		return {
			id,
			firstName: 'first',
			lastName: 'last',
			age: 10,
			weight: 10,
			birthdate: new Date(),
			favoriteNumbers: [],
			color: 'red',
			// favoriteFoods: [],
			fullName: 'test',
			// weight: 10
		};
	});

const cars = tgql
	.query()
	.returns(Cars)
	.resolver(async () => {
		return {
			color: 'red',
			brand: 'test',
			batteryCapacity: 10,
		};
	});

const createCar = tgql
	.mutation()
	.returns(Cars)
	.resolver(async () => {
		return {
			color: 'red',
			brand: 'test',
			batteryCapacity: 10,
		};
	});

const tgqlSchema = tgql.registerResolvers({ user, cars, createCar });

const client = createClient(tgqlSchema);

// prettier-ignore
const query = client.query.user
	.build()
	.id
	.weight
	.firstName
	.lastName
	.fullName
	.age
	.favoriteNumbers
	.favoriteMeals(m =>
		m
			.id
			.name
			.foods(f =>
				f
					.name
					.calories
					.servings
			)
	)
	.$end();

// prettier-ignore
const frag = client.types.User
	.buildFragment('UserFragment')
	.id
	.weight
	.firstName
	.fullName
	.favoriteMeals(m =>
		m
			.name
			.id
	)
	.$end();

describe('client tests', () => {
	test('query', () => {
		expect(query.gqlTemplate).toMatch(queryString);
	});

	test('fragment', () => {
		expect(frag.gqlTemplate).toMatch(fragmentString);
	});

	test('create input', () => {
		expect(query.createInput({ id: '1', middle: 'test', portions: 10 })).toEqual({
			id: '1',
			middle: 'test',
			portions: 10,
		});
	});
});

const fragmentString = `fragment UserFragment on User {
	id
	weight
	firstName
	fullName(middle: $middle)
	favoriteMeals {
		name
		id
	}
}`;

const queryString = `query user ($id: ID!, $middle: String!, $portions: Int!) {
	user (id: $id) {
		id
		weight
		firstName
		lastName
		fullName(middle: $middle)
		age
		favoriteNumbers
		favoriteMeals {
			id
			name
			foods {
				name
				calories
				servings(portions: $portions)
			}
		}
	}
}`;
console.log(query.gqlTemplate);
console.log(frag.gqlTemplate);
