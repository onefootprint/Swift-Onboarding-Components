import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { EntityKind } from '@onefootprint/types';
import { Box, Dialog, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import WaveAnimation from 'src/components/wave-animation';
import { useTimeout } from 'usehooks-ts';

import useOnboardingConfigs from '../../../../../../hooks/use-onboarding-configs';
import useEntities from './hooks/use-entities';

const TIME_TO_SHOW_DIALOG = 1000;

const IntroDialog = () => {
  const { t } = useTranslation('pages.developers.dialog-test-onboarding');
  const { data: configs } = useOnboardingConfigs();
  const { data: entities } = useEntities(EntityKind.person);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const shouldShowIntroDialog =
    configs?.data.length === 1 && entities?.data?.length === 0;

  useTimeout(() => {
    if (shouldShowIntroDialog) {
      setIsDialogOpen(true);
    }
  }, TIME_TO_SHOW_DIALOG);

  const onClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      {shouldShowIntroDialog && <WaveAnimation width={140} />}
      <Dialog
        title={t('heading')}
        open={isDialogOpen}
        size="compact"
        onClose={onClose}
        primaryButton={{
          label: t('cta'),
          onClick: () => {
            setIsDialogOpen(false);
          },
        }}
        secondaryButton={{
          label: t('cancel'),
          onClick: () => {
            setIsDialogOpen(false);
          },
        }}
      >
        <Title>
          <Typography variant="label-2" as="h1">
            {t('title')}
          </Typography>
          <Typography variant="body-2" color="secondary" as="p">
            {t('subtitle')}
          </Typography>
        </Title>
        <Box sx={{ marginBottom: 6 }} />
        <Steps>
          <Step>
            <Typography variant="label-3">{t('step-1.number')}</Typography>
            <Content>
              <Typography variant="label-3" as="h2">
                {t('step-1.title')}
              </Typography>
              <Typography variant="body-3" color="secondary">
                {t('step-1.subtitle')}
              </Typography>
            </Content>
          </Step>
          <Step>
            <Typography variant="label-3">{t('step-2.number')}</Typography>
            <Content>
              <Typography variant="label-3" as="h2">
                {t('step-2.title')}
              </Typography>
              <Typography variant="body-3" color="secondary">
                {t('step-2.subtitle')}
              </Typography>
            </Content>
          </Step>
        </Steps>
      </Dialog>
    </>
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
