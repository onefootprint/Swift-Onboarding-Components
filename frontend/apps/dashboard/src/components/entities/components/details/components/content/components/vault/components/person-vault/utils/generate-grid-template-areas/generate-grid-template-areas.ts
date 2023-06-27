import {
  Entity,
  hasEntityCards,
  hasEntityCustomData,
  hasEntityDocuments,
  hasEntityInvestorProfile,
} from '@onefootprint/types';

const generateGridTemplateAreas = (entity: Entity): string => {
  let gridTemplateAreas = `
    'basic address'
    'identity ${hasEntityCards(entity) ? 'payment' : 'address'}'
  `;
  if (hasEntityDocuments(entity)) {
    gridTemplateAreas += " 'documents documents'";
  }
  if (hasEntityInvestorProfile(entity)) {
    gridTemplateAreas += " 'investor-profile investor-profile'";
  }
  if (hasEntityCustomData(entity)) {
    gridTemplateAreas += " 'custom custom'";
  }
  return gridTemplateAreas.trim();
};

export default generateGridTemplateAreas;
