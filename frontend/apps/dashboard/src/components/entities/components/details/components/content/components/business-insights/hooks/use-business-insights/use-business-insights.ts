import { STATES } from '@onefootprint/global-constants';
import {
  BusinessDetailPhoneNumber,
  BusinessDetailTin,
  BusinessDetailWebsite,
  BusinessDetails,
  BusinessName,
  BusinessNameKind,
  BusinessPerson,
  GetBusinessInsightsResponse,
  RawBusinessName,
  RawBusinessPerson,
} from '@onefootprint/types';
import capitalize from 'lodash/capitalize';
import upperFirst from 'lodash/upperFirst';
import { BusinessDetail } from '../../types';

type RawBusinesDetailValue = string | BusinessDetailPhoneNumber[] | BusinessDetailTin | BusinessDetailWebsite | null;
const EMPTY_VALUE = '-';

const getBusinessInsights = () => {
  const mockResponse: GetBusinessInsightsResponse = {
    names: [
      {
        kind: 'dba' as BusinessNameKind,
        name: 'BobCo',
        sources: 'website',
        subStatus: 'Unverified',
        submitted: true,
        verified: false,
      },
      {
        kind: 'legal' as BusinessNameKind,
        name: 'Bobby Corp Labs, Inc.',
        sources: 'DE - SOS',
        subStatus: 'Verified',
        submitted: true,
        verified: true,
      },
    ],
    details: {
      entityType: 'CORPORATION',
      formationDate: '2020-09-03',
      formationState: 'DE',
      phoneNumbers: [
        {
          phone: '5555550100',
          submitted: null,
          verified: true,
        },
        {
          phone: '1115550100',
          submitted: true,
          verified: false,
        },
      ],
      tin: {
        tin: '85-122345',
        verified: false,
      },
      website: {
        url: 'https://waffleman.com',
        verified: true,
      },
    },
    people: [
      {
        associationVerified: false,
        name: 'Bobby Bobierto',
        role: 'Chief executive officer',
        sources: '',
        submitted: true,
      },
      {
        associationVerified: false,
        name: 'Bingo Maman',
        role: 'secretary',
        sources: '',
        submitted: true,
      },
      {
        associationVerified: null,
        name: 'LEGALINC CORPORATE SERVICES INC.',
        role: 'REGISTERED AGENT',
        sources: 'DE - SOS',
        submitted: false,
      },
      {
        associationVerified: null,
        name: 'Test null person',
        role: null,
        sources: null,
        submitted: null,
      },
    ],
  };
  return mockResponse;
};

const useBusinessInsights = () => {
  const rawData = getBusinessInsights();

  const formatName = (name: RawBusinessName): BusinessName => ({
    kind: name.kind,
    name: name.name || EMPTY_VALUE,
    sources: name.sources,
    subStatus: name.subStatus || EMPTY_VALUE,
    submitted: !!name.submitted,
    verified: !!name.verified,
    notes: name.notes || EMPTY_VALUE,
  });

  const formatDetail = (label: BusinessDetail, value: RawBusinesDetailValue): Exclude<RawBusinesDetailValue, null> => {
    if (!value) return EMPTY_VALUE;
    if (label === BusinessDetail.formationDate) {
      const detailValue = value as string;
      const [year, month, day] = detailValue.split('-');
      return `${month}/${day}/${year}`;
    }
    if (label === BusinessDetail.formationState) {
      const detailValue = value as string;
      const possibleState = STATES.find(s => s.value === detailValue);
      return possibleState?.label || detailValue;
    }
    if (label === BusinessDetail.tin) {
      const detailValue = value
        ? value
        : {
            tin: EMPTY_VALUE,
            verified: null,
          };
      return detailValue as BusinessDetailTin;
    }
    if (label === BusinessDetail.entityType) {
      const detailValue = value as string;
      return capitalize(detailValue);
    }
    if (label === BusinessDetail.phoneNumbers) {
      const detailValue = value as BusinessDetailPhoneNumber[];
      const emptyPhoneNumber = {
        phone: EMPTY_VALUE,
        submitted: null,
        verified: null,
      } as BusinessDetailPhoneNumber;
      return detailValue.length ? detailValue.map(phoneNumber => phoneNumber || emptyPhoneNumber) : [emptyPhoneNumber];
    }
    if (label === BusinessDetail.website) {
      const detailValue = value
        ? value
        : {
            url: EMPTY_VALUE,
            verified: null,
          };
      return detailValue as BusinessDetailWebsite;
    }
    return EMPTY_VALUE;
  };

  const formatPerson = (person: RawBusinessPerson): BusinessPerson => ({
    name: person.name ? upperFirst(person.name) : EMPTY_VALUE,
    role: person.role ? upperFirst(person.role) : EMPTY_VALUE,
    submitted: !!person.submitted,
    associationVerified: !!person.associationVerified,
    sources: person.sources,
  });

  const formattedDetails: Partial<Record<BusinessDetail, Exclude<RawBusinesDetailValue, null>>> = {};
  Object.entries(rawData.details).forEach(([label, value]) => {
    formattedDetails[label as BusinessDetail] = formatDetail(label as BusinessDetail, value);
  });
  const data = {
    names: rawData.names.map(name => formatName(name)),
    details: formattedDetails as BusinessDetails,
    people: rawData.people.map(person => formatPerson(person)),
  };

  return {
    response: data,
  };
};

export default useBusinessInsights;
