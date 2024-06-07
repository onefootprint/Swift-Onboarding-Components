import { type ReadonlyURLSearchParams as Params, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import omitSearchParams from '../../helpers/omit-search-params';

type Router = ReturnType<typeof useRouter>;

const omitDialog = omitSearchParams.bind(null, ['dialog', 'dialogId']);

const reset = (params: Params, path: string, router: Router) => {
  router.replace(`${path}?${omitDialog(params).toString()}`);
};

const add = (params: Params, path: string, router: Router, name: string, id?: string) => {
  const out = omitDialog(params);
  if (id) {
    out.append('dialogId', id);
  }
  out.append('dialog', name);
  router.replace(`${path}?${out.toString()}`);
};

const useDialogManager = () => {
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();

  return useMemo(
    () => ({
      add: (name: string, id?: string) => add(params, path, router, name, id),
      has: (name: string) => params.has('dialog', name),
      id: () => params.get('dialogId') || undefined,
      reset: () => reset(params, path, router),
    }),
    [path, router, params],
  );
};

export default useDialogManager;
