import {
  Entity,
  hasEntityCards,
  hasEntityCustomData,
  hasEntityDocuments,
  hasEntityInvestorProfile,
} from '@onefootprint/types';

const getGridTemplateAreas = (entity: Entity): number => {
  // basic, address, and identity always exist
  let gridTemplateAreas = 3;
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
  return gridTemplateAreas;
};

export default getGridTemplateAreas;
