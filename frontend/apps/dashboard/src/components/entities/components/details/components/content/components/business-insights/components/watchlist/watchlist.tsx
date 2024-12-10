import { type BusinessWatchlist, EntityKind } from '@onefootprint/types';
import { SelectNew, Stack, Tag } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HitsList from './components/hits-list';

type WatchlistProps = {
  data: BusinessWatchlist;
};

const Watchlist = ({ data }: WatchlistProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.watchlist',
  });
  const { watchlist } = data;
  const defaultSelection = Object.entries(watchlist).length ? Object.entries(watchlist)[0][0] : undefined;
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>(defaultSelection);
  const options = Object.keys(watchlist).map(name => ({
    label: name,
    value: name,
  }));

  const handleChange = (value: string) => {
    setSelectedEntity(value);
  };

  return (
    <Stack direction="column" gap={4}>
      <Stack gap={5} align="center">
        {selectedEntity && (
          <>
            <SelectNew
              className="w-[300px]"
              contentWidth="300px"
              onChange={handleChange}
              options={options}
              size="compact"
              value={selectedEntity}
            />
            <Tag>{watchlist[selectedEntity].kind === EntityKind.business ? t('tags.business') : t('tags.person')}</Tag>
          </>
        )}
      </Stack>
      <HitsList entity={selectedEntity} hits={selectedEntity ? watchlist[selectedEntity].hits : []} />
    </Stack>
  );
};

export default Watchlist;
