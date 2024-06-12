import { isFootprintError, isUnhandledError } from '@onefootprint/request';
import { useTranslation } from 'react-i18next';

// TODO: move to request.ts when we migrate to package level translation namespaces
// For now, the errors will use the common namespace for the my app
const useRequestError = () => {
  const { t } = useTranslation('errors');

  const getMessage = (error?: unknown | Error): string => {
    if (typeof error === 'string') {
      return error;
    }
    const unknownError = t('unknown');
    if (isFootprintError(error)) {
      const data = error?.response?.data;
      const errorCode = data?.code;
      const errorContext = data?.context;
      const errorMessage = data?.message;

      if (!errorCode) {
        return errorMessage ?? unknownError;
      }
      if (!errorContext) {
        return t(errorCode) ?? unknownError;
      }
      return t(errorCode, errorContext) ?? unknownError;
    }

    if (isUnhandledError(error)) {
      return error.message;
    }
    return unknownError;
  };

  const getCode = (error?: unknown | Error): string | undefined => {
    if (!error || !isFootprintError(error)) {
      return undefined;
    }
    const data = error?.response?.data;
    const errorCode = data?.code;
    return errorCode ?? undefined;
  };

  return { getErrorMessage: getMessage, getErrorCode: getCode };
};

export default useRequestError;
