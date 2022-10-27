import { useTranslation } from '@onefootprint/hooks';
import { RiskSignal } from '@onefootprint/types';
import { Box, Dialog, Table, TableRow, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import RiskRow from './components/risk-signal-row';
import useRiskSignalsOverviewFilters from './hooks/use-risk-signals-overview-filters';

const renderTr = ({ item }: TableRow<RiskSignal>) => (
  <RiskRow riskSignal={item} />
);

export type RiskSignalsOverviewDialogProps = {
  riskSignals: RiskSignal[];
  renderCta: (options: { onClick: () => void }) => React.ReactNode;
};

const RiskSignalsOverviewDialog = ({
  riskSignals,
  renderCta,
}: RiskSignalsOverviewDialogProps) => {
  const filters = useRiskSignalsOverviewFilters();
  const { t } = useTranslation(
    'pages.user-details.user-info.risks.list-dialog',
  );

  const [open, setOpen] = useState(false);
  const columns = [
    { id: 'severity', text: '', width: '20%' },
    { id: 'description', text: '', width: '65%' },
    { id: 'actions', text: '', width: '15%' },
  ];

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = (riskSignal: RiskSignal) => {
    filters.push({ signal_id: riskSignal.id });
    handleClose();
  };

  return (
    <Box>
      <Dialog
        title={t('title')}
        size="compact"
        onClose={handleClose}
        open={open}
      >
        <Typography variant="body-3" sx={{ marginBottom: 6 }}>
          {t('description')}
        </Typography>
        <Table<RiskSignal>
          aria-label={t('table.aria-label')}
          columns={columns}
          getKeyForRow={(signal: RiskSignal) => signal.id}
          hideThead
          items={riskSignals}
          onRowClick={handleClick}
          renderTr={renderTr}
        />
      </Dialog>
      {renderCta({ onClick: handleToggle })}
    </Box>
  );
};

export default RiskSignalsOverviewDialog;
