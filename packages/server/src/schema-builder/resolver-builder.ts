import type { tGQLObject } from '../types-builder/index.ts';
import type { tGQLOutputTypes } from '../types.ts';
import type { ArgsInput, InferArgs, InferResolverReturn, Middleware, Resolver, ResolverType } from './types.ts';
import type { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap, GraphQLFieldResolver } from 'graphql';

export class ResolverBuilder<
	TContext,
	TSource extends tGQLObject<any, any>,
	TArgs extends ArgsInput,
	TResult extends tGQLOutputTypes,
	Type extends ResolverType
> {
	private _name: string | undefined;

	private _description: string | undefined;
	private _deprecationReason: string | undefined;
	_returns: TResult | undefined;
	_args: TArgs = {} as TArgs;

	private _resolver?: Resolver<TContext, TSource, TArgs, TResult>;
	private _middleware: Middleware<TContext, TResult, TArgs, TSource>[] = [];

	constructor(readonly type: Type) {}

	public description(description: string): this {
		this._description = description;
		return this;
	}

	public deprecated(reason: string): this {
		this._deprecationReason = reason;
		return this;
	}

	public middleware(
		middleware: Middleware<TContext, TResult, TArgs, TSource> | Middleware<TContext, TResult, TArgs, TSource>[]
	): this {
		this._middleware = Array.isArray(middleware) ? middleware : [middleware];
		return this;
	}

	public resolver<Source extends TSource>(
		resolverFn: Resolver<TContext, Source, TArgs, TResult>
	): ResolverBuilder<TContext, Source, TArgs, TResult, Type> {
		this._resolver = resolverFn;
		return this as ResolverBuilder<TContext, Source, TArgs, TResult, Type>;
	}

	public returns<Result extends tGQLOutputTypes>(
		returnType: Result
	): ResolverBuilder<TContext, TSource, TArgs, Result, Type> {
		this._returns = returnType as any;
		return this as unknown as ResolverBuilder<TContext, TSource, TArgs, Result, Type>;
	}

	public args<Args extends TArgs>(args: Args): ResolverBuilder<TContext, TSource, Args, TResult, Type> {
		this._args = args;
		return this as unknown as ResolverBuilder<TContext, TSource, Args, TResult, Type>;
	}

	private graphqlArgMap(): GraphQLFieldConfigArgumentMap {
		const builtArgs: GraphQLFieldConfigArgumentMap = {};
		if (this._args) {
			for (const [key, gqlType] of Object.entries(this._args)) {
				builtArgs[key] = gqlType.fieldConfig;
			}
		}
		return builtArgs;
	}

	private returnType(): GraphQLFieldConfig<any, any> {
		let returnType: GraphQLFieldConfig<any, any> | undefined;
		if (this._returns?.name) {
			returnType = this._returns.fieldConfig as GraphQLFieldConfig<any, any>;
		} else if (this._returns?._class === 'tGQLList' && this._returns._tGQLType?.name) {
			returnType = this._returns.fieldConfig as GraphQLFieldConfig<any, any>;
		} else {
			throw new Error(`No return type specified for resolver ${this._name}`);
		}

		return returnType;
	}

	private createResolverFn(
		globalMiddleware: Middleware<any, any, any, any>[] = []
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
		globalMiddleware: Middleware<any, any, any, any>[] = []
	): GraphQLFieldConfig<TSource, TContext, InferArgs<TArgs>> {
		return {
			type: this.returnType().type,
			args: this.graphqlArgMap(),
			resolve: this.createResolverFn(globalMiddleware),
			description: this._description,
			deprecationReason: this._deprecationReason,
		};
	}
}
