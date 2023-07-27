import {
  DataIdentifier,
  DocumentDI,
  Entity,
  EntityKind,
  EntityStatus,
  IdDI,
  InvestorProfileDI,
} from '@onefootprint/types';

import getGridTemplateAreas from './get-grid-template-areas';

describe('getGridTemplateAreas', () => {
  const createEntity = (attributes: DataIdentifier[]): Entity => ({
    attributes,
    decryptableAttributes: [],
    id: '123',
    isPortable: true,
    kind: EntityKind.person,
    requiresManualReview: false,
    startTimestamp: '2023-06-27',
    status: EntityStatus.pass,
    decryptedAttributes: {},
    watchlistCheck: null,
  });

  it('should generate grid template areas for basic, address and identity', () => {
    const entity = createEntity([IdDI.firstName, IdDI.lastName]);
    const result = getGridTemplateAreas(entity);
    expect(result).toEqual(3);
  });

  it('should generate grid template areas with card', () => {
    const entity = createEntity(['card.test.name']);
    const result = getGridTemplateAreas(entity);
    expect(result).toEqual(4);
  });

  it('should generate grid template areas with documents', () => {
    const entity = createEntity([DocumentDI.latestPassport]);
    const result = getGridTemplateAreas(entity);
    expect(result).toEqual(4);
  });

  it('should generate grid template areas with investor profile', () => {
    const entity = createEntity([InvestorProfileDI.annualIncome]);
    const result = getGridTemplateAreas(entity);
    expect(result).toEqual(4);
  });

  it('should generate grid template areas with custom data', () => {
    const entity = createEntity(['custom.test']);
    const result = getGridTemplateAreas(entity);
    expect(result).toEqual(4);
  });

  it('should generate grid template areas with custom data and card-data', () => {
    const entity = createEntity(['custom.test', 'card.flerp.name']);
    const result = getGridTemplateAreas(entity);
    expect(result).toEqual(5);
  });

  it('should generate grid template areas with custom data, card-data, and investor profile', () => {
    const entity = createEntity([
      'custom.test',
      'card.flerp.name',
      InvestorProfileDI.annualIncome,
    ]);
    const result = getGridTemplateAreas(entity);
    expect(result).toEqual(6);
  });

  it('should generate grid template areas with custom data, card-data, investor profile, and ID documents', () => {
    const entity = createEntity([
      'custom.test',
      'card.flerp.name',
      InvestorProfileDI.annualIncome,
      DocumentDI.latestPassport,
    ]);
    const result = getGridTemplateAreas(entity);
    expect(result).toEqual(7);
  });
});
