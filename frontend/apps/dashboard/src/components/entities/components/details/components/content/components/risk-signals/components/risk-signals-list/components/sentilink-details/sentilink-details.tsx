import { Drawer, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';
import useRiskSignalsFilters from 'src/components/entities/components/details/hooks/use-risk-signals-filters';
import useEntitySentilinkSignal from '../../hooks/use-entity-sentilink-signal';
import Content from './components/content';
import Loading from './components/loading';

const SentilinkDetails = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'risk-signals.sentilink.details' });
  const { query, clear } = useRiskSignalsFilters();
  const isOpen = !!query.risk_signal_id && !!query.is_sentilink && false; // placeholder - must disable standard details
  const entityId = useEntityId();
  const { data, isPending, error } = useEntitySentilinkSignal({
    entityId,
    riskSignalId: query.risk_signal_id || '',
  });

  return (
    <Drawer open={isOpen} title={t('title')} onClickOutside={clear} onClose={clear}>
      <>
        {data && <Content data={data} />}
        {isPending && <Loading />}
        {error && <div>Error</div>}
        <Stack
          position="absolute"
          left={0}
          bottom={0}
          width="500px"
          margin={0}
          padding={0}
          height="40px"
          justifyContent="flex-end"
          alignItems="center"
          backgroundColor="secondary"
          borderColor="tertiary"
          borderStyle="solid"
          borderTopWidth={1}
        >
          <Text variant="label-3" paddingRight={4}>
            {t('powered-by')}
          </Text>
        </Stack>
      </>
    </Drawer>
  );
};

export default SentilinkDetails;
