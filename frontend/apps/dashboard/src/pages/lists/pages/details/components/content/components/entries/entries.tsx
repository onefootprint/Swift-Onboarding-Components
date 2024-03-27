import { LinkButton, SearchInput, Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useListEntries from '@/lists/pages/details/hooks/use-list-entries';

import useListDetailsFilters from '../../hooks/use-list-details-filters';
import SectionTitle from '../section-title';
// import EntryChip from './components/entry-chip';

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

  const entries = useMemo(() => data || [], [data]);
  const displayedEntries = useMemo(
    () => entries.slice(0, showAllEntries ? entries.length : MAX_ENTRIES),
    [entries, showAllEntries],
  );

  const handleAddEntry = () => {
    // TODO: implement
  };

  if (isLoading || error || !data) {
    return null;
  }

  return (
    <Stack gap={4} direction="column">
      <SectionTitle
        title={t('title')}
        button={{ label: t('add'), onClick: handleAddEntry }}
      />
      <SearchInput
        placeholder={t('search-placeholder')}
        width="300px"
        onChangeText={value => filters.push({ search: value })}
        value={filters.query.search || ''}
      />
      {/* TODO: implement showing the entries */}
      {/* <EntryChip onDelete={() => {}}>jane@doe.com</EntryChip> */}
      {data.length === 0 && (
        <Text variant="body-3" color="tertiary">
          {t('empty')}
        </Text>
      )}
      {shouldShowAllButton && (
        <ButtonContainer>
          <Text variant="caption-1" color="quaternary">
            {t('entries-more', {
              count: data.length - displayedEntries.length,
            })}
          </Text>
          <Text tag="span" variant="caption-1" color="quaternary">
            •
          </Text>
          <LinkButton variant="caption-1" onClick={toggleExpanded}>
            {showAllEntries ? t('show-less') : t('show-all')}
          </LinkButton>
        </ButtonContainer>
      )}
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

export default Entries;
