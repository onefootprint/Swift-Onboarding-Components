import { useEffect, useRef, useState } from 'react';

import type { Heic2AnyModule } from '../../types';

const IS_TEST = typeof jest !== 'undefined';

const loadHeic2AnyModule = async (retryCount = 0): Promise<Heic2AnyModule> => {
  try {
    const heic2any = (await import('heic2any')).default;
    return heic2any;
  } catch (err) {
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
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return [isLoading, ref.current];
};

export default useImportHeic2Any;
