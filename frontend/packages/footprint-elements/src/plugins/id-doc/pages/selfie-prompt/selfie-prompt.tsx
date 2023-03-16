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

import { HeaderTitle, NavigationHeader } from '../../../../components';
import IdAnimation from '../../../../components/animations/id-animation';
import InfoBox from '../../../../components/info-box/info-box';
import SelfieConsent from '../../components/selfie-consent';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const SelfiePrompt = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('pages.selfie-photo-prompt');
  const {
    selfie: { consentRequired },
  } = state.context;
  const [consentVisible, setConsentVisible] = useState(false);
  const {
    idDoc: { type },
  } = state.context;

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
    <Container>
      <NavigationHeader />
      {type === 'passport' ? (
        <IdAnimation
          firstText={t('animation-selfie-from-passport.first-text')}
          secondText={t('animation-selfie-from-passport.second-text')}
          src="/selfie-animation/selfie-animation.riv"
        />
      ) : (
        <IdAnimation
          firstText={t('animation-selfie.first-text')}
          secondText={t('animation-selfie.second-text')}
          src="/selfie-animation/selfie-animation.riv"
        />
      )}
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
