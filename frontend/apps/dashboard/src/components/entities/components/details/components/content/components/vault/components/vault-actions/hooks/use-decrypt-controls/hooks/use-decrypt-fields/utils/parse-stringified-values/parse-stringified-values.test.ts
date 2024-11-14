import parseStringifiedValues from './parse-stringified-values';

describe('parseStringifiedValues', () => {
  it('should parse stringified values', () => {
    expect(
      parseStringifiedValues({
        'id.citizenships': '["US", "NO"]',
        'business.tin': '124412142',
        'business.name': 'Acme Bank',
      }),
    ).toEqual({
      'id.citizenships': ['US', 'NO'],
      'business.tin': '124412142',
      'business.name': 'Acme Bank',
    });

    expect(
      parseStringifiedValues({
        'id.first_name': 'Jane',
      }),
    ).toEqual({
      'id.first_name': 'Jane',
    });
  });
});
