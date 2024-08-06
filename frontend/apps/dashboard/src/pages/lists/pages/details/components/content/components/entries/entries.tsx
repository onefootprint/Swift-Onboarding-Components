import { type ListEntry, RoleScopeKind } from '@onefootprint/types';
import { LinkButton, SearchInput, Stack, Text } from '@onefootprint/ui';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorComponent } from 'src/components';
import PermissionGate from 'src/components/permission-gate';
import styled, { css } from 'styled-components';

import useListEntries from '@/lists/pages/details/hooks/use-list-entries';

import useListDetailsFilters from '../../hooks/use-list-details-filters';
import SectionTitle from '../section-title';
import AddEntriesDialog from './components/add-entries-dialog';
import EntryChip from './components/entry-chip';

const MAX_ENTRIES = 30;

const Entries = () => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.entries',
  });
  const router = useRouter();
  const listId = router.query.id as string;
  const { isLoading, error, data } = useListEntries(listId);
  const filters = useListDetailsFilters();
  const [showAllEntries, setShowAllEntries] = useState(false);
  const toggleExpanded = () => setShowAllEntries(!showAllEntries);
  const [showAddEntryDialog, setShowAddEntryDialog] = useState(false);

  const filteredEntries: ListEntry[] = useMemo(() => {
    if (filters.values.search) {
      return (data || []).filter((entry: ListEntry) => entry.data.includes(filters.values.search));
    }
    return data || [];
  }, [data, filters.values]);

  const displayedEntries: ListEntry[] = useMemo(() => {
    const sortedEntries = [...filteredEntries].sort((a, b) => a.data.localeCompare(b.data));
    if (showAllEntries) {
      return sortedEntries;
    }
    return sortedEntries.slice(0, MAX_ENTRIES);
  }, [filteredEntries, showAllEntries]);

  const shouldShowAllButton = filteredEntries.length > MAX_ENTRIES;
  const allCount = filteredEntries.length - displayedEntries.length;

  const handleAddEntry = () => {
    setShowAddEntryDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddEntryDialog(false);
  };

  const handleNewEntryAdded = () => {
    setShowAddEntryDialog(false);
  };

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return isLoading ? null : (
    <Stack gap={5} direction="column">
      <SectionTitle
        title={t('title')}
        button={{
          label: t('add'),
          onClick: handleAddEntry,
          role: {
            scopeKind: RoleScopeKind.writeLists,
            fallbackText: t('cta-not-allowed'),
          },
        }}
      />
      {data && data.length > 0 ? (
        <>
          {data.length > 7 && (
            <SearchInput
              placeholder={t('search-placeholder')}
              width="300px"
              onChangeText={value => filters.push({ search: value })}
              value={filters.query.search || ''}
              size="compact"
            />
          )}

          <EntriesContainer>
            <AnimatePresence>
              {displayedEntries.map(entry => (
                <PermissionGate
                  key={entry.id}
                  scopeKind={RoleScopeKind.writeLists}
                  fallbackText={t('delete-not-allowed')}
                >
                  <EntryChip key={entry.id} entry={entry} />
                </PermissionGate>
              ))}
            </AnimatePresence>
          </EntriesContainer>
        </>
      ) : (
        <Text variant="body-3" color="tertiary">
          {t('empty')}
        </Text>
      )}
      {shouldShowAllButton && (
        <ButtonContainer align="flex-start">
          {showAllEntries ? (
            <LinkButton variant="label-4" onClick={toggleExpanded}>
              {t('show-less')}
            </LinkButton>
          ) : (
            <>
              <Text variant="label-4" color="quaternary">
                {t('entries-more', {
                  count: allCount,
                })}
              </Text>
              <Text tag="span" variant="label-4" color="quaternary">
                •
              </Text>
              <LinkButton variant="label-4" onClick={toggleExpanded}>
                {t('show-all')}
              </LinkButton>
            </>
          )}
        </ButtonContainer>
      )}
      <AddEntriesDialog open={showAddEntryDialog} onClose={handleCloseDialog} onAdd={handleNewEntryAdded} />
    </Stack>
  );
};

const ButtonContainer = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]};
    gap: ${theme.spacing[3]};
  `}
`;

const EntriesContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[3]};
  `}
`;

export default Entries;
