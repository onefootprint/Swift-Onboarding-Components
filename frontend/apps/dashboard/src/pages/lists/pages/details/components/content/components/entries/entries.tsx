import { RoleScopeKind } from '@onefootprint/types';
import { Button, LinkButton, SearchInput } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorComponent } from 'src/components';
import PermissionGate from 'src/components/permission-gate';
import SectionTitle from '../../../section-title';
import useListDetailsFilters from '../../hooks/use-list-details-filters';
import AddEntriesDialog from './components/add-entries-dialog';
import EntryChip from './components/entry-chip';
import { useListEntries } from './hooks/use-list-entries';

const Entries = () => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.entries' });
  const router = useRouter();
  const listId = router.query.id as string;
  const filters = useListDetailsFilters();
  const [showAddEntryDialog, setShowAddEntryDialog] = useState(false);

  const {
    error,
    isPending,
    entries,
    displayedEntries,
    shouldShowAllButton,
    hiddenEntriesCount,
    showAllEntries,
    toggleShowAll,
  } = useListEntries(listId, filters.values.search);

  const handleAddEntry = () => {
    setShowAddEntryDialog(true);
  };

  const setHideAddEntryDialog = () => {
    setShowAddEntryDialog(false);
  };

  if (error) {
    return <ErrorComponent error={error} />;
  }

  if (isPending) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title={t('title')}>
        <PermissionGate scopeKind={RoleScopeKind.writeLists} fallbackText={t('cta-not-allowed')}>
          <Button variant="secondary" onClick={handleAddEntry} size="compact">
            {t('add')}
          </Button>
        </PermissionGate>
      </SectionTitle>
      {entries.length > 0 ? (
        <>
          {entries.length > 7 && (
            <SearchInput
              placeholder={t('search-placeholder')}
              width="300px"
              onChangeText={value => filters.push({ search: value })}
              value={filters.query.search || ''}
              size="compact"
            />
          )}
          <div className="flex flex-wrap gap-2">
            {displayedEntries.map(entry => (
              <PermissionGate
                key={entry.id}
                scopeKind={RoleScopeKind.writeLists}
                fallbackText={t('delete-not-allowed')}
              >
                <EntryChip entry={entry} />
              </PermissionGate>
            ))}
          </div>
        </>
      ) : (
        <div className="text-tertiary text-body-3">{t('empty')}</div>
      )}
      {shouldShowAllButton && (
        <div className="flex items-start gap-2 p-2">
          {showAllEntries ? (
            <LinkButton variant="label-3" onClick={toggleShowAll}>
              {t('show-less')}
            </LinkButton>
          ) : (
            <>
              <div className="text-quaternary text-label-3">{t('entries-more', { count: hiddenEntriesCount })}</div>
              <span className="text-quaternary text-label-3">•</span>
              <LinkButton variant="label-3" onClick={toggleShowAll}>
                {t('show-all')}
              </LinkButton>
            </>
          )}
        </div>
      )}
      <AddEntriesDialog open={showAddEntryDialog} onClose={setHideAddEntryDialog} onAdd={setHideAddEntryDialog} />
    </div>
  );
};

export default Entries;
