import { STATES } from '@onefootprint/global-constants';
import { useIntl } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import {
  type BusinessAddress,
  BusinessDetail,
  type BusinessDetailPhoneNumber,
  type BusinessDetailTin,
  type BusinessDetailWebsite,
  type BusinessDetails,
  type BusinessName,
  type BusinessNameKind,
  type BusinessPerson,
  type BusinessWatchlist,
  EntityKind,
  type FilingStatus,
  type GetBusinessInsightsResponse,
  type RawBusinessAddress,
  type RawBusinessName,
  type RawBusinessPerson,
  type RawBusinessWatchlist,
  type RawSOSFiling,
  type SOSFiling,
  type WatchlistHit,
} from '@onefootprint/types';
import type { RawBusinessDetails } from '@onefootprint/types/src/data/business-details';
import { useQuery } from '@tanstack/react-query';
import capitalize from 'lodash/capitalize';
import upperFirst from 'lodash/upperFirst';
import useSession, { type AuthHeaders } from 'src/hooks/use-session';
import formatState from '../components/content/components/business-insights/utils/format-state/format-state';

type RawBusinesDetailValue = string | BusinessDetailPhoneNumber[] | BusinessDetailTin | BusinessDetailWebsite | null;
const EMPTY_VALUE = '-';

const getBusinessInsights = async (authHeaders: AuthHeaders, id: string) => {
  const response = await request<GetBusinessInsightsResponse>({
    method: 'GET',
    url: `/entities/${id}/business_insights`,
    headers: authHeaders,
  });
  return response.data;
};

