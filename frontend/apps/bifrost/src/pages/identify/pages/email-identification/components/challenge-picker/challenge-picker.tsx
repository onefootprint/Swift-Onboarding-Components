import FocusTrap from 'focus-trap-react';
import { useTranslation } from 'hooks';
import { IcoClose24, IcoFaceid24, IcoSmartphone24 } from 'icons';
import React, { useEffect, useState } from 'react';
import { useIdentifyMachine } from 'src/components/identify-machine-provider';
import styled, { css } from 'styled-components';
import { ChallengeKind } from 'types';
import {
  Button,
  Overlay,
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

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelectSms: () => void;
  onSelectBiometric: () => void;
};

enum State {
  open = 'open',
  opening = 'opening',
  closed = 'closed',
  closing = 'closing',
}

const OPEN_CLOSE_DELAY = 200;

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

  const [visibleState, setVisibleState] = useState<State>(State.closed);
  useEffect(() => {
    setVisibleState(open ? State.open : State.closed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (visibleState === State.opening || visibleState === State.closing) {
      return;
    }

    if (visibleState === State.open && !open) {
      setVisibleState(State.closing);
      setTimeout(() => {
        setVisibleState(State.closed);
      }, OPEN_CLOSE_DELAY);
      return;
    }

    if (visibleState === State.closed && open) {
      setVisibleState(State.opening);
      setTimeout(() => {
        setVisibleState(State.open);
      }, OPEN_CLOSE_DELAY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (visibleState === State.closed) {
    return null;
  }

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
    <FocusTrap active={open}>
      <StyledOverlay onClick={onClose} aria-modal className={visibleState}>
        <BottomSheet className={visibleState}>
          <Header>
            <CloseContainer onClick={onClose}>
              <IcoClose24 />
            </CloseContainer>
            <Typography variant="label-2">{t('header')}</Typography>
          </Header>
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
      </StyledOverlay>
    </FocusTrap>
  );
};

const StyledOverlay = styled(Overlay)`
  transition: all 0.2s linear;

  &.open {
    opacity: 1;
  }

  &.closing,
  &.opening {
    opacity: 0;
  }
`;

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
    transition: all 0.2s linear;

    &.open {
      translateY(0%);
    }

    &.opening,
    &.closing {
      transform: translateY(100%);
    }
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

export default ChallengePicker;
