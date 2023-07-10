import type { Expand, Infer, tGQLBaseTypeAny, tGQLObjectFieldsBase, tGQLTypes } from '../../server/src/types.ts';
import type { tGQLFieldResolver, tGQLList, tGQLNullable, tGQLObject } from '../../server/src/types-builder';
import type { tGQLUnion } from '../../server/src/types-builder/tgql-types/union.ts';
import type { ArgsInput, InferArgs } from '../../server/src/schema-builder/types.ts';
import type { GqlTemplateType } from './graphql-string-builder.ts';
import { endBuilder } from './graphql-string-builder.ts';

export type GetSubType<Type extends tGQLBaseTypeAny> = Type extends tGQLNullable<infer T>
	? GetSubType<T>
	: Type extends tGQLList<infer T>
	? GetSubType<T>
	: Type;
type EndBuilder<Inputs extends object, Return extends object> = () => EndBuilderOptions<Inputs, Return>;

export type EndBuilderOptions<Inputs extends object, Return extends object> = {
	gqlTemplate: string;
	createInput: (input: Inputs) => Inputs;
	readonly InputType: Inputs;
	readonly ReturnType: Return;
};
export type ReturnBuilder<
	Builder extends tGQLObjectFieldsBase,
	Props extends tGQLObjectFieldsBase,
	Key extends keyof Props,
	Accumulated extends object,
	Inputs extends object
> = <SubBuilder extends <Acc extends object, Inp extends object>(builder: DynamicChained<Acc, Inp, Builder>) => any>(
	b: SubBuilder
) => ReturnType<SubBuilder> extends DynamicChained<infer Acc, infer Args, any>
	? DynamicChained<Expand<Accumulated & Record<Key, Acc>>, Expand<Inputs & Args>, Expand<Omit<Props, Key>>>
	: never;

export type DynamicChainedProps<
	Accumulated extends object,
	Inputs extends object,
	Props extends tGQLObjectFieldsBase,
	Key extends keyof Props
> = Key extends '$end'
	? EndBuilder<Inputs, Accumulated>
	: GetSubType<Props[Key]> extends tGQLObject<infer Fields, any>
	? ReturnBuilder<Fields, Props, Key, Accumulated, Inputs>
	: DynamicChained<
			Expand<Accumulated & Record<Key, Infer<Props[Key]>>>,
			Props[Key] extends tGQLFieldResolver<any, infer Args, any>
				? Args extends ArgsInput
					? Expand<Inputs & InferArgs<Args>>
					: Inputs
				: Inputs,
			Expand<Omit<Props, Key>>
	  >;
export type DynamicChained<Accumulated extends object, Inputs extends object, Props extends tGQLObjectFieldsBase> = {
	[Key in keyof Props | '$end' as GetSubType<Props[Key]> extends tGQLObject<any, any> ? Key : Key]: DynamicChainedProps<
		Accumulated,
		Inputs,
		Props,
		Key
	>;
};
export type Builder<
	tGQLType extends tGQLBaseTypeAny,
	Accumulated extends object,
	Inputs extends object
> = tGQLType extends tGQLObject<infer Fields, any>
	? DynamicChained<Accumulated, Inputs, Fields>
	: tGQLType extends tGQLUnion<infer O, any>
	? O extends tGQLObject<infer Fields, any>
		? DynamicChained<Accumulated, Inputs, Fields>
		: never
	: never;

type ChainObject = {
	[k: string]: ChainObject | true;
};

const getQueryProperty = <T extends tGQLTypes>(type: T, path: string[]): tGQLTypes => {
	if ((type?._class === 'tGQLNullable' || type?._class === 'tGQLNullableWithDefault') && type?._tGQLType) {
		return getQueryProperty(type._tGQLType, path);
	}
	if (type?._class === 'tGQLList') {
		if (type._tGQLType._class === 'tGQLObject') {
			return getQueryProperty(type._tGQLType, path);
		}
	}

	if (path.length === 0) return type;

	if (type?._class === 'tGQLObject') {
		const [head, ...tail] = path;
		return getQueryProperty(head in type.fields ? type.fields[head] : type.resolvers?.[head], tail);
	}

	return type;
};

export function createProxy<Type extends GqlTemplateType<any, any, any>, tGQLType extends tGQLTypes>(
	obj: ChainObject = {},
	shape: any = {},
	type: Type,
	tgqlType: tGQLType,
	path: string[] = []
): ChainObject {
	const proxy = new Proxy(obj, {
		get(target, property: string) {
			const currentPath = [...path, property];
			const currentType = getQueryProperty(tgqlType, currentPath);
			if (property in target) {
				return target[property as string];
			} else if (property === 'toJSON') {
				return () => target; // handles JSON.stringify
			} else if (property === '$end') {
				return () => {
					target[property] = endBuilder(type, shape);
					return target[property];
				};
			} else if (currentType?._class === 'tGQLObject') {
				const prop = property as string;
				return function (...args: any[]) {
					const items = {};
					target[prop] = createChained(args[0], createProxy({}, items, type, tgqlType, currentPath));
					shape[prop] = items;
					return proxy;
				};
			} else {
				if (!shape[property as string]) {
					shape[property as string] = currentType;
					if (currentType?._class === 'tGQLFieldResolver') {
						type.fieldArgs = { ...type.fieldArgs, ...currentType._args };
					}
				}
				target[property as string] = createProxy({}, shape, type, tgqlType, path);
				return target[property as string];
			}
		},
		set(target, property, value) {
			target[property as string] = value;
			return true;
		},
	}) as ChainObject;

	return proxy;
}

function createChained(callback: (builder: ChainObject) => any, obj: ChainObject): ChainObject {
	callback(obj);
	return obj;
}
