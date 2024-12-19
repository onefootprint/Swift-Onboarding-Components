import type { InsightWatchlist, WatchlistHit } from '@onefootprint/request-types/dashboard';
import { EMPTY_VALUE } from '../../../../constants';
import type { FormattedWatchlist } from '../../../../onboarding-business-insight.types';

const formatWatchlist = (watchlist: InsightWatchlist | undefined): FormattedWatchlist => {
  if (!watchlist) return { hitCount: 0, watchlist: {} };

  const formatHit = (hit: WatchlistHit) => {
    const {
      agency,
      agencyAbbr,
      agencyInformationUrl,
      agencyListUrl,
      entityAliases,
      entityName,
      listCountry,
      listName,
      url,
    } = hit;
    return {
      agency: agency ?? EMPTY_VALUE,
      agencyAbbr: agencyAbbr ?? EMPTY_VALUE,
      agencyInformationUrl: agencyInformationUrl ?? EMPTY_VALUE,
      agencyListUrl: agencyListUrl ?? EMPTY_VALUE,
      entityAliases: entityAliases.filter(alias => Boolean(alias)),
      entityName: entityName ?? EMPTY_VALUE,
      listCountry: listCountry ?? EMPTY_VALUE,
      listName: listName ?? EMPTY_VALUE,
      url: url ?? EMPTY_VALUE,
    };
  };

  const flattedWatchlist = {
    hitCount: watchlist.hitCount,
    watchlist: {},
  } as FormattedWatchlist;
  watchlist.business.forEach(({ screenedEntityName, hits }) => {
    const entityName = screenedEntityName || EMPTY_VALUE;
    flattedWatchlist.watchlist[entityName] = {
      kind: 'business',
      hits: hits.map(hit => formatHit(hit)),
    };
  });
  watchlist.people.forEach(({ screenedEntityName, hits }) => {
    const entityName = screenedEntityName || EMPTY_VALUE;
    flattedWatchlist.watchlist[entityName] = {
      kind: 'person',
      hits: hits.map(hit => formatHit(hit)),
    };
  });
  return flattedWatchlist;
};

export default formatWatchlist;
