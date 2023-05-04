import { useRouter } from 'next/router';

export type HostedUrlParams = {
  authToken?: string;
  tenantPk?: string;
};

const useUrlParams = () => {
  const router = useRouter();
  if (!router.isReady) {
    return {};
  }

  let authToken;
  const parts = router.asPath.split('#');
  if (parts.length === 2) {
    authToken = decodeURI(parts[1]);
  }

  const publicKey = router.query.public_key;
  let tenantPk = '';
  if (publicKey) {
    if (typeof publicKey === 'string') {
      tenantPk = publicKey;
    } else {
      [tenantPk] = publicKey;
    }
  }

  return { authToken, tenantPk };
};

export default useUrlParams;
