import { useFormContext } from 'react-hook-form';
import useSession from 'src/hooks/use-session';

const useIdDocFirstFlowEnabled = (isKyc: boolean) => {
  const {
    data: { user, org },
  } = useSession();
  const { watch } = useFormContext();
  const hasIdDoc = watch('personal.idDocKind').length > 0;

  const hasUserPermission = user?.isFirmEmployee;
  const hasOrgPermissionForIdDocFirst = org?.name.toLowerCase().includes('flexcar');
  return hasIdDoc && isKyc && (hasUserPermission || hasOrgPermissionForIdDocFirst);
};

export default useIdDocFirstFlowEnabled;
