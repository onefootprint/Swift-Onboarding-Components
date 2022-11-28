import { useRouter } from 'next/router';

const useTenantPublicKey = () => {
  const router = useRouter();
  return (router.query.public_key || '') as string;
};

export default useTenantPublicKey;
