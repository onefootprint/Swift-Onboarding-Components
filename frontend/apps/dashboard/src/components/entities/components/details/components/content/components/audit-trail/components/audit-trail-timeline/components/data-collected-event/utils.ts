import type { CollectedDataOption, DataIdentifier } from '@onefootprint/request-types/dashboard';
import { CdoToAllDisMap, type DataIdentifier as TDataIdentifier } from '@onefootprint/types';

const getVisibleDis = (targets: DataIdentifier[], attributes: CollectedDataOption[]) => {
  let visibleAttributes: CollectedDataOption[] = attributes;

  // The targets returned by the backend may be duplicative of what's represented in the attributes. So,
  // filter out all DI targets that are already represented by a CDO attribute.
  let visibleDis = targets.filter(di => !attributes.some(attr => CdoToAllDisMap[attr].includes(di as TDataIdentifier)));

  // Remove document DIs, like OCR DIs and images
  visibleDis = visibleDis.filter(di => !di.startsWith('document.'));

  // @ts-expect-error - Remove the undocumented verified contact info DIs
  visibleDis = visibleDis.filter(di => di !== 'id.verified_phone_number' && di !== 'id.verified_email');

  // Filter out beneficial owner fields - the backend will represent these as a CDO
  // @ts-expect-error
  visibleDis = visibleDis.filter(di => di !== 'business.beneficial_owner_explanation_message');
  visibleDis = visibleDis.filter(di => !di.startsWith('business.beneficial_owners.'));

  if (visibleAttributes.some(cdo => cdo === 'ssn9')) {
    // Some custom logic to omit showing ssn4 when we are displaying ssn9.
    // We need this because CdoToAllDisMap is incorrect
    visibleDis = visibleDis.filter(di => di !== 'id.ssn4');
  }

  if (visibleAttributes.length === 1 && visibleAttributes[0] === 'investor_profile') {
    // Special case to just display individual investor profile DIs if the only CDO updated is investor profile
    visibleDis = targets || [];
    visibleAttributes = [];
  }

  return { visibleDis, visibleAttributes };
};

export default getVisibleDis;
