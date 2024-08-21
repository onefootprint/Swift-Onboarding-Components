import type {
  RawBusinessAddress,
  RawBusinessName,
  RawBusinessPerson,
  RawBusinessWatchlist,
  RawSOSFiling,
} from '../data';
import type { RawBusinessDetails } from '../data/business-details';

export type GetBusinessInsightsResponse = {
  names: RawBusinessName[];
  details: RawBusinessDetails | null;
  people: RawBusinessPerson[];
  registrations: RawSOSFiling[];
  watchlist: RawBusinessWatchlist | null;
  addresses: RawBusinessAddress[];
};
