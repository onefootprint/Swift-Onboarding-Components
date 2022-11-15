import { useTranslation } from '@onefootprint/hooks';
import { Box, Dialog } from '@onefootprint/ui';
import React, { useState } from 'react';

import useOrgRolesFilters from '../../hooks/use-org-roles-filters';
import RoleFiltersForm from './components/role-filters-form';

type CtaOptions = {
  onClick: () => void;
  filtersCount: number;
};

type RoleFiltersProps = {
  renderCta: (options: CtaOptions) => React.ReactNode;
};

const RoleFilters = ({ renderCta }: RoleFiltersProps) => {
  const { t } = useTranslation(
    'pages.settings.team-roles.people.filters.dialog',
  );
  const { filtersCount } = useOrgRolesFilters();
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
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
        <RoleFiltersForm />
      </Dialog>
      {renderCta({ onClick: handleToggle, filtersCount })}
    </Box>
  );
};

export default RoleFilters;
