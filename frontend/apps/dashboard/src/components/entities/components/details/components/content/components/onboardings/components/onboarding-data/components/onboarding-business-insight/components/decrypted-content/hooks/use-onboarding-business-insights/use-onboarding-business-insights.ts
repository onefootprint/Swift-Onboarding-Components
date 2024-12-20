import { getEntitiesByFpBidOnboardingsByOnboardingIdBusinessInsightsOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import {
  formatAddress,
  formatDetails,
  formatName,
  formatPerson,
  formatRegistration,
  formatWatchlist,
} from '../../utils';

const useOnboardingBusinessInsights = (fpBid: string, onboardingId: string) => {
  return useQuery({
    ...getEntitiesByFpBidOnboardingsByOnboardingIdBusinessInsightsOptions({
      path: { fpBid, onboardingId },
    }),
    enabled: Boolean(fpBid) && Boolean(onboardingId),
    select: response => {
      const formattedRegistrations = response.registrations.map((filing, index) =>
        formatRegistration(filing, index.toString()),
      );

      return {
        addresses: response.addresses.map((address, index) => formatAddress(address, index.toString())),
        details: formatDetails(response.details),
        names: response.names.map(name => formatName(name, formattedRegistrations)),
        people: response.people.map(person => formatPerson(person)),
        registrations: formattedRegistrations,
        watchlist: formatWatchlist(response.watchlist),
      };
    },
  });
};

export default useOnboardingBusinessInsights;
