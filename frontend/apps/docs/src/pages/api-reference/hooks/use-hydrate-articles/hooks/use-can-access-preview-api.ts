import type { TenantPreviewApi } from '@onefootprint/types/src/api/get-tenants';
import useSession from 'src/hooks/use-session';

const useCanAccessPreviewApi = () => {
  const {
    data: { user },
  } = useSession();
  const canAccessPreviewApi = (previewApi: TenantPreviewApi) =>
    user?.tenant?.allowedPreviewApis?.includes(previewApi) || user?.isFirmEmployee || false;
  return canAccessPreviewApi;
};

export default useCanAccessPreviewApi;
