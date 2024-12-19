import { SelectNew, Tag } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Subsection from '../../../../../subsection';
import type { FormattedWatchlist } from '../../../../onboarding-business-insight.types';
import HitsList from './components/hits-list';

type WatchlistProps = {
  data: FormattedWatchlist;
};

const Watchlist = ({ data: { watchlist, hitCount } }: WatchlistProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.watchlist' });
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
    <Subsection title={t('title-count', { hitCount })} hasDivider>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          {selectedEntity && (
            <>
              <SelectNew
                className="w-[300px]"
                onChange={handleChange}
                options={options}
                size="compact"
                value={selectedEntity}
              />
              <Tag>{watchlist[selectedEntity].kind === 'business' ? t('tags.business') : t('tags.person')}</Tag>
            </>
          )}
        </div>
        <HitsList entity={selectedEntity} hits={selectedEntity ? watchlist[selectedEntity].hits : []} />
      </div>
    </Subsection>
  );
};

export default Watchlist;
