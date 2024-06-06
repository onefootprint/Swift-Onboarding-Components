import type { Entity } from '@onefootprint/types';
import {
  hasEntityCards,
  hasEntityCustomData,
  hasEntityDocuments,
  hasEntityInvestorProfile,
  hasEntityUsLegalStatus,
} from '@onefootprint/types';

const getGridTemplateAreas = ({
  entity,
  hasBusinesses,
}: {
  entity: Entity;
  hasBusinesses?: boolean;
}): number => {
  // basic, address, and identity always exist
  let gridTemplateAreas = 3;
  if (hasEntityUsLegalStatus(entity)) {
    gridTemplateAreas += 1;
  }
  if (hasEntityCards(entity)) {
    gridTemplateAreas += 1;
  }
  if (hasEntityDocuments(entity)) {
    gridTemplateAreas += 1;
  }
  if (hasEntityInvestorProfile(entity)) {
    gridTemplateAreas += 1;
  }
  if (hasEntityCustomData(entity)) {
    gridTemplateAreas += 1;
  }
  if (hasBusinesses) {
    gridTemplateAreas += 1;
  }
  return gridTemplateAreas;
};

export default getGridTemplateAreas;
