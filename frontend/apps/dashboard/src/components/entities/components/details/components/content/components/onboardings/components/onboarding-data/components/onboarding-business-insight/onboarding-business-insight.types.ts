import type {
  InsightAddress,
  InsightPhone,
  InsightTin,
  InsightWebsite,
  Officer,
} from '@onefootprint/request-types/dashboard';

export type FormattedAddress = InsightAddress & { id: string };

export type FormattedDetails = {
  entityType: string;
  formationDate: string;
  formationState: string;
  phoneNumbers: InsightPhone[];
  tin: InsightTin;
  website: InsightWebsite;
};
export type DetailValue = string | InsightPhone[] | InsightTin | InsightWebsite;

export type FormattedName = {
  sourceSOSFilingId: string | undefined;
  kind: string;
  name: string;
  sources: string;
  submitted: boolean;
  subStatus: string;
  verified: boolean;
};

export type FormattedRegistration = {
  id: string;
  addresses: string[];
  entityType: string;
  fileNumber: string;
  jurisdiction: string;
  name: string;
  officers: Officer[];
  registeredAgent: string;
  registrationDate: string;
  source: string;
  state: string;
  status: string;
  subStatus: string;
};

export type FormattedPerson = {
  associationVerified: boolean;
  name: string;
  role: string;
  sources: string;
  submitted: boolean;
};

export type FormattedWatchlist = {
  watchlist: {
    [screenedEntityName: string]: {
      kind: 'business' | 'person';
      hits: FormattedWatchlistHit[];
    };
  };
  hitCount: number;
};

export type FormattedWatchlistHit = {
  agency: string;
  agencyAbbr: string;
  agencyInformationUrl: string;
  agencyListUrl: string;
  entityAliases: Array<string>;
  entityName: string;
  listCountry: string;
  listName: string;
  url: string;
};
