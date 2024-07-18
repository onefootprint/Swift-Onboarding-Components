import { useIntl } from '@onefootprint/hooks';
import {
  BusinessDetailPhoneNumber,
  BusinessDetailTin,
  BusinessDetailWebsite,
  BusinessDetails,
  BusinessName,
  BusinessNameKind,
  BusinessPerson,
  FilingStatus,
  GetBusinessInsightsResponse,
  RawBusinessName,
  RawBusinessPerson,
  RawSOSFiling,
  SOSFiling,
} from '@onefootprint/types';
import capitalize from 'lodash/capitalize';
import upperFirst from 'lodash/upperFirst';
import { BusinessDetail } from '../../types';
import formatState from '../../utils/format-state/format-state';

type RawBusinesDetailValue = string | BusinessDetailPhoneNumber[] | BusinessDetailTin | BusinessDetailWebsite | null;

const EMPTY_VALUE = '-';
const LONG_EMPTY_VALUE = '--';

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
    registrations: [
      {
        addresses: ['1 N BROAD ST STE 206, MIDDLETOWN, DE 19709-6402'],
        entityType: 'CORPORATION',
        name: 'Bobby Corp LABS, INC.',
        officers: [],
        registeredAgent: '"LEGALINC CORPORATE SERVICES INC."',
        registrationDate: '2020-09-03',
        source: 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx',
        state: 'DE',
        status: 'unknown',
        subStatus: null,
        jurisdiction: 'domestic',
        fileNumber: '12345',
      },
      {
        addresses: ['test addy'],
        entityType: 'b corp',
        name: 'a random name',
        officers: [],
        registeredAgent: 'a random agent',
        registrationDate: '2001-01-01',
        source: 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx',
        state: 'FL',
        status: 'unknown',
        subStatus: null,
        jurisdiction: 'domestic',
        fileNumber: '12345',
      },
      {
        addresses: ['test addy'],
        entityType: 'b corp',
        name: 'a random name',
        officers: [],
        registeredAgent: 'a random agent',
        registrationDate: '2002-02-02',
        source: 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx',
        state: 'FL',
        status: 'active',
        subStatus: null,
        jurisdiction: 'domestic',
        fileNumber: '12345',
      },
      {
        addresses: ['test addy'],
        entityType: 'b corp',
        name: 'a random name',
        officers: [],
        registeredAgent: 'a random agent',
        registrationDate: '2003-03-03',
        source: 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx',
        state: null,
        status: 'inactive',
        subStatus: null,
        jurisdiction: 'domestic',
        fileNumber: '12345',
      },
    ],
  };
  return mockResponse;
};

const useBusinessInsights = () => {
  const rawData = getBusinessInsights();
  const { formatUtcDate } = useIntl();

  const formatName = (name: RawBusinessName): BusinessName => ({
    kind: name.kind as BusinessNameKind,
    name: name.name || EMPTY_VALUE,
    sources: name.sources,
    subStatus: name.subStatus || EMPTY_VALUE,
    submitted: !!name.submitted,
    verified: !!name.verified,
    notes: name.notes || EMPTY_VALUE,
  });

  const formatDetail = (label: BusinessDetail, value: RawBusinesDetailValue): Exclude<RawBusinesDetailValue, null> => {
    if (!value) return LONG_EMPTY_VALUE;
    if (label === BusinessDetail.formationDate) {
      return formatUtcDate(new Date(value as string));
    }
    if (label === BusinessDetail.formationState) {
      return formatState(value as string, LONG_EMPTY_VALUE);
    }
    if (label === BusinessDetail.tin) {
      const detailValue = value
        ? value
        : {
            tin: LONG_EMPTY_VALUE,
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
        phone: LONG_EMPTY_VALUE,
        submitted: null,
        verified: null,
      } as BusinessDetailPhoneNumber;
      return detailValue.length ? detailValue.map(phoneNumber => phoneNumber || emptyPhoneNumber) : [emptyPhoneNumber];
    }
    if (label === BusinessDetail.website) {
      const detailValue = value
        ? value
        : {
            url: LONG_EMPTY_VALUE,
            verified: null,
          };
      return detailValue as BusinessDetailWebsite;
    }
    return LONG_EMPTY_VALUE;
  };

  const formatPerson = (person: RawBusinessPerson): BusinessPerson => {
    const { name, role, submitted, associationVerified, sources } = person;
    return {
      name: name ? upperFirst(name) : EMPTY_VALUE,
      role: role ? upperFirst(role) : EMPTY_VALUE,
      submitted: !!submitted,
      associationVerified: !!associationVerified,
      sources,
    };
  };

  const formatFiling = (filing: RawSOSFiling): SOSFiling => {
    const {
      state,
      registrationDate,
      registeredAgent,
      officers,
      addresses,
      entityType,
      status,
      subStatus,
      source,
      name,
      jurisdiction,
      fileNumber,
    } = filing;
    return {
      state: state ? formatState(state, EMPTY_VALUE) : EMPTY_VALUE,
      registrationDate: registrationDate ? formatUtcDate(new Date(registrationDate as string)) : LONG_EMPTY_VALUE,
      registeredAgent: registeredAgent || LONG_EMPTY_VALUE,
      officers,
      addresses: addresses && addresses.length ? addresses : [LONG_EMPTY_VALUE],
      entityType: entityType ? capitalize(entityType) : LONG_EMPTY_VALUE,
      status: (status as FilingStatus) ?? status,
      subStatus: subStatus ? capitalize(subStatus) : LONG_EMPTY_VALUE,
      source: source || LONG_EMPTY_VALUE,
      name: name || LONG_EMPTY_VALUE,
      jurisdiction: jurisdiction ? capitalize(jurisdiction) : LONG_EMPTY_VALUE,
      fileNumber: fileNumber || LONG_EMPTY_VALUE,
    };
  };

  const formattedDetails: Partial<Record<BusinessDetail, Exclude<RawBusinesDetailValue, null>>> = {};
  Object.entries(rawData.details).forEach(([label, value]) => {
    formattedDetails[label as BusinessDetail] = formatDetail(label as BusinessDetail, value);
  });
  const data = {
    names: rawData.names.map(name => formatName(name)),
    details: formattedDetails as BusinessDetails,
    people: rawData.people.map(person => formatPerson(person)),
    registrations: rawData.registrations.map(filing => formatFiling(filing)),
  };

  return {
    response: data,
  };
};

export default useBusinessInsights;
