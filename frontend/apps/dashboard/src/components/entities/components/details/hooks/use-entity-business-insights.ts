import { useIntl } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import {
  BusinessDetail,
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
import { useQuery } from '@tanstack/react-query';
import capitalize from 'lodash/capitalize';
import upperFirst from 'lodash/upperFirst';
import useSession, { AuthHeaders } from 'src/hooks/use-session';
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

  const insightsQuery = useQuery(
    ['entity', id, 'businessInsights', authHeaders],
    () => getBusinessInsights(authHeaders, id),
    {
      enabled: !!id,
      select: response => {
        const { formatUtcDate } = useIntl();

        const formatName = (name: RawBusinessName): BusinessName => {
          const { kind, name: rawName, sources, subStatus, submitted, verified, notes } = name;
          return {
            kind: kind as BusinessNameKind,
            name: rawName ?? EMPTY_VALUE,
            sources,
            subStatus: subStatus ?? EMPTY_VALUE,
            submitted,
            verified,
            notes: notes ?? EMPTY_VALUE,
          };
        };

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
            return capitalize(detailValue);
          }
          if (label === BusinessDetail.phoneNumbers) {
            const detailValue = value as BusinessDetailPhoneNumber[];
            const emptyPhoneNumber = {
              phone: EMPTY_VALUE,
              submitted: null,
              verified: null,
            } as BusinessDetailPhoneNumber;
            return detailValue.length
              ? detailValue.map(phoneNumber => phoneNumber || emptyPhoneNumber)
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
        const formattedDetails: Partial<Record<BusinessDetail, Exclude<RawBusinesDetailValue, null>>> = {};
        Object.entries(response.details).forEach(([label, value]) => {
          formattedDetails[label as BusinessDetail] = formatDetail(label as BusinessDetail, value);
        });

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
            addresses: addresses && addresses.length ? addresses : [EMPTY_VALUE],
            entityType: entityType ? capitalize(entityType) : EMPTY_VALUE,
            status: (status as FilingStatus) ?? status,
            subStatus: subStatus ? capitalize(subStatus) : EMPTY_VALUE,
            source: source ?? EMPTY_VALUE,
            name: name ?? EMPTY_VALUE,
            jurisdiction: jurisdiction ? capitalize(jurisdiction) : EMPTY_VALUE,
            fileNumber: fileNumber ?? EMPTY_VALUE,
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

        return {
          names: response.names.map(name => formatName(name)),
          details: formattedDetails as BusinessDetails,
          people: response.people.map(person => formatPerson(person)),
          registrations: response.registrations.map((filing, index) => formatFiling(filing, `${index}`)),
          watchlist: formatWatchlist(response.watchlist),
        };
      },
    },
  );

  return {
    ...insightsQuery,
    error: insightsQuery.error ?? undefined,
  };
};

export default useEntityBusinessInsights;
