import FocusTrap from 'focus-trap-react';
import { useTranslation } from 'hooks';
import IcoClose24 from 'icons/ico/ico-close-16';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Button, Typography } from 'ui';
import Overlay from 'ui/src/components/internal/overlay/overlay';

import { ChallengeKind } from '../../../../../../utils/state-machine/identify/types';

type BottomSheetProps = {
  onClose: () => void;
  onSelectSms: () => void;
  onSelectBiometric: () => void;
};

const ChallengePicker = ({
  onClose,
  onSelectSms,
  onSelectBiometric,
}: BottomSheetProps) => {
  const { t } = useTranslation('pages.email-identification.challenge-picker');
  const [challengeKind, setChallengeKind] = useState(ChallengeKind.sms);

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

  return (
    <FocusTrap>
      <Overlay onClick={onClose} aria-modal>
        <BottomSheet>
          <Header>
            <CloseContainer onClick={onClose}>
              <IcoClose24 />
            </CloseContainer>
            <Typography variant="label-2">{t('header')}</Typography>
          </Header>
          <Body>
            <Typography variant="body-2">{t('title')}</Typography>
            <OptionsContainer>
              <Option
                selected={challengeKind === ChallengeKind.sms}
                onClick={handleSelectSms}
              >
                <Typography variant="label-2" color="accent">
                  {t('sms.title')}
                </Typography>
                {/* TODO: add icon */}
                <Typography variant="body-4" color="secondary">
                  {t('sms.description')}
                </Typography>
              </Option>
              <Option
                selected={challengeKind === ChallengeKind.biometric}
                onClick={handleSelectBiometric}
              >
                <Typography variant="label-2" color="accent">
                  {t('biometric.title')}
                </Typography>
                {/* TODO: add icon */}
                <Typography variant="body-4" color="secondary">
                  {t('biometric.description-default')}
                  {/* TODO: Detect whether ios & show different text */}
                </Typography>
              </Option>
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
    align-self: end;
  `}
`;

const BottomSheet = styled.div`
  ${({ theme }) => css`
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[3]}px ${theme.borderRadius[3]}px 0 0;
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

const Option = styled.div<{ selected?: boolean }>`
  ${({ theme, selected }) => css`
    border-radius: ${theme.borderRadius[2]}px;
    border: 1px solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[5]}px;

    &:first-child {
      border-radius: ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0 0;
    }

    &:last-child {
      border-radius: 0 0 ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px;
    }

    &:not(:last-child) {
      margin-top: -1px; // because of the borders
    }

    ${selected &&
    css`
      background-color: #4a24db14;
      border: 1px solid ${theme.borderColor.secondary};
    `}
  `}
`;

export default ChallengePicker;
