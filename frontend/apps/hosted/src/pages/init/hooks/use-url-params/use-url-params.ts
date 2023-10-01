import type { ObConfigAuth } from '@onefootprint/types';
import {
  CLIENT_PUBLIC_KEY_HEADER,
  HostedUrlType,
  KYB_BO_SESSION_AUTHORIZATION_HEADER,
} from '@onefootprint/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ObConfigAuthHeaderByTokenKind = {
  [HostedUrlType.beneficialOwner]: KYB_BO_SESSION_AUTHORIZATION_HEADER,
  [HostedUrlType.onboardingConfigPublicKey]: CLIENT_PUBLIC_KEY_HEADER,
};

export type UseParseUrlParamOptions = {
  onSuccess?: (obConfigAuth?: ObConfigAuth, authToken?: string) => void;
  onError?: (error: string) => void; // If URL is invalid or malformed
};

const useParseUrl = (options: UseParseUrlParamOptions = {}) => {
  const { onSuccess, onError } = options;
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { type } = router.query ?? {};
    if (
      !type ||
      typeof type !== 'string' ||
      !Object.values(HostedUrlType).includes(type as HostedUrlType)
    ) {
      onError?.(`Hosted app URL does not include type: ${router.asPath}`);
      return;
    }

    const parts = router.asPath.split('#');
    if (parts.length < 2) {
      onError?.(`Hosted app URL path does not contain token: ${router.asPath}`);
      return;
    }

    const token = decodeURI(parts[1]);
    if (!token) {
      onError?.(`Hosted app URL does not contain token: ${router.asPath}`);
      return;
    }

    const tokenKind = type as HostedUrlType;
    if (tokenKind === HostedUrlType.user) {
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
