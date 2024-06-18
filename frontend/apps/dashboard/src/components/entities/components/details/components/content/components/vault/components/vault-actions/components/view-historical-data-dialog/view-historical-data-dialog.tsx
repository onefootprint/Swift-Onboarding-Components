import { Dialog, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import mergeAuditTrailTimelineEvents from 'src/utils/merge-audit-trail-timeline-events';

import useCurrentEntityTimeline from '@/entity/hooks/use-current-entity-timeline';

import ErrorComponent from 'src/components/error';
import Loading from './components/loading';
import ViewHistoricalDataForm from './components/view-historical-data-form';

export type ViewHistoricalDataDialogProps = {
  open: boolean;
  onClose: () => void;
};

const ViewHistoricalDataDialog = ({ open, onClose }: ViewHistoricalDataDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.view-historical-data',
  });
  const { data: events, isLoading, error } = useCurrentEntityTimeline();
  const viewDataMutation = { isLoading: false };

  const handleViewHistorical = () => {
    onClose();
  };

  return (
    <Dialog
      size="compact"
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        form: 'view-historical-data-form',
        label: t('form.continue'),
        loading: viewDataMutation.isLoading,
        disabled: viewDataMutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('form.cancel'),
        onClick: onClose,
        disabled: viewDataMutation.isLoading,
      }}
    >
      {events?.length && (
        <ViewHistoricalDataForm events={mergeAuditTrailTimelineEvents(events)} onSubmit={handleViewHistorical} />
      )}
      {!!error && <ErrorComponent error={error} />}
      {events?.length === 0 && <Text variant="body-3">{t('no-events')}</Text>}
      {isLoading && <Loading />}
    </Dialog>
  );
};

export default ViewHistoricalDataDialog;
