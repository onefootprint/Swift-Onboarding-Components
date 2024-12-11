import { getOrgListsByListIdEntriesOptions } from '@onefootprint/axios/dashboard';
import type { ListEntry } from '@onefootprint/request-types/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

const MAX_ENTRIES = 30;

export const useListEntries = (listId: string, searchTerm: string = '') => {
  const [showAllEntries, setShowAllEntries] = useState(false);
  const { isPending, error, data } = useQuery({
    ...getOrgListsByListIdEntriesOptions({
      path: { listId },
    }),
    enabled: !!listId,
  });

  const filteredEntries = useMemo(() => {
    if (!data) return [];
    if (!searchTerm) return data;
    return data.filter((entry: ListEntry) => entry.data.includes(searchTerm));
  }, [data, searchTerm]);

  const displayedEntries = useMemo(() => {
    const sortedEntries = [...filteredEntries].sort((a, b) => a.data.localeCompare(b.data));
    if (showAllEntries) return sortedEntries;
    return sortedEntries.slice(0, MAX_ENTRIES);
  }, [filteredEntries, showAllEntries]);

  const shouldShowAllButton = filteredEntries.length > MAX_ENTRIES;
  const hiddenEntriesCount = filteredEntries.length - displayedEntries.length;

  return {
    isPending,
    error,
    entries: data || [],
    filteredEntries,
    displayedEntries,
    showAllEntries,
    shouldShowAllButton,
    hiddenEntriesCount,
    toggleShowAll: () => setShowAllEntries(prev => !prev),
  };
};
