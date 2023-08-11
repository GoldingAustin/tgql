import { createProxy } from './fragment-builder.ts';
import type { tgql } from '@tgql/server';

interface GQLShape<Args> {
	[key: string]: tgql.tGQLTypes | GQLShape<Args>;
}

const prependTab = (numTabs: number, str: string) => `${'\t'.repeat(numTabs)}${str}`;
const buildGraphqlShape = <Shape extends GQLShape<any>>(shape: Shape, level = 0): string[] => {
	return Object.keys(shape).flatMap((key) => {
		const currentProperty = shape[key];
		if (currentProperty?._class) {
			if (currentProperty?._class === 'tGQLResolver') {
				return [prependTab(level, `${key}${createArgsCallString(currentProperty._args)}`)];
			} else {
				return prependTab(level, key);
			}
		} else {
			return [
				prependTab(level, `${key} {`),
				...buildGraphqlShape(shape[key] as GQLShape<any>, level + 1),
				`${prependTab(level, '}')}`,
			];
		}
	});
};
const createArgsString = (args: tgql.tGQLObjectFieldsBase): string => {
	return `(${Object.keys(args)
		.map((key) => `$${key}: ${args[key]._graphQLType.toString()}`)
		.join(', ')})`;
};
const createArgsCallString = (args: tgql.ArgsInput): string => {
	return `(${Object.keys(args)
		.map((key) => `${key}: $${key}`)
		.join(', ')})`;
};
const createGraphqlResolverString = <Shape extends GQLShape<any>>(
	shape: Shape,
	templateConfig: QueryTemplate<any, any, any>
): string => {
	return [
		`${templateConfig.type.toLowerCase()} ${templateConfig.name} ${createArgsString({
			...templateConfig.args,
			...templateConfig.fieldArgs,
		})} {`,
		prependTab(1, `${templateConfig.name} ${createArgsCallString(templateConfig.args)} {`),
		...buildGraphqlShape(shape, 2),
		prependTab(1, '}'),
		'}',
	].join('\n');
};
const createGraphqlFragment = <Shape extends GQLShape<any>>(shape: Shape, type: FragmentTemplate<any, any>): string => {
	return [`fragment ${type.name} on ${type.onName} {`, `\t${buildGraphqlShape(shape).join('\n\t')}`, '}'].join('\n');
};

type QueryTemplate<Name extends string, Args, FieldArgs> = {
	type: tgql.ResolverType;
	name: Name;
	args: Args;
	fieldArgs: FieldArgs;
};
type FragmentTemplate<Name extends string, FieldArgs, OnName extends string = string> = {
	type: 'Fragment';
	name: Name;
	onName: OnName;
	fieldArgs: FieldArgs;
};
export type GqlTemplateType<Name extends string, Args, FieldArgs> =
	| QueryTemplate<Name, Args, FieldArgs>
	| FragmentTemplate<Name, FieldArgs>;
export const graphqlStringBuilder = <
	tGQLType extends tgql.tGQLTypes,
	Name extends string,
	Args extends object,
	FieldArgs extends object
>(
	tgqlType: tGQLType,
	templateType: GqlTemplateType<Name, Args, FieldArgs>
) => {
	const shape: any = {};
	return createProxy({}, shape, templateType, tgqlType);
};
export const endBuilder = <Type extends GqlTemplateType<any, any, any>, Shape extends GQLShape<any>>(
	templateType: Type,
	shape: Shape
) => {
	return {
		gqlTemplate:
			templateType.type === 'Fragment'
				? createGraphqlFragment(shape, templateType)
				: createGraphqlResolverString(shape, templateType),
		createInput: (input: any) => input,
		InputType: {},
		ReturnType: {},
	} as any;
};
