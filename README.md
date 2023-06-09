[![Tree shaking support][badge-tree-shaking]][link-bundlephobia]
[![Compressed package size][badge-size]][link-bundlephobia]

# tGQL

## Description

tGQL is a TypeScript-first GraphQL schema builder heavily inspired by tRPC and Zod (and
drizzle).

## Example

Look in the `packages/server/tests` folder for more examples.

### Define types

```typescript
import { tgql } from 'tgql';

const Food = tgql.object('Food', {
	id: tgql.id(),
	name: tgql.string(),
	calories: tgql.int().nullable(),
});

const User = tgql
	.object('User', {
		id: tgql.id(),
		firstName: tgql.string(),
		lastName: tgql.string(),
		age: tgql.int().description('Age in years'),
		weight: tgql.float().nullable(),
		favoriteFoods: tgql.list(Food).nullable(),
	})
	.fieldResolvers((builder) => ({
		fullName: builder.fieldResolver(tgql.string(), (user) => `${user.firstName} ${user.lastName}`),
	}));

type UserType = tgql.Infer<typeof User>;
/**
 *  {
 *    weight?: number | undefined;
 *    favoriteFoods?: {
 *      calories?: number | undefined;
 *      id: string;
 *      name: string;
 *    }[] | undefined;
 *    id: string;
 *    firstName: string;
 *    lastName: string;
 *    age: number;
 *    fullName: string;
 *  }
 */
```

### Define queries

```typescript
const user = tgql
	.query<{ currentUser: string }>()
	.returns(User)
	.args({ id: tgql.id() })
	.resolver(async ({ args: { id }, context }) => {
		return {
			id,
			firstName: 'first',
			lastName: 'last',
			age: 10,
			favoriteNumbers: [1, 2],
		};
	});

const schema = tgql.registerResolvers({ user }).createSchema();
```

## Progress

- [x] objects
- [x] arrays
- [x] enums
- [x] input objects
- [x] scalars
- [x] queries
- [x] mutations
- [x] field resolvers
- [x] type inference
- [x] simple middleware
- [x] basic schema builder
- [x] Add support for custom scalars
- [x] Add object to input object utility
- [x] Add support for unions
- [x] Add support for interfaces

## TODO

- [ ] More documentation & tests
- [ ] Create client methods for tGQL
- [ ] Add support for subscriptions
- [ ] Add support for fragments
- [ ] Better error handling
- [ ] Add support for directives
- [x] Improved resolvers system
- [ ] Update middleware implementation

[badge-size]: https://badgen.net/bundlephobia/minzip/tgql
[badge-tree-shaking]: https://badgen.net/bundlephobia/tree-shaking/tgql
[link-bundlephobia]: https://bundlephobia.com/package/tgql
