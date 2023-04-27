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

  const { token } = router.query;
  const publicKey = router.query.public_key;

  let authToken = '';
  let tenantPk = '';

  if (token) {
    if (typeof token === 'string') {
      authToken = token;
    } else {
      [authToken] = token;
    }
  }

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
