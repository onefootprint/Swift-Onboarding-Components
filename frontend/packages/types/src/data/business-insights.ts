import type { BusinessAddress } from './business-address';
import type { BusinessDetails } from './business-details';
import type { BusinessName } from './business-name';
import type { BusinessPerson } from './business-person';
import type { BusinessWatchlist } from './business-watchlist';
import type { SOSFiling } from './sos-filing';

export type BusinessInsights = {
  names: BusinessName[];
  details: BusinessDetails;
  people: BusinessPerson[];
  registrations: SOSFiling[];
  watchlist: BusinessWatchlist;
  addresses: BusinessAddress[];
};
