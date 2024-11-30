import { Drawer, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterButton from 'src/components/filter-button';

const Filters = () => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'filters' });
  const [isOpen, setIsOpen] = useState(false);

  const closeDialog = () => setIsOpen(false);

  return (
    <>
      <FilterButton onClick={() => setIsOpen(!isOpen)} hasFilters={isOpen}>
        <Text variant="label-3">{t('cta')}</Text>
      </FilterButton>
      <Drawer
        open={isOpen}
        onClose={closeDialog}
        title={t('apply-filters')}
        primaryButton={{
          label: t('apply'),
          // TODO - filter logic here
          onClick: closeDialog,
        }}
        // TODO - filter logic here
        linkButton={{
          label: t('clear-filters'),
          onClick: closeDialog,
        }}
      >
        <Stack>
          <Text variant="label-3">PLACEHOLDER</Text>
        </Stack>
      </Drawer>
    </>
  );
};

export default Filters;
