type Obj = Record<string, unknown>;
type ResponseError = { response: { data: { error: Obj } } };

const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g;

const isObject = (x: unknown): x is Obj => typeof x === 'object' && !!x;
const isString = (x: unknown): x is string => typeof x === 'string' && !!x;
const isErrorInResponse = (e: unknown): e is ResponseError => (e as ResponseError)?.response?.data !== undefined;
const isErrorWithMsg = (e: unknown): e is Error => (e as Error)?.message !== undefined;

const extractStringProps = (x: unknown, acc: string[] = []): string[] => {
  if (isString(x)) return [x];
  if (isObject(x)) {
    for (const key in x) {
      if (isString(x[key])) {
        acc.push(x[key] as string);
      } else if (isObject(x[key])) {
        extractStringProps(x[key] as Obj, acc);
      }
    }
  }

  return acc;
};

const getErrorMessage = (error?: unknown | Error): string => {
  if (typeof error === 'string') return error;

  if (isErrorInResponse(error) && error?.response?.data?.error?.message) {
    return isString(error?.response?.data?.error?.message)
      ? error.response.data.error.message
      : extractStringProps(error.response.data.error.message)
          .filter(x => !x.match(uuidPattern))
          .join('') || '';
  }
  if (isErrorWithMsg(error) && isString(error.message)) {
    return error.message;
  }

  return (
    extractStringProps(error)
      .filter(x => !x.match(uuidPattern))
      .join('') || 'Something went wrong'
  );
};

export default getErrorMessage;
