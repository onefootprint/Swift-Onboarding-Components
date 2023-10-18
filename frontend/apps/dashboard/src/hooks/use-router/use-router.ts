import { useRouter as useNextRouter } from 'next/router';

const useRouter = () => {
  const router = useNextRouter();

  const pushQuery = (query: Record<string, any>) =>
    router.push({ query }, undefined, { shallow: true });

  const resetQuery = () => {
    router.push({ query: {} }, undefined, { shallow: true });
  };

  return { pushQuery, resetQuery, ...router };
};

export default useRouter;
