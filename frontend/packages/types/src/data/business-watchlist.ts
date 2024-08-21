import type { EntityKind } from './entity';

export type RawBusinessWatchlist = {
  hitCount: number;
  people: EntityWatchlist[];
  business: EntityWatchlist[];
};

export type EntityWatchlist = {
  screenedEntityName: string | null;
  hits: WatchlistHit[];
};

export type WatchlistHit = {
  entityName: string | null;
  entityAliases: (string | null)[];
  agencyListUrl: string | null;
  agencyInformationUrl: string | null;
  url: string | null;
  agency: string | null;
  agencyAbbr: string | null;
  listName: string | null;
  listCountry: string | null;
};

export type BusinessWatchlist = {
  watchlist: {
    [screenedEntityName: string]: {
      kind: EntityKind;
      hits: WatchlistHit[];
    };
  };
  hitCount: number;
};
