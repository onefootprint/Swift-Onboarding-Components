import { useRouter } from 'next/router';

const useOpener = () => {
  const router = useRouter();
  return router.query.opener;
};

export default useOpener;