const useEntityBusinessInsights = (id: string) => {
  const { authHeaders } = useSession();
  const { formatUtcDate } = useIntl();

  return useQuery({
    queryKey: ['entity', id, 'businessInsights', authHeaders],
    queryFn: () => getBusinessInsights(authHeaders, id),
    enabled: !!id,
    select: response => {
      const formatFiling = (filing: RawSOSFiling, id: string): SOSFiling => {
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
          id,
          state: state ? formatState(state, EMPTY_VALUE) : EMPTY_VALUE,
          registrationDate: registrationDate ? formatUtcDate(new Date(registrationDate as string)) : EMPTY_VALUE,
          registeredAgent: registeredAgent ?? EMPTY_VALUE,
          officers,
          addresses: addresses?.length ? addresses : [EMPTY_VALUE],
          entityType: entityType ? capitalize(entityType) : EMPTY_VALUE,
          status: (status as FilingStatus) ?? status,
          subStatus: subStatus ? capitalize(subStatus) : EMPTY_VALUE,
          source: source ?? EMPTY_VALUE,
          name: name ?? EMPTY_VALUE,
          jurisdiction: jurisdiction ? capitalize(jurisdiction) : EMPTY_VALUE,
          fileNumber: fileNumber ?? EMPTY_VALUE,
        };
      };
      const formattedFilings = response.registrations.map((filing, index) => formatFiling(filing, `${index}`));

      const formatName = (name: RawBusinessName): BusinessName => {
        const { kind, name: rawName, sources, subStatus, submitted, verified, notes } = name;

        const getSourceSOSFiling = () => {
          if (!sources) return undefined;
          const filingWithSources = formattedFilings.map(({ id, state }) => {
            const stateAbbrev = STATES.find(({ label }) => label === state)?.value;
            const filingSources = `${stateAbbrev} - SOS`;
            return { id, sources: filingSources };
          });
          return filingWithSources.find(({ sources: filingSources }) => filingSources === sources);
        };
        const sourceSOSFiling = getSourceSOSFiling();

        return {
          kind: kind as BusinessNameKind,
          name: rawName ?? EMPTY_VALUE,
          sources,
          sourceSOSFilingId: sourceSOSFiling?.id,
          subStatus: subStatus ?? EMPTY_VALUE,
          submitted,
          verified,
          notes: notes ?? EMPTY_VALUE,
        };
      };

      const formatDetails = (details: RawBusinessDetails | null): BusinessDetails => {
        const formatDetail = (
          label: BusinessDetail,
          value: RawBusinesDetailValue,
        ): Exclude<RawBusinesDetailValue, null> => {
          const labelsWithValidation = [BusinessDetail.tin, BusinessDetail.phoneNumbers, BusinessDetail.website];
          if (!value && !labelsWithValidation.includes(label)) return EMPTY_VALUE;

          if (label === BusinessDetail.formationDate) {
            const detailValue = value as string;
            return formatUtcDate(new Date(detailValue));
          }
          if (label === BusinessDetail.formationState) {
            const detailValue = value as string;
            return formatState(detailValue, EMPTY_VALUE);
          }
          if (label === BusinessDetail.tin) {
            const detailValue = value ?? {
              tin: EMPTY_VALUE,
              verified: null,
            };
            return detailValue as BusinessDetailTin;
          }
          if (label === BusinessDetail.entityType) {
            const detailValue = value as string;
            return value ? capitalize(detailValue) : EMPTY_VALUE;
          }
          if (label === BusinessDetail.phoneNumbers) {
            const detailValue = value as BusinessDetailPhoneNumber[];
            const emptyPhoneNumber = {
              phone: EMPTY_VALUE,
              submitted: null,
              verified: null,
            } as BusinessDetailPhoneNumber;
            return detailValue.length
              ? detailValue.map(phoneNumber => phoneNumber ?? emptyPhoneNumber)
              : [emptyPhoneNumber];
          }
          if (label === BusinessDetail.website) {
            const detailValue = value ?? {
              url: EMPTY_VALUE,
              verified: null,
            };
            return detailValue as BusinessDetailWebsite;
          }
          return EMPTY_VALUE;
        };

        if (!details) {
          const emptyDetails = {
            [BusinessDetail.entityType]: formatDetail(BusinessDetail.entityType, null),
            [BusinessDetail.formationDate]: formatDetail(BusinessDetail.formationDate, null),
            [BusinessDetail.formationState]: formatDetail(BusinessDetail.formationState, null),
            [BusinessDetail.phoneNumbers]: formatDetail(BusinessDetail.phoneNumbers, []),
            [BusinessDetail.tin]: formatDetail(BusinessDetail.tin, null),
            [BusinessDetail.website]: formatDetail(BusinessDetail.website, null),
          };
          return emptyDetails as BusinessDetails;
        }

        const formattedDetails = {} as BusinessDetails;
        Object.entries(details).forEach(([label, value]) => {
          const detailLabel = label as BusinessDetail;
          // @ts-expect-error
          formattedDetails[detailLabel] = formatDetail(detailLabel, value);
        });
        return formattedDetails;
      };

      const formatPerson = (person: RawBusinessPerson): BusinessPerson => {
        const { name, role, submitted, associationVerified, sources } = person;
        return {
          name: name ? upperFirst(name) : EMPTY_VALUE,
          role: role ? upperFirst(role) : EMPTY_VALUE,
          submitted,
          associationVerified,
          sources,
        };
      };

      const formatWatchlist = (watchlist: RawBusinessWatchlist | null): BusinessWatchlist => {
        if (!watchlist) return { hitCount: 0, watchlist: {} };

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
            entityName: entityName ?? EMPTY_VALUE,
            entityAliases: entityAliases.filter(alias => !!alias),
            agencyListUrl,
            agencyInformationUrl,
            url,
            agency: agency ?? EMPTY_VALUE,
            agencyAbbr,
            listName: listName ?? EMPTY_VALUE,
            listCountry: listCountry ?? EMPTY_VALUE,
          };
        };

        const flattedWatchlist = {
          hitCount: watchlist.hitCount,
          watchlist: {},
        } as BusinessWatchlist;
        watchlist.business.forEach(({ screenedEntityName, hits }) => {
          const entityName = screenedEntityName || EMPTY_VALUE;
          flattedWatchlist.watchlist[entityName] = {
            kind: EntityKind.business,
            hits: hits.map(hit => formatHit(hit)),
          };
        });
        watchlist.people.forEach(({ screenedEntityName, hits }) => {
          const entityName = screenedEntityName || EMPTY_VALUE;
          flattedWatchlist.watchlist[entityName] = {
            kind: EntityKind.person,
            hits: hits.map(hit => formatHit(hit)),
          };
        });
        return flattedWatchlist;
      };

      const formatAddresses = (addresses: RawBusinessAddress[]): BusinessAddress[] => {
        return addresses.map(address => ({
          id: JSON.stringify(address),
          ...address,
        }));
      };

      return {
        names: response.names.map(name => formatName(name)),
        details: formatDetails(response.details),
        people: response.people.map(person => formatPerson(person)),
        registrations: formattedFilings,
        watchlist: formatWatchlist(response.watchlist),
        addresses: formatAddresses(response.addresses),
      };
    },
  });
};

export default useEntityBusinessInsights;
