import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { PUBLIC_ROUTES } from 'src/config/constants';
import useSession from 'src/hooks/use-session';

const usePermissionsByRoute = (options: {
  publicRoute: {
    onSuccess: () => void;
    onError: () => void;
  };
  privateRoute: {
    onSuccess: () => void;
    onError: (options: {
      isLoggedIn: boolean;
      requiresOnboarding: boolean;
    }) => void;
  };
}) => {
  const { isLoggedIn, data } = useSession();
  const router = useRouter();
  const { pathname } = router;
  const { publicRoute, privateRoute } = options;

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isPrivateRoute = !isPublicRoute;
    privateRoute.onSuccess();

    // if (isPublicRoute) {
    //   if (isLoggedIn) {
    //     publicRoute.onError();
    //   } else {
    //     publicRoute.onSuccess();
    //   }
    // }
    // if (isPrivateRoute) {
    //   if (isLoggedIn) {
    //     const { requiresOnboarding } = data.meta;
    //     if (requiresOnboarding && pathname !== '/onboarding') {
    //       privateRoute.onError({ isLoggedIn: true, requiresOnboarding: true });
    //     }
    //     if (!requiresOnboarding && pathname === '/onboarding') {
    //       privateRoute.onError({ isLoggedIn: true, requiresOnboarding: false });
    //     }
    //     if (requiresOnboarding && pathname === '/onboarding') {
    //       privateRoute.onSuccess();
    //     }
    //     if (!requiresOnboarding && pathname !== '/onboarding') {
    //       privateRoute.onSuccess();
    //     }
    //   } else {
    //     privateRoute.onError({ isLoggedIn: false, requiresOnboarding: false });
    //   }
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isLoggedIn]);
};

export default usePermissionsByRoute;
