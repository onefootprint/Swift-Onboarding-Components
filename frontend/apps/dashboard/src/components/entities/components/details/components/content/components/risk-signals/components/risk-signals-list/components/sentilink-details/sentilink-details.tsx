import { Drawer } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';
import useRiskSignalsFilters from 'src/components/entities/components/details/hooks/use-risk-signals-filters';
import useEntitySentilinkSignal from '../../hooks/use-entity-sentilink-signal';
import Content from './components/content';

const SentilinkDetails = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'risk-signals' });
  const { query, clear } = useRiskSignalsFilters();
  const isOpen = !!query.risk_signal_id && !!query.is_sentilink && false; // placeholder - must disable standard details
  const entityId = useEntityId();
  const { data, isPending, error } = useEntitySentilinkSignal({
    entityId,
    riskSignalId: query.risk_signal_id || '',
  });

  return (
    <Drawer open={isOpen} title={t('sentilink.details.title')} onClickOutside={clear} onClose={clear}>
      <>
        {data && <Content />}
        {isPending && <div>Loading...</div>}
        {error && <div>Error</div>}
      </>
    </Drawer>
  );
};

export default SentilinkDetails;
