import { useIntl } from '@onefootprint/hooks';
import {
  BusinessDetailPhoneNumber,
  BusinessDetailTin,
  BusinessDetailWebsite,
  BusinessDetails,
  BusinessName,
  BusinessNameKind,
  BusinessPerson,
  BusinessWatchlist,
  EntityKind,
  FilingStatus,
  GetBusinessInsightsResponse,
  RawBusinessName,
  RawBusinessPerson,
  RawBusinessWatchlist,
  RawSOSFiling,
  SOSFiling,
  WatchlistHit,
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
    watchlist: {
      hitCount: 2,
      business: [
        {
          hits: [
            {
              agency: 'Office of Foreign Assets Control',
              agencyAbbr: 'OFAC',
              agencyInformationUrl:
                'https://home.treasury.gov/policy-issues/financial-sanctions/specially-designated-nationals-and-blocked-persons-list-sdn-human-readable-lists',
              agencyListUrl: 'https://www.treasury.gov/resource-center/sanctions/SDN-List/Pages/default.aspx',
              entityAliases: [
                'AL-MULATHAMUN BRIGADE',
                "AL-MUWAQQI'UN BIL-DIMA",
                'THOSE SIGNED IN BLOOD BATTALION',
                'SIGNATORIES IN BLOOD',
                'THOSE WHO SIGN IN BLOOD',
                'WITNESSES IN BLOOD',
                'SIGNED-IN-BLOOD BATTALION',
                'MASKED MEN BRIGADE',
                'KHALED ABU AL-ABBAS BRIGADE',
                'AL-MULATHAMUN MASKED ONES BRIGADE',
                'AL-MURABITOUN',
                'THE SENTINELS',
              ],
              entityName: 'AL-MULATHAMUN BATTALION',
              listName: 'Specially Designated Nationals',
              url: 'https://sanctionssearch.ofac.treas.gov/Details.aspx?id=16446',
              listCountry: 'United States',
            },
            {
              agency: 'Bureau of Industry and Security',
              agencyAbbr: 'BIS',
              agencyInformationUrl:
                'https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list',
              agencyListUrl:
                'https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list',
              entityAliases: [],
              entityName: 'Academy of Military Medical Sciences, Field Blood Transfusion Institution',
              listName: 'Entity List',
              url: null,
              listCountry: 'United States',
            },
          ],
          screenedEntityName: 'BobCo',
        },
        {
          hits: [],
          screenedEntityName: 'BobCo Labs, Inc.',
        },
      ],
      people: [
        {
          hits: [],
          screenedEntityName: 'Bobby Bobierto',
        },
        {
          hits: [],
          screenedEntityName: 'Bingo Maman',
        },
        {
          hits: [],
          screenedEntityName: 'LEGALINC CORPORATE SERVICES INC.',
        },
      ],
    },
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

  const formatDetail = (label: string, value: RawBusinesDetailValue): Exclude<RawBusinesDetailValue, null> => {
    if (!value) return EMPTY_VALUE;
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

  const formatWatchlist = (watchlist: RawBusinessWatchlist): BusinessWatchlist => {
    const formatHit = (hit: WatchlistHit) => {
      const {
        entityName,
        entityAliases,
        agencyListUrl,
        agencyInformationUrl,
        url,
        agency,
        agencyAbbr,
        listName,
        listCountry,
      } = hit;
      return {
        entityName: entityName || EMPTY_VALUE,
        entityAliases: entityAliases.filter(alias => !!alias),
        agencyListUrl,
        agencyInformationUrl,
        url,
        agency: agency || EMPTY_VALUE,
        agencyAbbr,
        listName: listName || EMPTY_VALUE,
        listCountry: listCountry || EMPTY_VALUE,
      };
    };

    const flattedWatchlist = {} as BusinessWatchlist;
    watchlist.business.forEach(({ screenedEntityName, hits }) => {
      const entityName = screenedEntityName || EMPTY_VALUE;
      flattedWatchlist[entityName] = {
        kind: EntityKind.business,
        hits: hits.map(hit => formatHit(hit)),
      };
    });
    watchlist.people.forEach(({ screenedEntityName, hits }) => {
      const entityName = screenedEntityName || EMPTY_VALUE;
      flattedWatchlist[entityName] = {
        kind: EntityKind.person,
        hits: hits.map(hit => formatHit(hit)),
      };
    });
    return flattedWatchlist;
  };

  const formattedDetails: Partial<Record<BusinessDetail, Exclude<RawBusinesDetailValue, null>>> = {};
  Object.entries(rawData.details).forEach(([label, value]) => {
    formattedDetails[label as BusinessDetail] = formatDetail(label, value);
  });
  const data = {
    names: rawData.names.map(name => formatName(name)),
    details: formattedDetails as BusinessDetails,
    people: rawData.people.map(person => formatPerson(person)),
    registrations: rawData.registrations.map(filing => formatFiling(filing)),
    watchlist: formatWatchlist(rawData.watchlist),
  };

  return {
    response: data,
  };
};

export default useBusinessInsights;
