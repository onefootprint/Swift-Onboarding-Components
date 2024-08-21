import { IcoCamera40, IcoClose24, IcoImages24 } from '@onefootprint/icons';
import { Box, Button, IconButton, Text, media, useToast } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { createGlobalStyle } from 'styled-components';
import { getLogger, trackAction } from '../../../../utils/logger';
import useUserMedia from '../camera/hooks/use-user-media';

type T = TFunction<'idv', 'document-flow'>;
type CameraAccessRequestProps = {
  onClose: () => void;
  onError: (error: unknown) => void;
  onSuccess: (stream: MediaStream) => void;
};

const underlineStyle = { textDecoration: 'underline' };
const { logError } = getLogger({ location: 'camera-access-request' });

const showFeedbackToast = (t: T, toast: (str: string) => string, err: unknown): unknown => {
  if (!(err instanceof Error)) {
    logError('Unknown MediaStream error', err);
    return err;
  }

  if (err instanceof TypeError) {
    toast(t('components.media-errors.undefined-navigator'));
    trackAction('id-doc:camera-error', { cameraError: 'undefined-navigator' });
  } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
    toast(t('components.media-errors.not-found')); // required track is missing
    trackAction('id-doc:camera-error', { cameraError: 'not-found' });
  } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
    toast(t('components.media-errors.already-in-use')); // webcam or mic are already in use
    trackAction('id-doc:camera-error', { cameraError: 'already-in-use' });
  } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
    toast(t('components.media-errors.constraint')); // constraints can not be satisfied by avb. devices
    trackAction('id-doc:camera-error', { cameraError: 'constraint' });
  } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    trackAction('id-doc:camera-error', { cameraError: 'permission-denied' });
  } else {
    toast(t('components.media-errors.other-error')); // other errors
    trackAction('id-doc:camera-error', { cameraError: 'other-error' });
  }

  logError(`MediaStream error ${err.name}`, err);
  return err;
};

const CameraAccessRequest = ({ onClose, onError, onSuccess }: CameraAccessRequestProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'document-flow' });
  const toast = useToast();
  const errorToast = (description: string) => toast.show({ description, title: 'Uh-oh!', variant: 'error' });
  const { requestMediaStream } = useUserMedia({
    isLazy: true,
    onError: err => {
      showFeedbackToast(t, errorToast, err);
      onError(err);
    },
    onSuccess,
  });

  return (
    <>
      <IconButton aria-label="Close" onClick={onClose} testID="camera-access-request-close-button">
        <IcoClose24 />
      </IconButton>
      <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
        <Box display="flex" justifyContent="center" marginBottom={5}>
          <IcoCamera40 />
        </Box>
        <Text variant="heading-3" textAlign="center" marginBottom={8}>
          {t('access-camera')}
        </Text>
        <Box display="flex" gap={4} marginBottom={7}>
          <Box minWidth="24px">
            <IcoImages24 />
          </Box>
          <Box>
            <Text variant="label-2">
              <Trans
                ns="idv"
                i18nKey="document-flow.how-you-will-use-this"
                components={{ underlined: <span style={underlineStyle} /> }}
              />
            </Text>
            <Text variant="body-2" color="tertiary">
              {t('docs-and-or-selfie')}
            </Text>
          </Box>
        </Box>
        <Box display="flex" gap={4} marginBottom={9}>
          <Box minWidth="24px">
            <IcoImages24 />
          </Box>
          <Box>
            <Text variant="label-2">
              <Trans
                ns="idv"
                i18nKey="document-flow.how-we-will-use-this"
                components={{ underlined: <span style={underlineStyle} /> }}
              />
            </Text>
            <Text variant="body-2" color="tertiary">
              {t('key-needed-for-verification')}
            </Text>
            <Text variant="label-2">{t('no-camera-access')}</Text>
          </Box>
        </Box>
        <Button fullWidth onClick={() => requestMediaStream('back')} testID="allow-access" size="large">
          {t('allow-access')}
        </Button>
      </Box>
      <GlobalFootPrintFooterModification />
    </>
  );
};

const GlobalFootPrintFooterModification = createGlobalStyle`
  ${media.lessThan('md')`
    #footprint-footer { display: none; }
    #idv-body-content-container > div { padding-bottom: 0; }
  `}
`;

export default CameraAccessRequest;
