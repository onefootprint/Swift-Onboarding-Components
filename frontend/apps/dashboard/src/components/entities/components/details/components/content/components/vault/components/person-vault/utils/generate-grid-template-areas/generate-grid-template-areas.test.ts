import {
  DataIdentifier,
  DocumentDI,
  Entity,
  EntityKind,
  EntityStatus,
  IdDI,
  InvestorProfileDI,
} from '@onefootprint/types';

import generateGridTemplateAreas from './generate-grid-template-areas';

describe('gridTemplateAreasGenerator', () => {
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

  const removeLeadingSpaces = (text: string) =>
    text
      .split('\n')
      .map(line => line.trim())
      .join('\n');

  it('should generate grid template areas for basic and address', () => {
    const entity = createEntity([IdDI.firstName, IdDI.lastName]);
    const result = removeLeadingSpaces(generateGridTemplateAreas(entity));
    expect(result).toEqual("'basic address'\n'identity address'");
  });

  it('should generate grid template areas with card', () => {
    const entity = createEntity(['card.test.name']);
    const result = removeLeadingSpaces(generateGridTemplateAreas(entity));
    expect(result).toEqual("'basic address'\n'identity payment'");
  });

  it('should generate grid template areas with documents', () => {
    const entity = createEntity([DocumentDI.latestPassport]);
    const result = removeLeadingSpaces(generateGridTemplateAreas(entity));
    expect(result).toEqual(
      "'basic address'\n'identity address'\n'documents documents'",
    );
  });

  it('should generate grid template areas with investor profile', () => {
    const entity = createEntity([InvestorProfileDI.annualIncome]);
    const result = removeLeadingSpaces(generateGridTemplateAreas(entity));
    expect(result).toEqual(
      "'basic address'\n'identity address'\n'investor-profile investor-profile'",
    );
  });

  it('should generate grid template areas with custom data', () => {
    const entity = createEntity(['custom.test']);
    const result = removeLeadingSpaces(generateGridTemplateAreas(entity));
    expect(result).toEqual(
      "'basic address'\n'identity address'\n'custom custom'",
    );
  });
});
