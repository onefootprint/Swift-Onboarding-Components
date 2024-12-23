import useRiskSignalsFilters from '@/entities/components/details/hooks/use-risk-signals-filters';
import useEntityId from '@/entity/hooks/use-entity-id';
import { postEntitiesByFpIdSentilinkBySignalIdOptions } from '@onefootprint/axios/dashboard';
import { Drawer, Stack, Text } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';
import styled from 'styled-components';
import Content from './components/content';
import Loading from './components/loading';

const SentilinkDetails = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.risk-signals.drawer.sentilink' });
  const {
    query,
    values: { sentilinkRiskSignalId },
    clear,
  } = useRiskSignalsFilters();
  const isOpen = Boolean(query.risk_signal_id) && Boolean(query.is_sentilink);
  const entityId = useEntityId();
  const { data, isPending, error } = useQuery({
    ...postEntitiesByFpIdSentilinkBySignalIdOptions({
      path: {
        fpId: entityId,
        signalId: sentilinkRiskSignalId ?? '',
      },
    }),
    enabled: Boolean(sentilinkRiskSignalId),
  });

  return (
    <Drawer open={isOpen} title={t('title')} onClickOutside={clear} onClose={clear}>
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
