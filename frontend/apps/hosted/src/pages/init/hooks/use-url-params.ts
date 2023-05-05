import {
  CLIENT_PUBLIC_KEY_HEADER,
  KYB_BO_SESSION_AUTHORIZATION_HEADER,
  ObConfigAuth,
} from '@onefootprint/types';
import { useRouter } from 'next/router';

const useUrlParams = (): ObConfigAuth | undefined => {
  const router = useRouter();
  if (!router.isReady) {
    return undefined;
  }

  const parts = router.asPath.split('#');
  if (parts.length === 2) {
    const authToken = decodeURI(parts[1]);
    return { [KYB_BO_SESSION_AUTHORIZATION_HEADER]: authToken };
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
  if (tenantPk) {
    return { [CLIENT_PUBLIC_KEY_HEADER]: tenantPk };
  }

  return undefined;
};

export default useUrlParams;
