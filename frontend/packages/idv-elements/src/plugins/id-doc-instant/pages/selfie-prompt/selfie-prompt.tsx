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

import InfoBox from '../../../../components/info-box';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import FadeInContainer from '../../components/fade-in-container';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import SelfieConsent from './components/selfie-consent/selfie-consent';

const SelfiePrompt = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('pages.selfie-photo-prompt');
  const { shouldCollectConsent: consentRequired } = state.context.requirement;
  const [consentVisible, setConsentVisible] = useState(false);

  const handleClose = () => {
    setConsentVisible(false);
  };

  const handleConsent = () => {
    send({ type: 'consentReceived' });
    setConsentVisible(false);
    send({ type: 'startSelfieCapture' });
  };

  const handleClick = () => {
    if (consentRequired) {
      setConsentVisible(true);
    } else {
      send({ type: 'startSelfieCapture' });
    }
  };

  return (
    <FadeInContainer>
      <PromptContainer>
        <NavigationHeader />
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
        <SelfieConsent
          open={consentVisible}
          onClose={handleClose}
          onConsent={handleConsent}
        />
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled.div`
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
