import { useTranslation } from '@onefootprint/hooks';
import { useToast } from '@onefootprint/ui';

import Logger from '../../../utils/logger';
import { useMissingPermissionsSheet } from '../components/missing-permissions-sheet';

const useHandleCameraError = () => {
  const toast = useToast();
  const { t } = useTranslation('components.media-errors');
  const missingPermissionsSheet = useMissingPermissionsSheet();

  const showErrorToast = (description: string) => {
    toast.show({
      description,
      title: 'Uh-oh!',
      variant: 'error',
    });
  };

  return (err: unknown) => {
    const error = err as DOMException;
    if (error instanceof TypeError) {
      showErrorToast(t('undefined-navigator'));
    } else if (
      error.name === 'NotFoundError' ||
      error.name === 'DevicesNotFoundError'
    ) {
      // required track is missing
      showErrorToast(t('not-found'));
    } else if (
      error.name === 'NotReadableError' ||
      error.name === 'TrackStartError'
    ) {
      // webcam or mic are already in use
      showErrorToast(t('already-in-use'));
    } else if (
      error.name === 'OverconstrainedError' ||
      error.name === 'ConstraintNotSatisfiedError'
    ) {
      // constraints can not be satisfied by avb. devices
      showErrorToast(t('constraint'));
    } else if (
      error.name === 'NotAllowedError' ||
      error.name === 'PermissionDeniedError'
    ) {
      // permission denied in browser
      missingPermissionsSheet.show({});
    } else if (error.name === 'TypeError' || error.name === 'TypeError') {
      // empty constraints object
      showErrorToast(t('other-error'));
    } else {
      // other errors
      showErrorToast(t('other-error'));
    }
    console.error(`Camera error: ${err}`);
    Logger.error(`Camera error: ${err}`, 'camera');
  };
};

export default useHandleCameraError;
