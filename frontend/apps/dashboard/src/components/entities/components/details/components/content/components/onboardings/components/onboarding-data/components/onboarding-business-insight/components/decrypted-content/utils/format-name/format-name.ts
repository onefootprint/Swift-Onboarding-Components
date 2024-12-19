import { STATES } from '@onefootprint/global-constants';
import type { InsightBusinessName } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import { EMPTY_VALUE } from '../../../../constants';
import type { FormattedName, FormattedRegistration } from '../../../../onboarding-business-insight.types';

const formatName = (name: InsightBusinessName, registrations: FormattedRegistration[]): FormattedName => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.business-details.name' });
  const { kind, name: rawName, sources, subStatus, submitted, verified } = name;

  const getSOSFilingFromSources = () => {
    if (!sources) return undefined;

    const filingWithSources = registrations.map(({ id, state }) => {
      const stateAbbrev = STATES.find(({ label }) => label === state)?.value;
      const filingSources = t('filing-sources', { stateAbbrev });
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
