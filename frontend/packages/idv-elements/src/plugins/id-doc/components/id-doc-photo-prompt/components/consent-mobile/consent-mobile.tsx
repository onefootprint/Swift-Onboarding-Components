import { useRequestErrorToast } from '@onefootprint/hooks';
import React, { useRef } from 'react';

import useConsent from '../../../../hooks/use-consent';
import useIdDocMachine from '../../../../hooks/use-id-doc-machine';
import ImageConsent, { ImageConsentHandler } from '../../../image-consent';
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
    const consentLanguageText = consentRef.current?.getConsentText();
    if (!authToken || !consentLanguageText) {
      console.error(
        "Couldn't post consent - auth token or consent text missing",
      );
      return;
    }

    if (consentMutation.isLoading) return;

    consentMutation.mutate(
      { consentLanguageText, authToken },
      {
        onSuccess: onConsent,
        onError: requestErrorToast,
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
