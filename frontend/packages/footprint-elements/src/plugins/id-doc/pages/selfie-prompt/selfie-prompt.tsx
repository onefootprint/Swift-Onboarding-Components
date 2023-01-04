import { useTranslation } from '@onefootprint/hooks';
import {
  IcoSelfie40,
  IcoSmartphone24,
  IcoSquareFrame24,
  IcoSun24,
} from '@onefootprint/icons';
import { Button } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import InfoBox from '../../../../components/info-box/info-box';
import SelfieConsent from '../../components/selfie-consent';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';

const SelfiePrompt = () => {
  const [state, send] = useIdDocMachine();
  const {
    selfie: { requiresConsent },
  } = state.context;
  const { t } = useTranslation('pages.selfie-photo-prompt');
  const [consentVisible, setConsentVisible] = useState(false);

  const handleCloseConsent = (isConsented?: boolean) => {
    setConsentVisible(false);
    if (isConsented) {
      // TODO: Tell backend that consent is successfully collected
      // https://linear.app/footprint/issue/FP-2282/integrate-with-api-to-record-collected-consent-on-bifrost
      send({ type: Events.startSelfieCapture });
    }
  };

  const handleClick = () => {
    if (requiresConsent) {
      setConsentVisible(true);
    } else {
      send({ type: Events.startSelfieCapture });
    }
  };

  return (
    <Container>
      <IcoSelfie40 />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <InfoBox
        items={[
          {
            title: t('guidelines.check-lighting.title'),
            description: t('guidelines.check-lighting.description'),
            Icon: IcoSun24,
          },
          {
            title: t('guidelines.device-steady.title'),
            description: t('guidelines.device-steady.description'),
            Icon: IcoSmartphone24,
          },
          {
            title: t('guidelines.whole-face.title'),
            description: t('guidelines.whole-face.description'),
            Icon: IcoSquareFrame24,
          },
        ]}
      />
      <Button fullWidth onClick={handleClick}>
        {t('cta')}
      </Button>
      <SelfieConsent open={consentVisible} onClose={handleCloseConsent} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
    > button {
      margin-top: -${theme.spacing[4]};
    }
  `}
`;

export default SelfiePrompt;
