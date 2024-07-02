import { IcoPasskey40 } from '@onefootprint/icons';
import { Box, Button, LinkButton, Stack, Text, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
const PasskeysIllustration = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.doc-scan.leverage.passkeys.illustration' });
  return (
    <IllustrationContainer>
      <CardContainer>
        <Stack direction="column" align="center" gap={5}>
          <IcoPasskey40 />
          <Text variant="heading-3">{t('title')}</Text>
          <Text variant="body-1" textAlign="center">
            {t('subtitle')}
          </Text>
        </Stack>
        <Button variant="primary" size="large" fullWidth>
          {t('launch-registration')}
        </Button>
        <LinkButton variant="label-3">{t('learn-more')}</LinkButton>
      </CardContainer>
      <FaceId>
        <motion.svg
          initial={{
            opacity: 0.5,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 1,
              delay: 2,
            },
          }}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_394_4042)">
            <path
              d="M0.78125 6.23047C1.29883 6.23047 1.57227 5.9375 1.57227 5.42969V3.125C1.57227 2.10938 2.10938 1.5918 3.08594 1.5918H5.44922C5.9668 1.5918 6.25 1.30859 6.25 0.800781C6.25 0.292969 5.9668 0.0195312 5.44922 0.0195312H3.06641C1.02539 0.0195312 0 1.02539 0 3.03711V5.42969C0 5.9375 0.283203 6.23047 0.78125 6.23047ZM18.3301 6.23047C18.8477 6.23047 19.1211 5.9375 19.1211 5.42969V3.03711C19.1211 1.02539 18.0957 0.0195312 16.0547 0.0195312H13.6621C13.1543 0.0195312 12.8711 0.292969 12.8711 0.800781C12.8711 1.30859 13.1543 1.5918 13.6621 1.5918H16.0254C16.9922 1.5918 17.5488 2.10938 17.5488 3.125V5.42969C17.5488 5.9375 17.832 6.23047 18.3301 6.23047ZM3.06641 19.1309H5.44922C5.9668 19.1309 6.25 18.8477 6.25 18.3496C6.25 17.8418 5.9668 17.5586 5.44922 17.5586H3.08594C2.10938 17.5586 1.57227 17.041 1.57227 16.0254V13.7207C1.57227 13.2031 1.28906 12.9199 0.78125 12.9199C0.273438 12.9199 0 13.2031 0 13.7207V16.1035C0 18.125 1.02539 19.1309 3.06641 19.1309ZM13.6621 19.1309H16.0547C18.0957 19.1309 19.1211 18.1152 19.1211 16.1035V13.7207C19.1211 13.2031 18.8379 12.9199 18.3301 12.9199C17.8223 12.9199 17.5488 13.2031 17.5488 13.7207V16.0254C17.5488 17.041 16.9922 17.5586 16.0254 17.5586H13.6621C13.1543 17.5586 12.8711 17.8418 12.8711 18.3496C12.8711 18.8477 13.1543 19.1309 13.6621 19.1309Z"
              fill="white"
              fillOpacity="0.85"
            />
            <path
              d="M5.83984 8.91602C6.29883 8.91602 6.63086 8.59375 6.63086 8.125V6.79688C6.63086 6.32812 6.29883 6.00586 5.83984 6.00586C5.38086 6.00586 5.05859 6.32812 5.05859 6.79688V8.125C5.05859 8.59375 5.38086 8.91602 5.83984 8.91602ZM8.7793 11.2207C8.79883 11.2207 8.82812 11.2207 8.85742 11.2207C9.84375 11.2207 10.3809 10.6836 10.3809 9.69727V6.62109C10.3809 6.24023 10.127 5.99609 9.75586 5.99609C9.36523 5.99609 9.11133 6.24023 9.11133 6.62109V9.78516C9.11133 9.88281 9.05273 9.93164 8.96484 9.93164H8.62305C8.27148 9.93164 7.99805 10.2051 7.99805 10.5566C7.99805 10.9766 8.28125 11.2207 8.7793 11.2207ZM13.252 8.91602C13.7012 8.91602 14.0234 8.59375 14.0234 8.125V6.79688C14.0234 6.32812 13.7012 6.00586 13.252 6.00586C12.7832 6.00586 12.4609 6.32812 12.4609 6.79688V8.125C12.4609 8.59375 12.7832 8.91602 13.252 8.91602ZM9.50195 14.502C10.6836 14.502 11.875 13.9941 12.7246 13.1445C12.8418 13.0371 12.9004 12.8711 12.9004 12.6758C12.9004 12.3047 12.627 12.041 12.2656 12.041C12.0801 12.041 11.9434 12.1094 11.7578 12.3047C11.2207 12.8613 10.3711 13.2422 9.50195 13.2422C8.68164 13.2422 7.82227 12.8809 7.25586 12.3047C7.09961 12.1582 6.97266 12.041 6.73828 12.041C6.37695 12.041 6.10352 12.3047 6.10352 12.6758C6.10352 12.8418 6.16211 12.998 6.28906 13.1348C7.08008 14.0332 8.32031 14.502 9.50195 14.502Z"
              fill="white"
              fillOpacity="0.85"
            />
          </g>
          <defs>
            <clipPath id="clip0_394_4042">
              <rect width="19.4824" height="19.1309" fill="white" />
            </clipPath>
          </defs>
        </motion.svg>
        <Text variant="label-3">{t('face-id')}</Text>
      </FaceId>
    </IllustrationContainer>
  );
};

const IllustrationContainer = styled(Box)`
  width: 100%;
  position: relative;
  height: 420px;
`;

const FaceId = styled(Box)`
  ${({ theme }) => css`
    position: absolute;
    padding: ${theme.spacing[7]} ${theme.spacing[8]} ${theme.spacing[5]} ${theme.spacing[8]};
    gap: ${theme.spacing[3]};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    background: linear-gradient(0deg, rgba(212, 212, 212, 0.80) 0%, rgba(212, 212, 212, 0.80) 100%), rgba(242, 242, 242, 0.80);
    border-radius: ${theme.borderRadius.lg};
    transform: translate(0px, 0px) rotate(-15deg);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.08);
    

    @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
      -webkit-backdrop-filter: blur(7px);
      backdrop-filter: blur(7px);
    }

    svg {
      width: 60px;
      height: 60px;
    }

    ${media.greaterThan('md')`
      top: 0;
      right: 0;
      left: auto;
      transform: translate(25%, -25%) rotate(15deg);
    `}
  `}
`;

const CardContainer = styled(Box)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    gap: ${theme.spacing[7]};
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius.xl};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[8]};
    height: 420px;
    width: 380px;
    max-width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `}
`;

export default PasskeysIllustration;
