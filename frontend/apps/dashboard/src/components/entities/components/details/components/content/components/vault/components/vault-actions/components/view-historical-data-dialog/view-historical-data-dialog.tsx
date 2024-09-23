import { Dialog, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import mergeAuditTrailTimelineEvents from 'src/utils/merge-audit-trail-timeline-events';

import useCurrentEntityTimeline from '@/entity/hooks/use-current-entity-timeline';
import useEntityId from '@/entity/hooks/use-entity-id';

import ErrorComponent from 'src/components/error';
import Loading from './components/loading';
import ViewHistoricalDataForm from './components/view-historical-data-form';
import type { HistoricalFormData } from './view-historical-data-dialog.types';

export type ViewHistoricalDataDialogProps = {
  open: boolean;
  onClose: () => void;
};

const ViewHistoricalDataDialog = ({ open, onClose }: ViewHistoricalDataDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.view-historical-data',
  });
  const router = useRouter();
  const entityId = useEntityId();
  const { data: events, isLoading, error } = useCurrentEntityTimeline();
  const viewDataMutation = { isLoading: false };

  const handleViewHistorical = (data: HistoricalFormData) => {
    router.push({
      pathname: `/users/${entityId}`,
      query: { ...router.query, seqno: data.seqno },
    });
    onClose();
  };

  return (
    <Dialog
      size="compact"
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        disabled: viewDataMutation.isLoading,
        form: 'view-historical-data-form',
        label: t('form.continue'),
        loading: viewDataMutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: viewDataMutation.isLoading,
        label: t('form.cancel'),
        onClick: onClose,
      }}
    >
      {isLoading && <Loading />}
      {events && events.length > 0 ? (
        <ViewHistoricalDataForm events={mergeAuditTrailTimelineEvents(events)} onSubmit={handleViewHistorical} />
      ) : (
        <Text variant="body-3">{t('no-events')}</Text>
      )}
      {!!error && <ErrorComponent error={error} />}
    </Dialog>
  );
};

export default ViewHistoricalDataDialog;
