import useEntityId from '@/entity/hooks/use-entity-id';
import { Drawer, Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import useRiskSignalsFilters from 'src/components/entities/components/details/hooks/use-risk-signals-filters';
import ErrorComponent from 'src/components/error';
import styled from 'styled-components';
import useEntitySentilinkSignal from '../../hooks/use-entity-sentilink-signal';
import Content from './components/content';
import Loading from './components/loading';

const SentilinkDetails = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'risk-signals.sentilink.details' });
  const { query, values, clear } = useRiskSignalsFilters();
  const isOpen = !!query.risk_signal_id && !!query.is_sentilink;
  const entityId = useEntityId();
  const { data, isPending, error } = useEntitySentilinkSignal({
    entityId,
    riskSignalId: values.sentilinkRiskSignalId,
  });

  return (
    <Drawer open={isOpen} title={t('title')} onClickOutside={clear} onClose={clear}>
      <>
        {data && <Content data={data} />}
        {isPending && <Loading />}
        {error && <ErrorComponent error={error} />}
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
            {t('powered-by')}{' '}
            <StyledLink href="https://sentilink.com" target="_blank">
              {t('sentilink')}
            </StyledLink>
          </Text>
        </Stack>
        <Stack height="40px" />
      </>
    </Drawer>
  );
};

const StyledLink = styled(Link)`
  ${({ theme }) => `
    && {
      text-decoration: underline;
      color: ${theme.color.primary};
    }
  `}
`;

export default SentilinkDetails;
