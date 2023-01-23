import { useRouter } from 'next/router';

const useTenantPublicKey = () => {
  const router = useRouter();
  const tenantPk = router.query.public_key;
  if (!router.isReady || !tenantPk) {
    return '';
  }
  if (typeof tenantPk === 'string') {
    return tenantPk;
  }
  return tenantPk[0];
};

export default useTenantPublicKey;
