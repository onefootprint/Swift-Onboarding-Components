import { Stack, Toggle } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import FilterButton from 'src/components/filter-button';
import useFilters from '../../../../hooks/use-filters';
import DrawerFilter from './drawer-filter';

const Filters = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'table.filters' });
  const filters = useFilters();

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    filters.push({ hide_disabled: e.target.checked ? 'true' : 'false' });
  };

  const handleOpenDrawer = () => {
    filters.push({ show_filters: 'true' });
  };

  const handleCloseDrawer = () => {
    filters.push({ show_filters: 'false' });
  };

  return (
    <Stack width="100%" justifyContent="space-between">
      <Stack>
        <FilterButton onClick={handleOpenDrawer} hasFilters={filters.hasFilters}>
          {t('cta')}
        </FilterButton>
      </Stack>
      <Toggle
        checked={filters.values.hideDisabled}
        label={t('hide-disabled')}
        onChange={handleToggleChange}
        size="compact"
      />
      <DrawerFilter
        isOpen={filters.values.showFilters}
        onClose={handleCloseDrawer}
        onSubmit={kinds => {
          filters.push({ kinds, show_filters: 'false' });
        }}
        defaultValues={filters.values.kinds}
      />
    </Stack>
  );
};

export default Filters;
