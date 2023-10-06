import { Logger } from '@onefootprint/dev-tools';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import React, { useRef } from 'react';

import useConsent from '../../../../hooks/use-consent';
import useIdDocMachine from '../../../../hooks/use-id-doc-machine';
import type { ImageConsentHandler } from '../../../image-consent';
import ImageConsent from '../../../image-consent';
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
  const requestErrorToast = useRequestErrorToast();
  const consentRef = useRef<ImageConsentHandler>(null);

  const handleClose = () => {
    onClose();
  };

  const handleConsent = () => {
    const consentInfo = consentRef.current?.getConsentInfo();
    if (!authToken || !consentInfo) {
      if (!authToken) {
        console.error("Could not submit consent - auth token doesn't exist");
        Logger.error(
          "Could not submit consent - auth token doesn't exist",
          'consent-mobile',
        );
      }

      if (!consentInfo) {
        console.error(
          'Could not submit consent - consent language is empty or undefined',
        );
        Logger.error(
          'Could not submit consent - consent language is empty or undefined',
          'consent-mobile',
        );
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
          console.error(
            `Could not submit consent language. Error: ${getErrorMessage(err)}`,
          );
          Logger.error(
            `Could not submit consent language. Error: ${getErrorMessage(err)}`,
            'consent-mobile',
          );
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
