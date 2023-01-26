type ErrorInfo = {
  id: string;
  eventType: string;
  name: string;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
};

const errorIds = new Map<string, string>();
const getErrorId = (error: Error) => {
  // Avoid double reporting the same errors, since error boundaries throw them twice.
  const key = `${error.name}!${error.message}!${error.stack}`;
  if (!errorIds.has(key)) {
    const id = Math.floor(Math.random() * 10 ** 9).toString();
    errorIds.set(key, `error-${id}`);
  }
  return errorIds.get(key) || '';
};

const getErrorEventInfo = (event: Event | string, error: Error) => {
  const info: ErrorInfo = {
    id: getErrorId(error),
    name: error.name,
    message: error.message,
    stack: error.stack,
    eventType: typeof event === 'string' ? event : (event as Event).type,
  };

  if (event instanceof ErrorEvent) {
    info.filename = event.filename;
    info.lineno = event.lineno;
    info.colno = event.colno;
  }

  return info;
};

export default getErrorEventInfo;
