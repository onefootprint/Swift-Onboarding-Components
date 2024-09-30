import { Stack, Toggle } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useFilters from '../../../../hooks/use-filters';

const Filters = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.playbooks' });
  const filters = useFilters();

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    filters.push({ hide_disabled: e.target.checked ? 'true' : 'false' });
  };

  return (
    <Stack width="100%" justifyContent="space-between">
      <Stack />
      <Toggle
        checked={filters.values.hideDisabled}
        label={t('table.filters.hide-disabled')}
        onChange={handleToggleChange}
        size="compact"
      />
    </Stack>
  );
};

export default Filters;
