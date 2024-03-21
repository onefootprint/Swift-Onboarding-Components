import { useState } from 'react';

type MutateOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

function useRequest<T, P extends unknown>(request: (params: P) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);

  const mutate = async (params: P, options?: MutateOptions<T>): Promise<T> => {
    setLoading(true);
    try {
      const result = await request(params);
      setData(result);
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      setError(err);
      if (options?.onError) {
        options.onError(err);
      }
      return await Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, mutate };
}

export default useRequest;
