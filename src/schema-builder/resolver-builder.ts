import {
	GraphQLFieldConfig,
	GraphQLFieldConfigArgumentMap,
	GraphQLFieldConfigMap,
	GraphQLInputFieldMap,
} from 'graphql';
import type { tGQLObject } from '../types-builder/index.ts';
import type { GraphQLFieldResolver } from 'graphql/type/definition';
import type { ArgsInput, InferArgs, InferResolverReturn, Middleware, Resolver } from './types.ts';
import type { tGQLOutputTypes } from '../types.ts';

export class ResolverBuilder<
	TContext,
	TSource extends tGQLObject<any>,
	TArgs extends ArgsInput,
	TResult extends tGQLOutputTypes,
> {
	private readonly _name: string;
	private _returns: TResult | undefined;
	private _args: TArgs | undefined;

	private _resolver?: Resolver<TContext, TSource, TArgs, TResult>;
	private _middleware: Middleware<TContext, TResult, TArgs, TSource>[] = [];

	constructor(name: string) {
		this._name = name;
	}

	public middleware(
		middleware: Middleware<TContext, TResult, TArgs, TSource> | Middleware<TContext, TResult, TArgs, TSource>[],
	): this {
		this._middleware = Array.isArray(middleware) ? middleware : [middleware];
		return this;
	}

	public resolver<Source extends TSource>(
		resolverFn: Resolver<TContext, Source, TArgs, TResult>,
	): ResolverBuilder<TContext, Source, TArgs, TResult> {
		this._resolver = resolverFn;
		return this as ResolverBuilder<TContext, Source, TArgs, TResult>;
	}

	public returns<Result extends tGQLOutputTypes>(
		returnType: Result,
	): ResolverBuilder<TContext, TSource, TArgs, Result> {
		this._returns = returnType as any;
		return this as unknown as ResolverBuilder<TContext, TSource, TArgs, Result>;
	}

	public args<Args extends TArgs>(args: Args): ResolverBuilder<TContext, TSource, Args, TResult> {
		this._args = args;
		return this as unknown as ResolverBuilder<TContext, TSource, Args, TResult>;
	}

	private graphqlArgMap(graphqlInputTypeMap: GraphQLInputFieldMap): GraphQLFieldConfigArgumentMap {
		const builtArgs: GraphQLFieldConfigArgumentMap = {};
		if (this._args) {
			for (const [key, gqlType] of Object.entries(this._args)) {
				if (!graphqlInputTypeMap[key]) {
					graphqlInputTypeMap[key] = gqlType.fieldConfig();
				}
				builtArgs[key] = graphqlInputTypeMap[key];
			}
		}
		return builtArgs;
	}

	private returnType(gqlTypeMap: Record<string, GraphQLFieldConfig<any, any>>): GraphQLFieldConfig<any, any> {
		let returnType: GraphQLFieldConfig<any, any> | undefined;
		if (this._returns?.name) {
			if (!gqlTypeMap[this._returns.name]) {
				gqlTypeMap[this._returns.name] = this._returns.fieldConfig() as GraphQLFieldConfig<any, any>;
			}
			returnType = gqlTypeMap[this._returns.name];
		} else {
			throw new Error(`No return type specified for resolver ${this._name}`);
		}

		return returnType;
	}

	private createResolverFn(
		globalMiddleware: Middleware<any, any, any, any>[] = [],
	): GraphQLFieldResolver<TSource, TContext, InferArgs<TArgs>, Promise<InferResolverReturn<TResult>>> {
		const resolverFn = this._resolver;
		const middlewareList: Middleware<any, any, any, any>[] = [...this._middleware, ...globalMiddleware];

		if (!resolverFn) {
			throw new Error(`No resolver function specified for resolver ${this._name}`);
		}
		return async (source, args, context, info) => {
			for (const middleware of middlewareList) {
				await middleware({ source, args, context, info });
			}
			return resolverFn({ source, args, context, info });
		};
	}

	build(
		gqlTypeMap: GraphQLFieldConfigMap<any, any>,
		graphqlInputTypeMap: GraphQLInputFieldMap,
		globalMiddleware: Middleware<any, any, any, any>[] = [],
	): GraphQLFieldConfig<TSource, TContext, InferArgs<TArgs>> {
		return {
			type: this.returnType(gqlTypeMap).type,
			args: this.graphqlArgMap(graphqlInputTypeMap),
			resolve: this.createResolverFn(globalMiddleware),
		};
	}
}
