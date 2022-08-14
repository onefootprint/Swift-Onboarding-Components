import FocusTrap from 'focus-trap-react';
import { useTranslation } from 'hooks';
import IcoClose24 from 'icons/ico/ico-close-16';
import IcoFaceid24 from 'icons/ico/ico-faceid-24';
import IcoSmartphone24 from 'icons/ico/ico-smartphone-24';
import React, { useState } from 'react';
import { useIdentifyMachine } from 'src/components/identify-machine-provider';
import { ChallengeKind } from 'src/utils/state-machine/identify/types';
import styled, { css } from 'styled-components';
import { Button, Typography } from 'ui';
import Overlay from 'ui/src/components/internal/overlay/overlay';

import ChallengeOption from './components/challenge-option';

const iOSPlatforms = [
  'iPad Simulator',
  'iPhone Simulator',
  'iPod Simulator',
  'iPad',
  'iPhone',
  'iPod',
];

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelectSms: () => void;
  onSelectBiometric: () => void;
};

const ChallengePicker = ({
  open,
  onClose,
  onSelectSms,
  onSelectBiometric,
}: BottomSheetProps) => {
  const { t } = useTranslation('pages.email-identification.challenge-picker');
  const [state] = useIdentifyMachine();
  const {
    context: { device },
  } = state;

  const supportsBiometric =
    device.hasSupportForWebauthn && device.type === 'mobile';
  const [challengeKind, setChallengeKind] = useState(
    supportsBiometric ? ChallengeKind.biometric : ChallengeKind.sms,
  );

  const iOS = iOSPlatforms.includes(navigator.platform);

  const handleComplete = () => {
    if (challengeKind === ChallengeKind.sms) {
      onSelectSms();
    } else {
      onSelectBiometric();
    }
  };

  const handleSelectSms = () => {
    setChallengeKind(ChallengeKind.sms);
  };

  const handleSelectBiometric = () => {
    setChallengeKind(ChallengeKind.biometric);
  };

  // TODO: add open animation
  return !open ? null : (
    <FocusTrap>
      <Overlay onClick={onClose} aria-modal>
        <BottomSheet className={open ? 'visible' : 'hidden'}>
          <Header>
            <CloseContainer onClick={onClose}>
              <IcoClose24 />
            </CloseContainer>
            <Typography variant="label-2">{t('header')}</Typography>
          </Header>
          <Body>
            <Typography variant="body-2">{t('title')}</Typography>
            <OptionsContainer>
              <ChallengeOption
                title={t('sms.title')}
                description={t('sms.description')}
                IconComponent={IcoSmartphone24}
                onClick={handleSelectSms}
                selected={challengeKind === ChallengeKind.sms}
              />
              <ChallengeOption
                title={t('biometric.title')}
                description={
                  iOS
                    ? t('biometric.description-ios')
                    : t('biometric.description-default')
                }
                IconComponent={IcoFaceid24}
                onClick={handleSelectBiometric}
                selected={challengeKind === ChallengeKind.biometric}
              />
            </OptionsContainer>
            <Button fullWidth onClick={handleComplete}>
              {t('cta')}
            </Button>
          </Body>
        </BottomSheet>
      </Overlay>
    </FocusTrap>
  );
};

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: ${theme.spacing[5]}px;
  `}
`;

const BottomSheet = styled.div`
  ${({ theme }) => css`
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[3]}px ${theme.borderRadius[3]}px 0 0;
    z-index: ${theme.zIndex.overlay + 1};
    align-self: end;
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[5]}px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]}px;
    row-gap: ${theme.spacing[5]}px;
    display: flex;
    flex-direction: column;
    text-align: center;
  `}
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

export default ChallengePicker;
