import type { ListEntry } from '@onefootprint/types';
import { LinkButton, SearchInput, Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Error } from 'src/components';
import styled, { css } from 'styled-components';

import useListEntries from '@/lists/pages/details/hooks/use-list-entries';

import useListDetailsFilters from '../../hooks/use-list-details-filters';
import SectionTitle from '../section-title';
import AddEntriesDialog from './components/add-entries-dialog';
import EntryChip from './components/entry-chip';

const MAX_ENTRIES = 5;

const Entries = () => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.entries',
  });
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, error, data } = useListEntries(id);
  const filters = useListDetailsFilters();
  const [showAllEntries, setShowAllEntries] = useState(false);
  const shouldShowAllButton = data && data?.length > MAX_ENTRIES;
  const toggleExpanded = () => setShowAllEntries(!showAllEntries);
  const [showAddEntryDialog, setShowAddEntryDialog] = useState(false);

  const displayedEntries: ListEntry[] = useMemo(() => {
    const entries = data || [];
    return entries.slice(0, showAllEntries ? entries.length : MAX_ENTRIES);
  }, [data, showAllEntries]);

  const handleAddEntry = () => {
    setShowAddEntryDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddEntryDialog(false);
  };

  const handleNewEntryAdded = () => {
    setShowAddEntryDialog(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    // TODO: implement
    // eslint-disable-next-line no-console
    console.log('Delete entry', entryId);
  };

  if (error) {
    return <Error error={error} />;
  }

  return isLoading ? null : (
    <Stack gap={4} direction="column">
      <SectionTitle
        title={t('title')}
        button={{ label: t('add'), onClick: handleAddEntry }}
      />
      {data && data.length > 0 ? (
        <>
          <SearchInput
            placeholder={t('search-placeholder')}
            width="300px"
            onChangeText={value => filters.push({ search: value })}
            value={filters.query.search || ''}
          />
          <EntriesContainer>
            {displayedEntries.map(entry => (
              <EntryChip
                key={entry.id}
                label={entry.data}
                onDelete={() => {
                  handleDeleteEntry(entry.id);
                }}
              />
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
                  count: data.length - displayedEntries.length,
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
