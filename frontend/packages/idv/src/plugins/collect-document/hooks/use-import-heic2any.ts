import { getErrorMessage } from '@onefootprint/request';
import { useEffect, useRef, useState } from 'react';

import Logger from '../../../utils/logger/logger';
import type { Heic2AnyModule } from '../types';

const IS_TEST = typeof jest !== 'undefined' || process.env.NODE_ENV === 'test';

const loadHeic2AnyModule = async (retryCount = 0): Promise<Heic2AnyModule> => {
  try {
    const heic2any = (await import('heic2any')).default;
    return heic2any;
  } catch (_e) {
    if (retryCount < 2) {
      return loadHeic2AnyModule(retryCount + 1);
    }
  }

  throw new Error('Failed to load heic2any library after multiple retries');
};

const useImportHeic2Any = (): [boolean, Heic2AnyModule | undefined] => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const ref = useRef<Heic2AnyModule | undefined>();

  useEffect(() => {
    if (IS_TEST) {
      return;
    }

    loadHeic2AnyModule()
      .then(module => {
        ref.current = module;
        return module;
      })
      .catch(e => {
        Logger.error(`Failed to load heic2any library, ${getErrorMessage(e)}`);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return [isLoading, ref.current];
};

export default useImportHeic2Any;
