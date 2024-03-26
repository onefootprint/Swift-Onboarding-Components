import { useState } from 'react';

type MutateOptions<T = unknown> = {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

const useRequest = <T = unknown>(request: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const mutate = async (mutateOptions?: MutateOptions<T>) => {
    setLoading(true);
    try {
      const res = await request();
      setData(res);
      mutateOptions?.onSuccess?.(res);
    } catch (e) {
      setError(e);
      mutateOptions?.onError?.(e);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, mutate };
};

export default useRequest;
