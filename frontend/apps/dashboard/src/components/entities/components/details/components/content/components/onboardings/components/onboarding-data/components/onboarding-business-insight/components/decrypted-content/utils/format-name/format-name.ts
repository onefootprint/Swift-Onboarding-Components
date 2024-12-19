import { STATES } from '@onefootprint/global-constants';
import type { InsightBusinessName } from '@onefootprint/request-types/dashboard';
import { EMPTY_VALUE } from '../../../../constants';
import type { FormattedName, FormattedRegistration } from '../../../../onboarding-business-insight.types';

const formatName = (name: InsightBusinessName, registrations: FormattedRegistration[]): FormattedName => {
  const { kind, name: rawName, sources, subStatus, submitted, verified } = name;

  const getSOSFilingFromSources = () => {
    if (!sources) return undefined;

    const filingWithSources = registrations.map(({ id, state }) => {
      const stateAbbrev = STATES.find(({ label }) => label === state)?.value;
      const filingSources = `${stateAbbrev} - SOS`;
      return { id, sources: filingSources };
    });
    return filingWithSources.find(({ sources: filingSources }) => filingSources === sources);
  };
  const sourceSOSFiling = getSOSFilingFromSources();

  return {
    kind: kind ?? EMPTY_VALUE,
    name: rawName ?? EMPTY_VALUE,
    sources: sources ?? EMPTY_VALUE,
    sourceSOSFilingId: sourceSOSFiling?.id,
    subStatus: subStatus ?? EMPTY_VALUE,
    submitted,
    verified: Boolean(verified),
  };
};

export default formatName;
