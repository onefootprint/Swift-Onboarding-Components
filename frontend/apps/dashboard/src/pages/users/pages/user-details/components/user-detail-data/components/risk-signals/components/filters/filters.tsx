import { useTranslation } from '@onefootprint/hooks';
import { Box, Dialog } from '@onefootprint/ui';
import React, { useState } from 'react';

import useFilters, {
  stringToArray,
} from '../../hooks/use-risk-signals-filters';
import Form, { FormData } from './components/signal-filters-form';

type FiltersProps = {
  renderCta: (options: {
    onClick: () => void;
    filtersCount: number;
  }) => React.ReactNode;
};

const Filters = ({ renderCta }: FiltersProps) => {
  const { t } = useTranslation();
  const filters = useFilters();
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (formData: FormData) => {
    filters.push({
      signal_severity: formData.severity.toString(),
      signal_scope: formData.scope.toString(),
    });
    handleClose();
  };

  return (
    <Box>
      <Dialog
        title={t('filters.title')}
        size="compact"
        primaryButton={{
          form: 'signals-filters',
          label: t('filters.apply'),
          type: 'submit',
        }}
        linkButton={{
          form: 'signals-filters',
          label: t('filters.clear'),
          type: 'reset',
        }}
        onClose={handleClose}
        open={open}
      >
        <Form
          onSubmit={handleSubmit}
          defaultValues={{
            severity: stringToArray(filters.query.signal_severity),
            scope: stringToArray(filters.query.signal_scope),
          }}
        />
      </Dialog>
      {renderCta({ onClick: handleToggle, filtersCount: filters.count })}
    </Box>
  );
};

export default Filters;
