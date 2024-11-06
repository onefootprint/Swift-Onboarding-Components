import { Dialog, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'actions.view-historical-data',
  });
  const router = useRouter();
  const entityId = useEntityId();
  const timelineQuery = useCurrentEntityTimeline();
  const viewDataMutation = { isPending: false };

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
        disabled: viewDataMutation.isPending,
        form: 'view-historical-data-form',
        label: t('form.continue'),
        loading: viewDataMutation.isPending,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: viewDataMutation.isPending,
        label: t('form.cancel'),
        onClick: onClose,
      }}
    >
      {timelineQuery.isPending && <Loading />}
      {timelineQuery.data ? (
        <ViewHistoricalDataForm events={timelineQuery.data} onSubmit={handleViewHistorical} />
      ) : (
        <Text variant="body-3">{t('no-events')}</Text>
      )}
      {!!timelineQuery.error && <ErrorComponent error={timelineQuery.error} />}
    </Dialog>
  );
};

export default ViewHistoricalDataDialog;
