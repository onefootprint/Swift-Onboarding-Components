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
};

const Takeover = ({ inProgressOnboardings }: TakeoverProps) => {
  const { t } = useTranslation('onboarding', { keyPrefix: 'in-progress' });
  const isSingleTenant = inProgressOnboardings.length === 1;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const closeDialog = () => {
    setIsConfirmOpen(false);
  };

  // placeholder
  const createBusinessAccount = () => {
    console.log('createBusinessAccount');
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
            {isSingleTenant ? (
              <Button variant="primary" onClick={() => handleOpenWebsite(inProgressOnboardings[0].tenant.websiteUrl)}>
                {t('cta-single', { tenantName: inProgressOnboardings[0].tenant.name })}
              </Button>
            ) : (
              <Stack flexDirection="column" gap={3}>
                {inProgressOnboardings.map(onboarding => (
                  <Button
                    key={onboarding.fpId}
                    variant="secondary"
                    onClick={() => handleOpenWebsite(onboarding.tenant.websiteUrl)}
                  >
                    {t('cta-single', { tenantName: onboarding.tenant.name })}
                  </Button>
                ))}
              </Stack>
            )}
            <Box display="flex" justifyContent="center" alignItems="center">
              <LinkButton>{t('cta-alternative')}</LinkButton>
            </Box>
          </Stack>
        </Box>
      </Box>
      <AreYouSure
        isOpen={isConfirmOpen}
        onCancel={closeDialog}
        // placeholder
        onCreateBusinessAccount={createBusinessAccount}
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
