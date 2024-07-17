import { RawBusinessDetails } from './business-details';
import { RawBusinessName } from './business-name';
import { RawBusinessPerson } from './business-person';

export type BusinessInsights = {
  names: RawBusinessName[];
  details: RawBusinessDetails;
  people: RawBusinessPerson[];
};
