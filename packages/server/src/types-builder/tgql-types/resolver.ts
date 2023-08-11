import type { tGQLObject } from '../index.ts';
import { tGQLNonNull } from '../index.ts';
import type { Infer, tGQLOutputTypes } from '../../types.ts';
import type {
	ArgsInput,
	InferArgs,
	InferResolverReturn,
	Middleware,
	Resolver,
	ResolverType,
} from '../../schema-builder/types.ts';
import type { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap, GraphQLFieldResolver } from 'graphql';
import type { GraphQLNonNull } from 'graphql';
import { getBaseGQLType } from '../base/gql-type.ts';

export class tGQLResolver<
	TContext,
	TSource extends tGQLObject<any, any>,
	TArgs extends ArgsInput,
	TResult extends tGQLOutputTypes,
	Type extends ResolverType,
	Name extends string = string
> extends tGQLNonNull<TResult, Infer<TResult>, GraphQLNonNull<any>> {
	override readonly _class = 'tGQLResolver' as const;

	declare name: Name;

	_returns: TResult | undefined;
	_args: TArgs = {} as TArgs;

	private _resolver?: Resolver<TContext, TSource, TArgs, TResult>;
	private _middleware: Middleware<TContext, TResult, TArgs, TSource>[] = [];

	constructor(readonly type: Type) {
		super({ graphQLType: undefined as any });
	}

	public middleware(
		middleware: Middleware<TContext, TResult, TArgs, TSource> | Middleware<TContext, TResult, TArgs, TSource>[]
	): this {
		this._middleware = Array.isArray(middleware) ? middleware : [middleware];
		return this;
	}

	public resolver<Source extends TSource>(
		resolverFn: Resolver<TContext, Source, TArgs, TResult>
	): tGQLResolver<TContext, Source, TArgs, TResult, Type> {
		this._resolver = resolverFn;
		return this as tGQLResolver<TContext, Source, TArgs, TResult, Type>;
	}

	public returns<Result extends tGQLOutputTypes>(
		returnType: Result
	): tGQLResolver<TContext, TSource, TArgs, Result, Type> {
		this._returns = returnType as any;
		if ('_graphQLType' in returnType) this._graphQLType = (returnType as any)._graphQLType;
		const baseType = getBaseGQLType(this);
		if (baseType) {
			if (this._deprecationReason && 'deprecationReason' in baseType)
				baseType.deprecationReason = this._deprecationReason;
			if (this._description && 'description' in baseType) baseType.description = this._description;
		}
		return this as unknown as tGQLResolver<TContext, TSource, TArgs, Result, Type>;
	}

	public args<Args extends TArgs>(args: Args): tGQLResolver<TContext, TSource, Args, TResult, Type> {
		this._args = args;
		return this as unknown as tGQLResolver<TContext, TSource, Args, TResult, Type>;
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
		if (this._returns?._class === 'tGQLList' && this._returns._tGQLType?.name) {
			returnType = this._returns.fieldConfig as GraphQLFieldConfig<any, any>;
		} else if (this._returns) {
			returnType = this._returns.fieldConfig as GraphQLFieldConfig<any, any>;
		} else {
			throw new Error(`No return type specified for resolver ${this.name}`);
		}

		return returnType;
	}

	private createResolverFn(
		globalMiddleware: Middleware<any, any, any, any>[] = []
	): GraphQLFieldResolver<TSource, TContext, InferArgs<TArgs>, Promise<InferResolverReturn<TResult>>> {
		const resolverFn = this._resolver;
		const middlewareList: Middleware<any, any, any, any>[] = [...this._middleware, ...globalMiddleware];

		if (!resolverFn) {
			throw new Error(`No resolver function specified for resolver ${this.name}`);
		}
		return async (source, args, context, info) => {
			for (const middleware of middlewareList) {
				await middleware({ source, args, context, info });
			}
			return resolverFn({ source, args, context, info });
		};
	}

	public override get fieldConfig(): GraphQLFieldConfig<TSource, TContext, InferArgs<TArgs>> {
		return this.build();
	}

	build(
		globalMiddleware: Middleware<any, any, any, any>[] = []
	): GraphQLFieldConfig<TSource, TContext, InferArgs<TArgs>> {
		return {
			type: this.returnType()?.type,
			args: this.graphqlArgMap(),
			resolve: this.createResolverFn(globalMiddleware),
			description: this._description,
			deprecationReason: this._deprecationReason,
		};
	}
}

export class FieldResolverBuilder<TContext, tGQLType extends tGQLObject<any, any>> extends tGQLNonNull<
	tGQLType,
	Infer<tGQLType> | undefined,
	tGQLType['_graphQLType']
> {
	override readonly _class = 'FieldResolverBuilder' as const;

	fieldResolver<TTContext>() {
		return new tGQLResolver<TTContext extends unknown ? TContext : TTContext, tGQLType, any, any, 'Query'>('Query');
	}
}
