import type { InsightRegistration } from '@onefootprint/request-types/dashboard';
import { format } from 'date-fns';
import capitalize from 'lodash/capitalize';
import { EMPTY_VALUE } from '../../../../constants';
import type { FormattedRegistration } from '../../../../onboarding-business-insight.types';
import { formatState } from '../format-state';

const formatRegistration = (filing: InsightRegistration, id: string): FormattedRegistration => {
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
    state: formatState(state, EMPTY_VALUE),
    registrationDate: registrationDate ? format(new Date(registrationDate as string), 'MM/dd/yyyy') : EMPTY_VALUE,
    registeredAgent: registeredAgent ?? EMPTY_VALUE,
    officers,
    addresses: addresses.length ? addresses : [EMPTY_VALUE],
    entityType: entityType ? capitalize(entityType) : EMPTY_VALUE,
    status: status ?? EMPTY_VALUE,
    subStatus: subStatus ? capitalize(subStatus) : EMPTY_VALUE,
    source: source ?? EMPTY_VALUE,
    name: name ?? EMPTY_VALUE,
    jurisdiction: jurisdiction ? capitalize(jurisdiction) : EMPTY_VALUE,
    fileNumber: fileNumber ?? EMPTY_VALUE,
  };
};

export default formatRegistration;
