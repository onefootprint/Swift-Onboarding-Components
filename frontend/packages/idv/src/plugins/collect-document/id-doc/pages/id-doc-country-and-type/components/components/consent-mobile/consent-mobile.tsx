import { getErrorMessage } from '@onefootprint/request';
import React, { useRef } from 'react';

import useIdvRequestErrorToast from '../../../../../../../../hooks/ui/use-idv-request-error-toast';
import { Logger } from '../../../../../../../../utils/logger';
import type { ImageConsentHandler } from '../../../../../components/image-consent';
import ImageConsent from '../../../../../components/image-consent';
import useConsent from '../../../../../hooks/use-consent';
import useIdDocMachine from '../../../../../hooks/use-id-doc-machine';
import ConsentBottomSheet from './components/consent-bottomsheet/consent-bottomsheet';

type ConsentMobileProps = {
  open: boolean;
  onConsent: () => void;
  onClose: () => void;
};

const ConsentMobile = ({ open, onConsent, onClose }: ConsentMobileProps) => {
  const [state] = useIdDocMachine();
  const { authToken } = state.context;
  const consentMutation = useConsent();
  const requestErrorToast = useIdvRequestErrorToast();
  const consentRef = useRef<ImageConsentHandler>(null);

  const handleClose = () => {
    onClose();
  };

  const handleConsent = () => {
    const consentInfo = consentRef.current?.getConsentInfo();
    if (!authToken || !consentInfo) {
      if (!authToken) {
        Logger.error("Could not submit consent - auth token doesn't exist", {
          location: 'consent-mobile',
        });
      }

      if (!consentInfo) {
        Logger.error('Could not submit consent - consent language is empty or undefined', {
          location: 'consent-mobile',
        });
      }
      return;
    }

    const { consentLanguageText, mlConsent } = consentInfo;

    if (consentMutation.isLoading) {
      return;
    }

    consentMutation.mutate(
      { consentLanguageText, mlConsent, authToken },
      {
        onSuccess: onConsent,
        onError: err => {
          Logger.error(`Could not submit consent language. Error: ${getErrorMessage(err)}`, {
            location: 'consent-mobile',
          });
          requestErrorToast(err);
        },
      },
    );
  };

  return (
    <ConsentBottomSheet
      open={open}
      onClose={handleClose}
      onComplete={handleConsent}
      isLoading={consentMutation.isLoading}
      testID="mobile-consent"
    >
      <ImageConsent ref={consentRef} />
    </ConsentBottomSheet>
  );
};

export default ConsentMobile;
