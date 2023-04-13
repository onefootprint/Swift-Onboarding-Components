import { useTranslation } from '@onefootprint/hooks';
import { Box, Dialog, Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import useOnboardingConfigs from './hooks/use-onboarding-configs';

const TIME_TO_SHOW_DIALOG = 1000;

const IntroDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useTranslation('components.first-config');
  const { data } = useOnboardingConfigs();
  const router = useRouter();
  const shouldShowDialog = data?.length === 0;

  useTimeout(() => {
    if (shouldShowDialog) {
      setIsDialogOpen(true);
    }
  }, TIME_TO_SHOW_DIALOG);

  return (
    <Dialog
      title={t('dialog.heading')}
      open={isDialogOpen}
      onClose={() => {
        setIsDialogOpen(false);
      }}
      size="compact"
      primaryButton={{
        label: t('dialog.cta'),
        onClick: () => {
          router.push('/developers');
        },
      }}
      secondaryButton={{
        label: t('dialog.cancel'),
        onClick: () => {
          setIsDialogOpen(false);
        },
      }}
    >
      <Title>
        <Typography variant="label-2" as="h1">
          {t('dialog.title')}
        </Typography>
        <Typography variant="body-2" color="secondary" as="p">
          {t('dialog.subtitle')}
        </Typography>
      </Title>
      <Box sx={{ marginBottom: 6 }} />
      <Steps>
        <Step>
          <Typography variant="label-3">{t('dialog.step-1.number')}</Typography>
          <Content>
            <Typography variant="label-3" as="h2">
              {t('dialog.step-1.title')}
            </Typography>
            <Typography variant="body-3" color="secondary">
              {t('dialog.step-1.subtitle')}
            </Typography>
          </Content>
        </Step>
        <Step>
          <Typography variant="label-3">{t('dialog.step-2.number')}</Typography>
          <Content>
            <Typography variant="label-3" as="h2">
              {t('dialog.step-2.title')}
            </Typography>
            <Typography variant="body-3" color="secondary">
              {t('dialog.step-2.subtitle')}
            </Typography>
          </Content>
        </Step>
        <Step>
          <Typography variant="label-3">{t('dialog.step-3.number')}</Typography>
          <Content>
            <Typography variant="label-3" as="h2">
              {t('dialog.step-3.title')}
            </Typography>
            <Typography variant="body-3" color="secondary">
              {t('dialog.step-3.subtitle')}
            </Typography>
          </Content>
        </Step>
      </Steps>
    </Dialog>
  );
};

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: ${theme.spacing[4]};
    gap: ${theme.spacing[1]};

    h1 {
      width: 100%;
    }
  `}
`;

const Steps = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const Step = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: ${theme.spacing[4]};
    width: 100%;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

export default IntroDialog;
