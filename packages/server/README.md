[![Tree shaking support][badge-tree-shaking]][link-bundlephobia]
[![Compressed package size][badge-size]][link-bundlephobia]

# tGQL Server

## Description

tGQL Server is a TypeScript-first GraphQL schema builder heavily inspired by tRPC and Zod (and
drizzle).

## Example

Look in the `tests` folder for more examples.

### Define types

```typescript
import { tgql } from '@tgql/server';

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

[badge-size]: https://badgen.net/bundlephobia/minzip/@tgql/server
[badge-tree-shaking]: https://badgen.net/bundlephobia/tree-shaking/@tgql/server
[link-bundlephobia]: https://bundlephobia.com/package/@tgql/server
