import { useRouter } from 'next/router';

const useTenantPublicKey = () => {
  const router = useRouter();
  return router.asPath.split('#')[1];
};

export default useTenantPublicKey;
