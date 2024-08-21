import type { RiskSignal } from '@onefootprint/types';
import type { TableRow } from '@onefootprint/ui';
import { Box, Dialog, Table, Text } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Row from './components/row';
import useRiskSignalsOverviewFilters from './hooks/use-risk-signals-overview-filters';

const renderTr = ({ item }: TableRow<RiskSignal>) => <Row riskSignal={item} />;

export type ListDialogProps = {
  riskSignals: RiskSignal[];
  renderCta: (options: { onClick: () => void }) => React.ReactNode;
};

const ListDialog = ({ riskSignals, renderCta }: ListDialogProps) => {
  const filters = useRiskSignalsOverviewFilters();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity',
  });

  const [open, setOpen] = useState(false);
  const columns = [
    { id: 'severity', text: '', width: '20%' },
    { id: 'note', text: '', width: '65%' },
    { id: 'actions', text: '', width: '15%' },
  ];

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = (riskSignal: RiskSignal) => {
    filters.push({ risk_signal_id: riskSignal.id });
    handleClose();
  };

  return (
    <Box>
      <Dialog title={t('risks.list-dialog.title')} size="compact" onClose={handleClose} open={open}>
        <Text variant="body-3" marginBottom={6}>
          {t('risks.list-dialog.description')}
        </Text>
        <Table<RiskSignal>
          aria-label={t('risk-signals.table.aria-label')}
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

export default ListDialog;
