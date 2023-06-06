import type { GraphQLOutputType } from 'graphql';
import { type tGQLObject, tGQLNonNull } from './index.ts';
import type { Infer, tGQLOutputTypes } from '../types.ts';
import { ArgsInput, InferArgs } from '../schema-builder/types.ts';

export class tGQLFieldResolver<
	tGQLType extends tGQLOutputTypes,
	Args extends ArgsInput | undefined,
	Parent,
> extends tGQLNonNull<tGQLType, Infer<tGQLType>, GraphQLOutputType> {
	private readonly _args: Args | undefined;

	constructor(tGQLType: tGQLType, public resolver: (parent: Parent, args: Args) => Infer<tGQLType>, args?: Args) {
		super({ tGQLType });
		this._args = args;
	}

	override fieldConfig(): any {
		return {
			type: this._tGQLType.fieldConfig().type,
			resolve: this.resolver,
			args: this._args
				? Object.fromEntries(Object.entries(this._args).map(([key, tGQLType]) => [key, tGQLType.fieldConfig()]))
				: undefined,
			description: this._description,
		};
	}
}

export interface FieldResolver<T extends tGQLObject<any>> {
	fieldResolver<ReturnType extends tGQLOutputTypes>(
		returnType: ReturnType,
		resolver: (value: Infer<T>, args: undefined) => Infer<ReturnType>,
	): tGQLFieldResolver<ReturnType, ArgsInput | undefined, Infer<T>>;
	fieldResolver<ReturnType extends tGQLOutputTypes, Args extends ArgsInput>(
		returnType: ReturnType,
		args: Args,
		resolver: (value: Infer<T>, args: InferArgs<Args>) => Infer<ReturnType>,
	): tGQLFieldResolver<ReturnType, Args, Infer<T>>;
}

export type FieldResolverBuilder<T extends tGQLObject<any>> = Omit<T, 'fieldResolver'> & FieldResolver<T>;
