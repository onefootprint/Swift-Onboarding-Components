import { LogoFpCompact } from '@onefootprint/icons';
import type { InProgressOnboarding } from '@onefootprint/types';
import { Box, Button, LinkButton, Stack, Text, createFontStyles } from '@onefootprint/ui';
import Image from 'next/image';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import AreYouSure from './components/are-you-sure';

type TakeoverProps = {
  inProgressOnboardings: InProgressOnboarding[];
  onConfirm: () => void;
};

const Takeover = ({ inProgressOnboardings, onConfirm }: TakeoverProps) => {
  const { t } = useTranslation('onboarding', { keyPrefix: 'in-progress' });
  const isSingleTenant = inProgressOnboardings.length === 1;
  const singleTenant = isSingleTenant ? inProgressOnboardings[0] : null;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const closeDialog = () => {
    setIsConfirmOpen(false);
  };

  const handleOpenConfirmDialog = () => {
    setIsConfirmOpen(true);
  };

  const handleOpenWebsite = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

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
          aria-label={t('aria')}
        >
          <LogoFpCompact />
          <Stack flexDirection="column" gap={5}>
            <Stack flexDirection="column" gap={4} alignItems="center">
              <Text center variant="label-2">
                {t('title')}
              </Text>
              {isSingleTenant ? (
                <Text variant="body-3" textAlign="center" aria-label="description">
                  <Trans
                    ns="onboarding"
                    i18nKey="in-progress.description"
                    values={{ tenantName: inProgressOnboardings[0].tenant.name }}
                    components={{
                      bold: <Bold as="span" />,
                    }}
                  />
                </Text>
              ) : (
                <Text variant="body-3" textAlign="center" aria-label="description">
                  <Trans
                    ns="onboarding"
                    i18nKey="in-progress.description-many"
                    values={{
                      tenantNameFirst: inProgressOnboardings
                        .slice(0, -1)
                        .map(o => o.tenant.name)
                        .join(', '),
                      tenantNameSecond: inProgressOnboardings[inProgressOnboardings.length - 1].tenant.name,
                    }}
                    components={{
                      bold: <Bold as="span" />,
                    }}
                  />
                </Text>
              )}
            </Stack>
            {isSingleTenant && singleTenant?.tenant.websiteUrl && (
              <Button variant="primary" onClick={() => handleOpenWebsite(singleTenant.tenant.websiteUrl)}>
                {t('cta-single', { tenantName: singleTenant.tenant.name })}
              </Button>
            )}

            {!isSingleTenant && (
              <Stack flexDirection="column" gap={3}>
                {inProgressOnboardings.map(onboarding =>
                  onboarding.tenant.websiteUrl ? (
                    <Button
                      key={onboarding.fpId}
                      variant="secondary"
                      onClick={() => handleOpenWebsite(onboarding.tenant.websiteUrl)}
                    >
                      {t('cta-single', { tenantName: onboarding.tenant.name })}
                    </Button>
                  ) : null,
                )}
              </Stack>
            )}
            <Stack center>
              <LinkButton onClick={handleOpenConfirmDialog}>{t('cta-alternative')}</LinkButton>
            </Stack>
          </Stack>
        </Box>
      </Box>
      <AreYouSure
        isOpen={isConfirmOpen}
        onCancel={closeDialog}
        onConfirm={onConfirm}
        inProgressOnboardings={inProgressOnboardings}
      />
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
