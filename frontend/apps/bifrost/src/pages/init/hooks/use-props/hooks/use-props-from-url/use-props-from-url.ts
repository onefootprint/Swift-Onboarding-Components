import { useRouter } from 'next/router';
import { useEffect } from 'react';

type BaseProps = Record<string, any>;

const getParsedProps = (props: string) => {
  let parsedProps;
  try {
    parsedProps = JSON.parse(decodeURIComponent(props));
  } catch (_) {
    // eslint-disable-next-line no-console
    console.warn(`Could not parse props from url. They will be ignored.`);
  }

  return parsedProps || {};
};

const isPropsValid = (props: any) =>
  !!props && typeof props === 'object' && props !== null;

const usePropsFromUrl = <T extends BaseProps>(
  onSuccess?: (props: T) => void,
) => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    let params = router.asPath;
    if (router.pathname) {
      const parts = params.split(router.pathname);
      if (parts.length > 1) {
        [, params] = parts;
      }
    }
    const searchParams = new URLSearchParams(params);
    const props = searchParams.get('props') ?? undefined;
    if (!props) {
      return;
    }

    const parsedProps = getParsedProps(props);
    if (!isPropsValid(parsedProps)) {
      return;
    }
    onSuccess?.(parsedProps);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath, router.pathname]);
};

export default usePropsFromUrl;
