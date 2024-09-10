import { LogoFpCompact } from '@onefootprint/icons';
import { Box, Button, LinkButton, Stack, Text, createFontStyles } from '@onefootprint/ui';
import Image from 'next/image';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

type TakeoverProps = {
  tenantName: string;
};

const Takeover = ({ tenantName }: TakeoverProps) => {
  const { t } = useTranslation('onboarding', { keyPrefix: 'in-progresss' });
  return (
    <Stack width="100vw" height="100vh" center backgroundColor="secondary">
      <Box position="relative" maxWidth="400px">
        <PenguinImageContainer>
          <Image src="/onboarding/penguin-wink.svg" alt="Winking penguin" width="134" height="90" />
        </PenguinImageContainer>
        <Box
          backgroundColor="primary"
          borderWidth={1}
          width="100%"
          borderStyle="solid"
          borderColor="tertiary"
          borderRadius="lg"
          padding={8}
          display="flex"
          flexDirection="column"
          gap={7}
        >
          <LogoFpCompact />
          <Stack flexDirection="column" gap={5}>
            <Stack flexDirection="column" gap={4} alignItems="center">
              <Text center variant="label-2">
                {t('title')}
              </Text>
              <Text variant="body-3" textAlign="center">
                <Trans
                  ns="onboarding"
                  i18nKey="in-progresss.description"
                  values={{ tenantName }}
                  components={{
                    bold: <Bold as="span" />,
                  }}
                />
              </Text>
            </Stack>
            <Button variant="primary">{t('cta-single', { tenantName })}</Button>
            <Box display="flex" justifyContent="center" alignItems="center">
              <LinkButton>{t('cta-alternative')}</LinkButton>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
};

const Bold = styled.span`
  ${createFontStyles('label-3')}
`;

const PenguinImageContainer = styled(Box)`
  width: 140px;
  height: fit-content;
  position: absolute;
  transform: translateY(-100%);
  right: 30px;
  top: 4px;
  z-index: 0;

  img {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }
`;
export default Takeover;
