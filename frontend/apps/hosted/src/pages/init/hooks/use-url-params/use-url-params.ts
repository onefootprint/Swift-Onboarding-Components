import {
  CLIENT_PUBLIC_KEY_HEADER,
  KYB_BO_SESSION_AUTHORIZATION_HEADER,
  ObConfigAuth,
} from '@onefootprint/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export enum TokenKind {
  beneficialOwner = 'bo',
  onboardingConfigPublicKey = 'ob_pk',
  user = 'user',
}

const ObConfigAuthHeaderByTokenKind = {
  [TokenKind.beneficialOwner]: KYB_BO_SESSION_AUTHORIZATION_HEADER,
  [TokenKind.onboardingConfigPublicKey]: CLIENT_PUBLIC_KEY_HEADER,
};

export type UseParseUrlParamOptions = {
  onSuccess?: (obConfigAuth?: ObConfigAuth, authToken?: string) => void;
  onError?: () => void; // If URL is invalid or malformed
};

const useParseUrl = (options: UseParseUrlParamOptions = {}) => {
  const { onSuccess, onError } = options;
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { kind } = router.query ?? {};
    if (
      !kind ||
      typeof kind !== 'string' ||
      !Object.values(TokenKind).includes(kind as TokenKind)
    ) {
      onError?.();
      return;
    }

    const parts = router.asPath.split('#');
    if (parts.length < 2) {
      onError?.();
      return;
    }

    const token = decodeURI(parts[1]);
    if (!token) {
      onError?.();
      return;
    }

    const tokenKind = kind as TokenKind;
    if (tokenKind === TokenKind.user) {
      onSuccess?.(undefined, token);
    } else {
      const authHeader = ObConfigAuthHeaderByTokenKind[tokenKind];
      const obConfigAuth = { [authHeader]: token } as ObConfigAuth;
      onSuccess?.(obConfigAuth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);
};

export default useParseUrl;
