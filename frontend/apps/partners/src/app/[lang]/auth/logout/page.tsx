'use client';

import { useRouter } from 'next/navigation';

import { deleteAuthCookie } from '@/app/actions';
import { DEFAULT_PUBLIC_ROUTE } from '@/config/constants';
import { useClientStore, useEffectOnce } from '@/hooks';
import authLogout from '@/queries/auth-logout';

const LogoutPage = () => {
  const router = useRouter();
  const { reset, data } = useClientStore(x => x);

  useEffectOnce(() => {
    deleteAuthCookie()
      .then(() => {
        reset();
        router.push(DEFAULT_PUBLIC_ROUTE);
      })
      .catch(console.error)
      .finally(() => {
        if (data.auth) {
          authLogout(data.auth).catch(console.error);
        }
      });
  });

  return null;
};

export default LogoutPage;
