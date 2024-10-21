import type { DataIdentifier, Entity } from '@onefootprint/types';
import { DataKind, DocumentDI, EntityKind, EntityStatus, IdDI, InvestorProfileDI } from '@onefootprint/types';

import getGridTemplateAreas from './get-grid-template-areas';

describe('getGridTemplateAreas', () => {
  const defaultAttribute = {
    identifier: 'card.primary.name' as DataIdentifier,
    source: 'source',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: 'value',
    transforms: {},
  };

  const createEntity = (attributes: DataIdentifier[]): Entity => ({
    attributes: [],
    data: attributes.map(attribute => ({
      ...defaultAttribute,
      identifier: attribute,
    })),
    id: '123',
    isIdentifiable: true,
    kind: EntityKind.person,
    requiresManualReview: false,
    startTimestamp: '2023-06-27',
    lastActivityAt: '2023-03-27T14:43:47.444716Z',
    status: EntityStatus.pass,
    watchlistCheck: null,
    hasOutstandingWorkflowRequest: false,
    label: null,
    workflows: [],
  });

  it('should generate grid template areas for basic, address and identity', () => {
    const entity = createEntity([IdDI.firstName, IdDI.middleName, IdDI.lastName]);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(3);
  });

  it('should generate grid template areas with US legal status', () => {
    const entity = createEntity([IdDI.usLegalStatus]);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(4);
  });

  it('should generate grid template areas with card', () => {
    const entity = createEntity(['card.test.name']);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(4);
  });

  it('should generate grid template areas with documents', () => {
    const entity = createEntity([DocumentDI.latestPassport]);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(4);
  });

  it('should generate grid template areas with investor profile', () => {
    const entity = createEntity([InvestorProfileDI.annualIncome]);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(4);
  });

  it('should generate grid template areas with custom data', () => {
    const entity = createEntity(['custom.test']);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(4);
  });

  it('should generate grid template areas with US legal status data and card-data', () => {
    const entity = createEntity([IdDI.usLegalStatus, 'card.flerp.name']);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(5);
  });

  it('should generate grid template areas with US legal status data, card-data, and custom data', () => {
    const entity = createEntity([IdDI.usLegalStatus, 'custom.test', 'card.flerp.name']);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(6);
  });

  it('should generate grid template areas with US legal status data, custom data, card-data, and investor profile', () => {
    const entity = createEntity([IdDI.usLegalStatus, 'custom.test', 'card.flerp.name', InvestorProfileDI.annualIncome]);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(7);
  });

  it('should generate grid template areas with US legal status data, custom data, card-data, investor profile, and ID documents', () => {
    const entity = createEntity([
      IdDI.usLegalStatus,
      'custom.test',
      'card.flerp.name',
      InvestorProfileDI.annualIncome,
      DocumentDI.latestPassport,
    ]);
    const result = getGridTemplateAreas({ entity });
    expect(result).toEqual(8);
  });
});
