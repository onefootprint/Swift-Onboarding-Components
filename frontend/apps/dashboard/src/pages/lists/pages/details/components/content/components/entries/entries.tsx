import { type ListEntry, RoleScopeKind } from '@onefootprint/types';
import { LinkButton, SearchInput, Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Error } from 'src/components';
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
      return (data || []).filter((entry: ListEntry) =>
        entry.data.includes(filters.values.search),
      );
    }
    return data || [];
  }, [data, filters.values]);

  const displayedEntries: ListEntry[] = useMemo(() => {
    if (showAllEntries) {
      return filteredEntries;
    }
    return filteredEntries.slice(0, MAX_ENTRIES);
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
    return <Error error={error} />;
  }

  return isLoading ? null : (
    <Stack gap={4} direction="column">
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
          <SearchInput
            placeholder={t('search-placeholder')}
            width="300px"
            onChangeText={value => filters.push({ search: value })}
            value={filters.query.search || ''}
            size="compact"
          />
          <EntriesContainer>
            {displayedEntries.map(entry => (
              <PermissionGate
                key={entry.id}
                scopeKind={RoleScopeKind.writeLists}
                fallbackText={t('delete-not-allowed')}
              >
                <EntryChip key={entry.id} entry={entry} />
              </PermissionGate>
            ))}
          </EntriesContainer>
        </>
      ) : (
        <Text variant="body-3" color="tertiary">
          {t('empty')}
        </Text>
      )}
      {shouldShowAllButton && (
        <ButtonContainer>
          {showAllEntries ? (
            <LinkButton variant="caption-1" onClick={toggleExpanded}>
              {t('show-less')}
            </LinkButton>
          ) : (
            <>
              <Text variant="caption-1" color="quaternary">
                {t('entries-more', {
                  count: allCount,
                })}
              </Text>
              <Text tag="span" variant="caption-1" color="quaternary">
                •
              </Text>
              <LinkButton variant="caption-1" onClick={toggleExpanded}>
                {t('show-all')}
              </LinkButton>
            </>
          )}
        </ButtonContainer>
      )}
      <AddEntriesDialog
        open={showAddEntryDialog}
        onClose={handleCloseDialog}
        onAdd={handleNewEntryAdded}
      />
    </Stack>
  );
};

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    padding-bottom: ${theme.spacing[3]};
    padding-top: ${theme.spacing[3]};
    display: flex;
    align-items: center;
    justify-content: center;
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
