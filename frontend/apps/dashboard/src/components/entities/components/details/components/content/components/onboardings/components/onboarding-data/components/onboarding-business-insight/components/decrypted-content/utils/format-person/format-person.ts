import type { InsightPerson } from '@onefootprint/request-types/dashboard';
import upperFirst from 'lodash/upperFirst';
import { EMPTY_VALUE, type FormattedPerson } from '../../../../onboarding-business-insight.types';

const formatPerson = (person: InsightPerson): FormattedPerson => {
  const { name, role, submitted, associationVerified, sources } = person;
  return {
    name: name ? upperFirst(name) : EMPTY_VALUE,
    role: role ? upperFirst(role) : EMPTY_VALUE,
    submitted,
    associationVerified: Boolean(associationVerified),
    sources: sources ?? EMPTY_VALUE,
  };
};

export default formatPerson;
