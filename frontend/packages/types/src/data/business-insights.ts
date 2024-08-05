import { BusinessAddress } from './business-address';
import { BusinessDetails } from './business-details';
import { BusinessName } from './business-name';
import { BusinessPerson } from './business-person';
import { BusinessWatchlist } from './business-watchlist';
import { SOSFiling } from './sos-filing';

export type BusinessInsights = {
  names: BusinessName[];
  details: BusinessDetails;
  people: BusinessPerson[];
  registrations: SOSFiling[];
  watchlist: BusinessWatchlist;
  addresses: BusinessAddress[];
};
