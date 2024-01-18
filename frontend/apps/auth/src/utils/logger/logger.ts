import { Logger } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';

type LogFn = (str: string, err?: unknown) => void;
type BasicLevel = keyof Pick<typeof Logger, 'info' | 'warn' | 'error'>;
type MakeLoggerOutput = {
  logError: LogFn;
  logInfo: LogFn;
  logWarn: LogFn;
};

const getLogger = (location?: string): MakeLoggerOutput => {
  const logFunction = (level: BasicLevel, str: string, err?: unknown) => {
    Logger[level](`${str} ${err ? getErrorMessage(err) : ''}`, location);
  };

  return {
    logInfo: (str, err) => logFunction('info', str, err),
    logWarn: (str, err) => logFunction('warn', str, err),
    logError: (str, err) => logFunction('error', str, err),
  };
};

export default getLogger;
