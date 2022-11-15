import { useTranslation } from '@onefootprint/hooks';
import { DateRange } from '@onefootprint/types';
import { Box, Dialog } from '@onefootprint/ui';
import React, { useState } from 'react';
import { getDateRange } from 'src/utils/date-range';

import { NEXT_WEEK, TODAY } from '../../../../table-filters-constants';
import useOrgMembersFilters from '../../hooks/use-org-members-filters';
import MemberFiltersForm, {
  MemberFiltersFormData,
} from './components/member-filters-form/member-filters-form';

type CtaOptions = {
  onClick: () => void;
  filtersCount: number;
};

type MemberFiltersProps = {
  renderCta: (options: CtaOptions) => React.ReactNode;
};

const MemberFilters = ({ renderCta }: MemberFiltersProps) => {
  const { t } = useTranslation(
    'pages.settings.team-roles.people.filters.dialog',
  );
  const { setFilter, filtersCount, filters } = useOrgMembersFilters();
  const [open, setOpen] = useState(false);
  const [dateRange, from, to] = getDateRange(filters);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (formData: MemberFiltersFormData) => {
    setFilter({
      dateRange: formData.dateRange,
      roles: formData.roles.toString(),
      emails: formData.emails.toString(),
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
        <MemberFiltersForm
          onSubmit={handleSubmit}
          defaultValues={{
            customDate: {
              from: from ? new Date(from) : TODAY,
              to: to ? new Date(to) : NEXT_WEEK,
            },
            dateRange: (dateRange as DateRange) || DateRange.allTime,
            roles: filters.roles?.split(',') ?? [],
            emails: filters.emails?.split(',') ?? [],
          }}
        />
      </Dialog>
      {renderCta({ onClick: handleToggle, filtersCount })}
    </Box>
  );
};

export default MemberFilters;
