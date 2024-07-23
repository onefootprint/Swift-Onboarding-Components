import { BusinessWatchlist, EntityKind } from '@onefootprint/types';
import { SelectNew, Stack, Tag } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HitsList from './components/hits-list';

type WatchlistProps = {
  data: BusinessWatchlist;
};

const Watchlist = ({ data }: WatchlistProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights.watchlist',
  });
  const defaultSelection = Object.entries(data).length ? Object.entries(data)[0][0] : undefined;
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>(defaultSelection);
  const options = Object.keys(data).map(name => ({
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
              onChange={handleChange}
              options={options}
              size="compact"
              value={selectedEntity}
              triggerWidth="300px"
              contentWidth="300px"
            />
            <Tag>{data[selectedEntity].kind === EntityKind.business ? t('tags.business') : t('tags.person')}</Tag>
          </>
        )}
      </Stack>
      <HitsList entity={selectedEntity} hits={selectedEntity ? data[selectedEntity].hits : []} />
    </Stack>
  );
};

export default Watchlist;
