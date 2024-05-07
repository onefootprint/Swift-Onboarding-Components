import type {
  AddedRule,
  EditedRule,
  RuleBacktestingData,
} from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import useEvaluateRules from '../../hooks/use-evaluate-rules';
import type { DateFilterRange } from './backtesting-dialog.types';
import Content from './components/content';
import DEFAULT_DATE_RANGE from './components/date-filter/utils/get-default-date-range';
import Error from './components/error';
import Loading from './components/loading';

export type BacktestingDialogProps = {
  open: boolean;
  playbookId: string;
  ruleEdits: { add?: AddedRule[]; delete?: string[]; edit?: EditedRule[] };
  isSaveLoading: boolean;
  onSave: () => void;
  onClose: () => void;
};

const BacktestingDialog = ({
  open,
  playbookId,
  ruleEdits,
  isSaveLoading,
  onSave,
  onClose,
}: BacktestingDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.rules.backtesting',
  });
  const [data, setData] = useState<RuleBacktestingData | undefined>(undefined);
  const [error, setError] = useState<unknown | undefined>(undefined);
  const [dateRange, setDateRange] =
    useState<DateFilterRange>(DEFAULT_DATE_RANGE);
  const backtestMutation = useEvaluateRules();

  useEffectOnce(() => {
    handleBacktest();
  });

  const handleBacktest = (
    newDateRange: DateFilterRange = DEFAULT_DATE_RANGE,
  ) => {
    const fields = {
      ...ruleEdits,
      startTimestamp: newDateRange.startDate?.toISOString() || '',
      endTimestamp: newDateRange.endDate?.toISOString() || '',
    };
    backtestMutation.mutate(
      { playbookId, fields },
      {
        onSuccess: response => {
          setData(response.data);
          setDateRange(newDateRange);
        },
        onError: err => {
          setError(err);
        },
      },
    );
  };

  return (
    <Dialog
      title={t('title')}
      size="full-screen"
      onClose={onClose}
      open={open}
      headerButton={{
        label: t('save'),
        loading: isSaveLoading,
        onClick: onSave,
      }}
    >
      {data && (
        <Content data={data} dateRange={dateRange} onFilter={handleBacktest} />
      )}
      {backtestMutation.isLoading && <Loading />}
      {!!error && <Error error={error} />}
    </Dialog>
  );
};

export default BacktestingDialog;
