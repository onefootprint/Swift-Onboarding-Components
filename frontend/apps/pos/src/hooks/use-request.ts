import { useState } from 'react';

const useRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const makeRequest = async (requestFn, ...params) => {
    setIsLoading(true);
    setError('');
    try {
      return await requestFn(...params);
    } catch (err) {
      console.log(err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, makeRequest };
};

export default useRequest;
