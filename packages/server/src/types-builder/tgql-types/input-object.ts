import type { Expand, tGQLInputTypes, ToOptional, ToRequired, UndefinedAsOptional } from '../../types.ts';
import type { tGQLNullableBase, tGQLObject, tGQLResolver } from '../index.ts';
import { tGQLNonNull } from '../index.ts';
import type { GraphQLInputFieldConfig, GraphQLInputFieldConfigMap } from 'graphql';
import { GraphQLInputObjectType } from 'graphql';

export class tGQLInputObject<
	InputFields extends Record<string, tGQLInputTypes>,
	Name extends string
> extends tGQLNonNull<
	tGQLInputObject<InputFields, Name>,
	Expand<UndefinedAsOptional<InputFields>>,
	GraphQLInputObjectType
> {
	declare name: Name;
	override readonly _class = 'tGQLInputObject' as const;

	constructor(name: string, public fields: InputFields) {
		super({
			name,
			graphQLType: new GraphQLInputObjectType({
				name: name,
				fields: tGQLInputObject.buildFields(fields),
			}),
		});
	}

	private static buildFields<IFields extends Record<string, tGQLInputTypes>>(
		_fields: IFields
	): GraphQLInputFieldConfigMap {
		const fields: GraphQLInputFieldConfigMap = {};
		for (const [key, tGQLType] of Object.entries(_fields)) {
			// @ts-ignore check for output types in input object
			if (tGQLType._class === 'tGQLObject') {
				// @ts-ignore
				throw new Error(`Cannot use output type ${tGQLType.name} in input object`);
			}
			fields[key] = tGQLType.fieldConfig as unknown as GraphQLInputFieldConfig;
		}
		return fields;
	}
}

class ToInputObject<
	Obj extends tGQLObject<any, any>,
	InputObjFields extends Record<string, tGQLInputTypes> | undefined,
	Name extends string
> {
	declare ObjFields: GetMatchingKeys<Obj['fields']>;
	declare ObjKeys: (keyof typeof this.ObjFields)[];
	private _required: typeof this.ObjKeys = [];
	private _optional: typeof this.ObjKeys = [];
	private _exclude: typeof this.ObjKeys = [];
	private _fields: InputObjFields | undefined;
	constructor(public name: Name, private tgqlObject: Obj) {}

	required<RequiredKeys extends typeof this.ObjKeys>(propertyNames: RequiredKeys) {
		this._required = propertyNames;
		return this as any as ToInputObject<
			tGQLObject<Expand<ToRequired<typeof this.ObjFields, RequiredKeys[number]>>, any>,
			InputObjFields,
			Name
		>;
	}

	exclude<ExKeys extends typeof this.ObjKeys>(propertyNames: ExKeys) {
		this._exclude = propertyNames;
		return this as any as ToInputObject<
			tGQLObject<Expand<Omit<typeof this.ObjFields, ExKeys[number]>>, any>,
			InputObjFields,
			Name
		>;
	}

	optional<Optionals extends typeof this.ObjKeys>(propertyNames: Optionals) {
		this._optional = propertyNames;
		return this as any as ToInputObject<
			tGQLObject<Expand<ToOptional<typeof this.ObjFields, Optionals[number]>>, any>,
			InputObjFields,
			Name
		>;
	}

	extend<Fields extends Record<string, tGQLInputTypes>>(fields: Fields): ToInputObject<Obj, Fields, Name> {
		this._fields = fields as any;
		return this as unknown as ToInputObject<Obj, Fields, Name>;
	}

	/**
	 * Creates a new tGQLInputObject from the tGQLObject passed in
	 * Uses the required, optional, added, and excluded properties
	 * TODO: Investigate pros/cons of doing this on the fly vs. at the end
	 * @returns A new tGQLInputObject
	 */
	create() {
		const fields = this.tgqlObject.fields as typeof this.ObjFields;
		const newFields: Record<string, tGQLInputTypes | tGQLObject<any, any>> = {};
		for (const key in fields) {
			if (
				fields[key]._class === 'tGQLResolver' ||
				(fields[key]._nullable && fields[key]._tGQLType._class === 'tGQLResolver')
			) {
				continue;
			}
			if (this._exclude.includes(key)) continue;
			if (this._required.includes(key)) {
				newFields[key] = fields[key]._nullable ? fields[key]._tGQLType : fields[key];
			} else if (this._optional.includes(key)) {
				newFields[key] = fields[key].nullable();
			} else {
				newFields[key] = fields[key];
			}
			if (newFields[key]._class === 'tGQLObject') {
				newFields[key] = new ToInputObject(key, newFields[key] as unknown as tGQLObject<any, any>).create();
			}
		}
		if (this._fields) {
			for (const key in this._fields) {
				newFields[key] = this._fields[key];
			}
		}
		return new tGQLInputObject<Expand<typeof this.ObjFields & InputObjFields>, Name>(this.name, newFields as any);
	}
}

type GetMatchingKeys<T extends tGQLObject<any, any>['fields']> = {
	[K in keyof T as T[K] extends
		| tGQLResolver<any, any, any, any, any>
		| tGQLNullableBase<tGQLResolver<any, any, any, any, any>>
		? never
		: K]: T[K];
};

export function toInputObject<Obj extends tGQLObject<any, any>, Name extends string>(
	name: Name,
	tGQLObject: Obj
): ToInputObject<Obj, undefined, Name> {
	return new ToInputObject(name, tGQLObject);
}
