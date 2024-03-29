import type { Builder } from './fragment-builder.ts';
import type { tgql } from '@tgql/server';
import { graphqlStringBuilder } from './graphql-string-builder.ts';

type ResolverClientBuilder<Resolver extends tgql.tGQLResolver<any, any, any, any, any>> = {
	select: Resolver extends tgql.tGQLResolver<any, any, infer Args, infer Return, any>
		? Return extends tgql.tGQLObject<any, any>
			? <Input extends tgql.InferArgs<Args>, Returns extends object>() => Builder<Return, Returns, Input>
			: Return extends true
			? () => Return
			: () => any
		: () => any;
	inputType: tgql.InferArgs<Resolver['_args']>;
	outputType: Resolver extends tgql.tGQLResolver<any, any, any, infer Return, any> ? tgql.Infer<Return> : never;
};

type SchemaBuilderToClient<TSchemaBuilder extends tgql.SchemaBuilder<any>> = {
	query: {
		[TKey in keyof TSchemaBuilder['resolvers'] as TSchemaBuilder['resolvers'][TKey]['type'] extends 'Query'
			? TKey
			: never]: ResolverClientBuilder<TSchemaBuilder['resolvers'][TKey]>;
	};
	mutation: {
		[TKey in keyof TSchemaBuilder['resolvers'] as TSchemaBuilder['resolvers'][TKey]['type'] extends 'Mutation'
			? TKey
			: never]: ResolverClientBuilder<TSchemaBuilder['resolvers'][TKey]>;
	};
	types: {
		[TKey in keyof TSchemaBuilder['resolvers'] as TSchemaBuilder['resolvers'][TKey] extends tgql.tGQLResolver<
			any,
			any,
			any,
			infer Ret,
			any
		>
			? Ret['name'] extends string
				? Ret['name']
				: never
			: never]: {
			select: <Input extends object, Returns extends object>(
				name: string
			) => Builder<TSchemaBuilder['resolvers'][TKey]['_returns'], Returns, Input>;
			type: tgql.Infer<TSchemaBuilder['resolvers'][TKey]['_returns']>;
		};
	};
};

const resolverToBuilder = <Resolver extends tgql.tGQLResolver<any, any, any, any, any>, Name extends string>(
	resolver: Resolver,
	name: Name
) => {
	return {
		select: () =>
			graphqlStringBuilder(resolver._returns, {
				type: resolver.type,
				name,
				args: resolver._args,
				fieldArgs: {},
			}) as any,
	};
};
function createResolverBuilderToClient<Resolvers extends tgql.ResolverMap<tgql.ResolverType>>(resolvers: Resolvers) {
	const obj: any = {
		query: {},
		mutation: {},
		// subscription: {},
		types: {},
	};
	for (const key in resolvers) {
		const resolver = resolvers[key];
		if (resolver.type === 'Mutation') obj.mutation[key] = resolverToBuilder(resolver, key);
		// else if (resolver.type === 'Subscription') obj.subscription[key] = resolverToClient(resolver);
		else obj.query[key] = resolverToBuilder(resolver, key);
		if (resolver._returns?.name) {
			obj.types[resolver._returns.name] = {
				select: <Name extends string>(name: Name) =>
					graphqlStringBuilder(resolver._returns, {
						type: 'Fragment',
						name: name,
						onName: resolver._returns.name,
						fieldArgs: {},
					}),
			};
		}
	}

	return obj;
}

export const createClient = <TSchemaBuilder extends tgql.SchemaBuilder<any>>(schemaBuilder: TSchemaBuilder) => {
	return createResolverBuilderToClient(schemaBuilder.resolvers) as SchemaBuilderToClient<TSchemaBuilder>;
};
