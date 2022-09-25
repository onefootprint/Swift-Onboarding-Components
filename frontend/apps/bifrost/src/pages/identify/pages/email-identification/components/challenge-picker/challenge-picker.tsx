import { ChallengeKind } from '@onefootprint/types';
import { useTranslation } from 'hooks';
import { IcoFaceid24, IcoSmartphone24 } from 'icons';
import React, { useState } from 'react';
import { useIdentifyMachine } from 'src/components/identify-machine-provider';
import styled, { css } from 'styled-components';
import {
  BottomSheet,
  Button,
  RadioSelect,
  RadioSelectOptionFields,
  Typography,
} from 'ui';

const iOSPlatforms = [
  'iPad Simulator',
  'iPhone Simulator',
  'iPod Simulator',
  'iPad',
  'iPhone',
  'iPod',
];

type ChallengePickerProps = {
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
}: ChallengePickerProps) => {
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
  const options: RadioSelectOptionFields[] = [
    {
      title: t('sms.title'),
      description: t('sms.description'),
      IconComponent: IcoSmartphone24,
      value: ChallengeKind.sms,
    },
    {
      title: t('biometric.title'),
      description: iOS
        ? t('biometric.description-ios')
        : t('biometric.description-default'),
      IconComponent: IcoFaceid24,
      value: ChallengeKind.biometric,
    },
  ];

  const handleComplete = () => {
    onClose();
    if (challengeKind === ChallengeKind.sms) {
      onSelectSms();
    } else {
      onSelectBiometric();
    }
  };

  const handleSelect = (value: string) => {
    setChallengeKind(value as ChallengeKind);
  };

  return (
    <BottomSheet open={open} title={t('header')} onClose={onClose}>
      <Body>
        <Typography variant="body-2">{t('title')}</Typography>
        <RadioSelect
          options={options}
          defaultSelected={challengeKind}
          onSelect={handleSelect}
        />
        <Button fullWidth onClick={handleComplete}>
          {t('cta')}
        </Button>
      </Body>
    </BottomSheet>
  );
};

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]}px;
    row-gap: ${theme.spacing[5]}px;
    display: flex;
    flex-direction: column;
    text-align: center;
  `}
`;

export default ChallengePicker;
