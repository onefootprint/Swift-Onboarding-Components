import { RawBusinessDetails } from './business-details';
import { RawBusinessName } from './business-name';

export type BusinessInsights = {
  names: RawBusinessName[];
  details: RawBusinessDetails;
};
