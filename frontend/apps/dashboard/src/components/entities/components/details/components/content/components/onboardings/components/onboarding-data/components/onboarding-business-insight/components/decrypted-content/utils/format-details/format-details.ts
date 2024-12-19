import type { BusinessDetail, InsightPhone, InsightTin, InsightWebsite } from '@onefootprint/request-types/dashboard';
import { format } from 'date-fns';
import capitalize from 'lodash/capitalize';
import { EMPTY_VALUE } from '../../../../constants';
import type { FormattedDetails } from '../../../../onboarding-business-insight.types';
import { formatState } from '../format-state';

const formatDetails = (details: BusinessDetail | undefined): FormattedDetails => {
  const emptyPhoneNumber = { phone: EMPTY_VALUE, submitted: undefined, verified: undefined } as InsightPhone;
  const emptyTin = { tin: EMPTY_VALUE, verified: false } as InsightTin;
  const emptyWebsite = { url: EMPTY_VALUE, verified: undefined } as InsightWebsite;

  if (!details) {
    const emptyDetails = {
      entityType: EMPTY_VALUE,
      formationDate: EMPTY_VALUE,
      formationState: EMPTY_VALUE,
      phoneNumbers: [emptyPhoneNumber],
      tin: emptyTin,
      website: emptyWebsite,
    };
    return emptyDetails;
  }

  const { entityType, formationDate, formationState, phoneNumbers, tin, website } = details;

  const formattedDetails = {
    entityType: entityType ? capitalize(entityType) : EMPTY_VALUE,
    formationDate: formationDate ? format(new Date(formationDate), 'MM/dd/yyyy') : EMPTY_VALUE,
    formationState: formatState(formationState, EMPTY_VALUE),
    phoneNumbers: phoneNumbers.length
      ? phoneNumbers.map(phoneNumber => phoneNumber ?? emptyPhoneNumber)
      : [emptyPhoneNumber],
    tin: tin ?? emptyTin,
    website: website ?? emptyWebsite,
  };
  return formattedDetails;
};

export default formatDetails;
