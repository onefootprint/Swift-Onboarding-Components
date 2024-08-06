import { IcoAppclip24, IcoCheckCircle16, IcoCloseSmall16, IcoLaptop16, IcoSmartphone216 } from '@onefootprint/icons';
import { LinkButton, Stack, Text, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type DeviceCardProps = {
  icon: 'phone' | 'computer';
  deviceName: string;
  date: string;
  ip: string;
  biometric: boolean;
  appClip: boolean;
  id?: string;
  onWhatsThisClick?: () => void;
};

const cardAnimation = {
  initial: {
    x: '-50%',
    left: '50%',
    opacity: 0,
    y: 50,
    filter: 'blur(5px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    y: -50,
    filter: 'blur(5px)',
  },
};

const DeviceCard = ({ icon, deviceName, date, ip, biometric, appClip, id, onWhatsThisClick }: DeviceCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.behavior-and-device-insights.illustration',
  });

  const renderBiometricStatus = () => (
    <Stack direction="row" align="center" justify="center">
      {biometric ? (
        <Stack direction="row" align="center" justify="center" gap={2}>
          <IcoCheckCircle16 color="success" />
          <Text variant="label-2" color="success">
            {t('verified')}
          </Text>
        </Stack>
      ) : (
        <Stack direction="row" align="center" justify="center" gap={2}>
          <IcoCloseSmall16 color="error" />
          <Text variant="label-2" color="error">
            {t('not-verified')}
          </Text>
        </Stack>
      )}
    </Stack>
  );

  const renderAppClipInfo = () => (
    <Stack direction="row" align="center" justify="center" gap={3}>
      <Text variant="body-2" color="tertiary">
        {t('app-clip.title')}
      </Text>
      <Text variant="body-2" color="tertiary">
        ·
      </Text>
      <LinkButton variant="label-2" onClick={onWhatsThisClick}>
        {t('app-clip.whats-this')}
      </LinkButton>
    </Stack>
  );

  return (
    <CardContainer variants={cardAnimation} initial="initial" animate="animate" exit="exit" key={id}>
      <Stack direction="column" align="center" justify="center" gap={5}>
        <IconContainer>
          {icon === 'phone' ? <IcoSmartphone216 color="quinary" /> : <IcoLaptop16 color="quinary" />}
        </IconContainer>
        <Text variant="label-2">{deviceName}</Text>
      </Stack>
      <Stack direction="column" align="center" justify="center" gap={5}>
        <Stack direction="row" width="100%" align="center" justify="space-between">
          <Text variant="body-2" color="tertiary">
            {t('date-and-time')}
          </Text>
          <Text variant="label-2">{date}</Text>
        </Stack>
        <Stack direction="row" width="100%" align="center" justify="space-between">
          <Text variant="body-2" color="tertiary">
            {t('ip-address')}
          </Text>
          <Text variant="label-2">{ip}</Text>
        </Stack>
        <Stack direction="row" width="100%" align="center" justify="space-between">
          <Text variant="body-2" color="tertiary">
            {t('biometric')}
          </Text>
          {renderBiometricStatus()}
        </Stack>
        <Stack direction="row" width="100%" align="center" justify="space-between">
          {renderAppClipInfo()}
          <Stack direction="row" align="center" justify="center" gap={2}>
            <IcoAppclip24 />
            <Text variant="label-2">{appClip ? t('app-clip.yes') : t('app-clip.no')}</Text>
          </Stack>
        </Stack>
      </Stack>
    </CardContainer>
  );
};

const CardContainer = styled(motion(Stack))`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.xl};
    overflow: hidden;
    padding: ${theme.spacing[7]};
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(5px);
    width: 340px;
    position: absolute;
    box-shadow: ${theme.elevation[1]};
    flex-direction: column;
    gap: ${theme.spacing[6]};

    ${media.greaterThan('md')`
      border-radius: ${theme.borderRadius.lg};
      width: 400px;
    `}
  `}
`;

const IconContainer = styled(motion(Stack))`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.tertiary};
    border-radius: ${theme.borderRadius.full};
    padding: ${theme.spacing[3]};
  `}
`;

export default DeviceCard;
