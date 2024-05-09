import type {
  BacktestingRuleAction,
  RuleBacktestingData,
} from '@onefootprint/types';
import { Divider, Pagination, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { DateFilterRange, Page } from '../../backtesting-dialog.types';
import ActionCard from '../action-card';
import CorrelationActionCard from '../correlation-action-card';
import DateFilter from '../date-filter';
import Table from '../table';

export type ContentProps = {
  data: RuleBacktestingData;
  dateRange: DateFilterRange;
  onFilter: (range: DateFilterRange) => void;
};

const PAGE_SIZE = 10;

const Content = ({ data, dateRange, onFilter }: ContentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.rules.backtesting',
  });
  const initialPage = useMemo(
    () => ({
      hasNextPage:
        data.results.filter(
          ob => ob.historicalActionTriggered !== ob.backtestActionTriggered,
        ).length > PAGE_SIZE,
      hasPrevPage: false,
      pageIndex: 0,
    }),
    [data.results],
  );
  const [pagination, setPagination] = useState<Page>(initialPage);
  const affectedOnboardings = data.results.filter(
    ob => ob.historicalActionTriggered !== ob.backtestActionTriggered,
  );
  const numAffected = affectedOnboardings.length;
  const numTotal = data.stats.total;

  useEffect(() => {
    setPagination(initialPage);
  }, [initialPage]);

  const loadNextPage = () => {
    setPagination(currPage => ({
      hasNextPage: (currPage.pageIndex + 2) * PAGE_SIZE + 1 < numAffected,
      hasPrevPage: true,
      pageIndex: currPage.pageIndex + 1,
    }));
  };

  const loadPrevPage = () => {
    setPagination(({ pageIndex }) => ({
      hasNextPage: true,
      hasPrevPage: pageIndex - 1 > 0,
      pageIndex: pageIndex - 1,
    }));
  };

  const getPageResults = () => {
    const startIndex = pagination.pageIndex * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return affectedOnboardings.slice(startIndex, endIndex);
  };

  const renderHeading = (section: string, isFirst?: boolean) => (
    <Stack direction="column" gap={1} marginBottom={isFirst ? 0 : 4}>
      <Text variant="label-3">
        {t(`${section}.heading` as ParseKeys<'common'>, {
          count: numAffected,
          total: numTotal,
        })}
      </Text>
      <Text variant="body-3" color="tertiary">
        {t(`${section}.description` as ParseKeys<'common'>, {
          count: numAffected,
        })}
      </Text>
    </Stack>
  );

  return (
    <Container>
      <Stack justify="space-between" align="center" marginBottom={4}>
        {renderHeading('affected', true)}
        <DateFilter dateRange={dateRange} onChange={onFilter} />
      </Stack>
      <Stack direction="column" marginBottom={9}>
        <Table data={getPageResults()} isEmpty={!numTotal} />
        <Pagination
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onNextPage={loadNextPage}
          onPrevPage={loadPrevPage}
          pageIndex={pagination.pageIndex}
          pageSize={PAGE_SIZE}
          totalNumResults={numAffected}
        />
      </Stack>
      <Divider marginTop={9} marginBottom={9} />
      <Stack direction="column" marginBottom={9}>
        {renderHeading('historical')}
        <ActionCard
          data={data.stats.countByHistoricalActionTriggered}
          numTotal={numTotal}
        />
      </Stack>
      <Stack direction="column" marginBottom={9}>
        {renderHeading('backtested')}
        <ActionCard
          data={data.stats.countByBacktestActionTriggered}
          numTotal={numTotal}
        />
      </Stack>
      {!!numTotal && (
        <Stack direction="column">
          {renderHeading('correlation')}
          <Stack direction="column" gap={5}>
            {Object.keys(
              data.stats.countByHistoricalAndBacktestActionTriggered,
            ).map(sectionAction => (
              <CorrelationActionCard
                key={sectionAction}
                sectionAction={sectionAction as BacktestingRuleAction}
                data={
                  data.stats.countByHistoricalAndBacktestActionTriggered[
                    sectionAction as BacktestingRuleAction
                  ] || {}
                }
              />
            ))}
          </Stack>
        </Stack>
      )}
    </Container>
  );
};

const Container = styled.div`
  margin: auto;
  max-width: 960px;
`;

export default Content;
