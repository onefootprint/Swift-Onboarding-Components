import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoWand24 } from '@onefootprint/icons';
import { Dialog, LoadingSpinner, Stack, Text } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useEntityId from '@/entity/hooks/use-entity-id';

import useGenerateAiSummaryRequest from '../../hooks/use-ai-summarize';

export type SummarizeAiDialogProps = {
  open: boolean;
  onClose: () => void;
};

const SummarizeAiDialog = ({ open, onClose }: SummarizeAiDialogProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'actions.summarize',
  });
  const generateSummaryMutation = useGenerateAiSummaryRequest();
  const showRequestErrorToast = useRequestErrorToast();
  const entityId = useEntityId();

  const handleClose = useCallback(() => {
    generateSummaryMutation.reset();
    onClose();
  }, [generateSummaryMutation, onClose]);

  useEffect(() => {
    const shouldGenerate =
      open && !generateSummaryMutation.isPending && !generateSummaryMutation.isError && !generateSummaryMutation.data;
    if (!shouldGenerate) {
      return;
    }
    generateSummaryMutation.mutate(
      {
        entityId,
      },
      {
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          handleClose();
        },
      },
    );
  }, [open, generateSummaryMutation, entityId, handleClose, showRequestErrorToast]);

  const summaryContent = [
    {
      title: 'summary',
      content: generateSummaryMutation.data?.highLevelSummary,
    },
    {
      title: 'details',
      content: generateSummaryMutation.data?.detailedSummary,
    },
    {
      title: 'risk-signal-analysis',
      content: generateSummaryMutation.data?.riskSignalSummary,
    },
    {
      title: 'conclusion',
      content: generateSummaryMutation.data?.conclusion,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, filter: 'blur(5px)' },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.5 } },
  };

  return (
    <Dialog size="default" title={t('title')} onClose={handleClose} open={open}>
      <Stack gap={3} direction="column" paddingBottom={4}>
        <AnimatePresence>
          {generateSummaryMutation.isPending ? (
            <EmptyState gap={5} direction="column" width="100%" height="420px" align="center" justify="center">
              <LoadingSpinner />
              <Text variant="label-3">{t('generating-summary')}</Text>
            </EmptyState>
          ) : (
            generateSummaryMutation.data && (
              <ResponseContainer
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                direction="column"
                gap={7}
              >
                {summaryContent.map(({ title, content }) => (
                  <Section direction="column" gap={2}>
                    <Text variant="label-2" color="secondary">
                      {t(title as unknown as ParseKeys<'common'>)}
                    </Text>
                    <Text variant="body-3">{content}</Text>
                  </Section>
                ))}
              </ResponseContainer>
            )
          )}
          <InlineMessage role="alert" gap={4}>
            <Stack flexShrink={0}>
              <IcoWand24 color="info" />
            </Stack>
            <Stack direction="column" alignItems="flex-start">
              <Text variant="body-3">{t('detail')}</Text>
            </Stack>
          </InlineMessage>
        </AnimatePresence>
      </Stack>
    </Dialog>
  );
};

const EmptyState = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    border: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
  `}
`;

const InlineMessage = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]};
    background-color: ${theme.backgroundColor.info};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    color: ${theme.color.info};
  `}
`;

const ResponseContainer = styled(motion(Stack))`
  ${({ theme }) => css`
    padding-bottom: ${theme.spacing[5]};
  `}
`;

const Section = styled(motion(Stack))``;

export default SummarizeAiDialog;
