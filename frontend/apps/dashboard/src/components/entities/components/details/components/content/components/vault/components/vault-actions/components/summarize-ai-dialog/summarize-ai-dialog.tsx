import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoWand24 } from '@onefootprint/icons';
import {
  Banner,
  Dialog,
  Divider,
  Shimmer,
  Stack,
  Text,
  Tooltip,
} from '@onefootprint/ui';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import useEntityId from '@/entity/hooks/use-entity-id';

import useGenerateAiSummaryRequest from '../../hooks/use-ai-summarize';

export type SummarizeAiDialogueProps = {
  open: boolean;
  onClose: () => void;
};

const SummarizeAiDialogue = ({ open, onClose }: SummarizeAiDialogueProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.summarize',
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
      open &&
      !generateSummaryMutation.isLoading &&
      !generateSummaryMutation.isError &&
      !generateSummaryMutation.data;
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
  }, [
    open,
    generateSummaryMutation,
    entityId,
    handleClose,
    showRequestErrorToast,
  ]);

  return (
    <Dialog size="large" title={t('label')} onClose={handleClose} open={open}>
      <Stack gap={3} direction="column">
        {generateSummaryMutation.isLoading ? (
          <Stack gap={4} direction="column">
            <Shimmer sx={{ width: '100%', height: '500px' }} />

            <Banner variant="info">
              <Stack gap={2} direction="row">
                <Tooltip alignment="start" position="top" text={t('title')}>
                  <IcoWand24 />
                </Tooltip>
                <Text variant="body-4">{t('detail')}</Text>
              </Stack>
            </Banner>
          </Stack>
        ) : (
          generateSummaryMutation.data && (
            <>
              <Text variant="heading-3">Summary</Text>
              <Divider />
              <Text variant="body-3">
                {generateSummaryMutation.data.highLevelSummary}
              </Text>

              <Text variant="heading-3">Details</Text>
              <Divider />
              <Text variant="body-3">
                {generateSummaryMutation.data.detailedSummary}
              </Text>

              <Text variant="heading-3">Risk Signal Analysis</Text>
              <Divider />
              <Text variant="body-3">
                {generateSummaryMutation.data.riskSignalSummary}
              </Text>

              <Text variant="heading-3">Conclusion</Text>
              <Divider />
              <Text variant="body-3">
                {generateSummaryMutation.data.conclusion}
              </Text>
            </>
          )
        )}
      </Stack>
    </Dialog>
  );
};

export default SummarizeAiDialogue;
