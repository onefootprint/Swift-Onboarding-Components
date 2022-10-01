import { useTranslation } from '@onefootprint/hooks';
import { DateRange, OnboardingStatus } from '@onefootprint/types';
import { Box, Dialog } from '@onefootprint/ui';
import React, { useState } from 'react';

import { useFilters } from '../../hooks/use-filters';
import Form, { FormData } from './components/form';

type FiltersProps = {
  renderCta: (options: {
    onClick: () => void;
    filtersCount: number;
  }) => React.ReactNode;
};

const Filters = ({ renderCta }: FiltersProps) => {
  const { t } = useTranslation('pages.users.filters.dialog');
  const { setFilter, filtersCount, filters } = useFilters();
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (formData: FormData) => {
    setFilter({
      dateRange: formData.dateRange,
      statuses: formData.statuses.toString(),
    });
    handleClose();
  };

  return (
    <Box>
      <Dialog
        title={t('title')}
        size="compact"
        primaryButton={{
          form: 'users-filters',
          label: t('cta'),
          type: 'submit',
        }}
        linkButton={{
          form: 'users-filters',
          label: t('clear'),
          type: 'reset',
        }}
        onClose={handleClose}
        open={open}
      >
        <Form
          onSubmit={handleSubmit}
          defaultValues={{
            dateRange: (filters.dateRange as DateRange) || DateRange.allTime,
            statuses: (filters.statuses
              ? filters.statuses.split(',')
              : []) as OnboardingStatus[],
          }}
        />
      </Dialog>
      {renderCta({ onClick: handleToggle, filtersCount })}
    </Box>
  );
};

export default Filters;
