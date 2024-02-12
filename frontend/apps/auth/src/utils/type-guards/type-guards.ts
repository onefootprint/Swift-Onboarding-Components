import { FootprintComponentKind } from '@onefootprint/footprint-js';

type Obj = Record<string, unknown>;

const isAuth = (x: unknown) => x === FootprintComponentKind.Auth;

const isString = (x: unknown): x is string => typeof x === 'string';

const isObject = (x: unknown): x is Obj => typeof x === 'object' && !!x;

export { isAuth, isObject, isString };
