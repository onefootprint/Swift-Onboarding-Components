import type { FootprintFormProps } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useFootprintForm = (formProps: Partial<Omit<FootprintFormProps, 'authToken' | 'kind'>> = {}) => {
  const router = useRouter();

  useEffect(() => {
    const authToken = router.asPath.split('#')[1];

    if (!router.isReady || typeof authToken !== 'string') {
      return () => undefined;
    }

    const component = launchForm(authToken);
    return () => {
      component.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, router.isReady]);

  const launchForm = (authToken: string) => {
    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      authToken,
      ...formProps,
    });
    component.render();
    return component;
  };
};

export default useFootprintForm;
