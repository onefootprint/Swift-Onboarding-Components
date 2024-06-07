import parseStringifiedValues from './parse-stringified-values';

describe('parseStringifiedValues', () => {
  it('should parse stringified values', () => {
    expect(
      parseStringifiedValues({
        'business.beneficial_owners': '[{"first_name":"Jane","last_name":"Doe","ownership_stake":25}]',
        'business.tin': '124412142',
        'business.name': 'Acme Bank',
      }),
    ).toEqual({
      'business.beneficial_owners': [{ first_name: 'Jane', last_name: 'Doe', ownership_stake: 25 }],
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
