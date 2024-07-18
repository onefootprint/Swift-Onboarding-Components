import { RawBusinessDetails } from './business-details';
import { RawBusinessName } from './business-name';
import { RawBusinessPerson } from './business-person';
import { RawBusinessWatchlist } from './business-watchlist';
import { RawSOSFiling } from './sos-filing';

export type BusinessInsights = {
  names: RawBusinessName[];
  details: RawBusinessDetails;
  people: RawBusinessPerson[];
  registrations: RawSOSFiling[];
  watchlist: RawBusinessWatchlist;
};
