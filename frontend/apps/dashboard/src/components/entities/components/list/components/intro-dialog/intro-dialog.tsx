import { EntityKind } from '@onefootprint/types';
import { Box, Dialog, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import useEntities from '../../hooks/use-entities/use-entities';
import usePlaybooks from './hooks/use-playbooks';

const TIME_TO_SHOW_DIALOG = 1000;

const IntroDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useTranslation('common', { keyPrefix: 'pages.entities.intro' });
  const { data: onboardings } = usePlaybooks();
  const { data: entities } = useEntities(EntityKind.person);
  const router = useRouter();
  const shouldShowDialog = onboardings?.length === 0 && entities?.data?.length === 0;

  useTimeout(() => {
    if (shouldShowDialog) {
      setIsDialogOpen(true);
    }
  }, TIME_TO_SHOW_DIALOG);

  const onClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <Dialog
      title={t('dialog.heading')}
      open={isDialogOpen}
      onClose={onClose}
      size="compact"
      primaryButton={{
        label: t('dialog.cta'),
        onClick: () => {
          router.push('/playbooks');
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
        <Text variant="label-2" tag="h1">
          {t('dialog.title')}
        </Text>
        <Text variant="body-2" color="secondary" tag="p">
          {t('dialog.subtitle')}
        </Text>
      </Title>
      <Box marginBottom={6} />
      <Steps>
        <Step>
          <Text variant="label-3">{t('dialog.step-1.number')}</Text>
          <Content>
            <Text variant="label-3" tag="h2">
              {t('dialog.step-1.title')}
            </Text>
            <Text variant="body-3" color="secondary">
              {t('dialog.step-1.subtitle')}
            </Text>
          </Content>
        </Step>
        <Step>
          <Text variant="label-3">{t('dialog.step-2.number')}</Text>
          <Content>
            <Text variant="label-3" tag="h2">
              {t('dialog.step-2.title')}
            </Text>
            <Text variant="body-3" color="secondary">
              {t('dialog.step-2.subtitle')}
            </Text>
          </Content>
        </Step>
        <Step>
          <Text variant="label-3">{t('dialog.step-3.number')}</Text>
          <Content>
            <Text variant="label-3" tag="h2">
              {t('dialog.step-3.title')}
            </Text>
            <Text variant="body-3" color="secondary">
              {t('dialog.step-3.subtitle')}
            </Text>
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
