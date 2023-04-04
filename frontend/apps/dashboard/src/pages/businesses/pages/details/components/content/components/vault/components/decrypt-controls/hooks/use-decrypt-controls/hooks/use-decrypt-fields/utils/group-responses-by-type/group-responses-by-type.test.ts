import groupResponsesByType from './group-responses-by-type';

describe('groupResponsesByType', () => {
  it('should group text responses', () => {
    expect(
      groupResponsesByType([
        {
          'business.state': 'CT',
          'business.city': 'West Haven',
          'business.zip': '06516',
          'business.tin': '124412142',
          'business.beneficial_owners':
            '[{"first_name":"Jane","last_name":"Doe","ownership_stake":25}]',
          'business.name': 'Acme Bank',
          'business.address_line1': '14 Linda Street',
          'business.country': 'US',
        },
      ]),
    ).toEqual({
      text: {
        'business.state': 'CT',
        'business.city': 'West Haven',
        'business.zip': '06516',
        'business.tin': '124412142',
        'business.beneficial_owners':
          '[{"first_name":"Jane","last_name":"Doe","ownership_stake":25}]',
        'business.name': 'Acme Bank',
        'business.address_line1': '14 Linda Street',
        'business.country': 'US',
      },
    });

    expect(
      groupResponsesByType([
        {
          'id.phone_number': '+17077190993',
          'id.email': 'jane@acme.com',
          'id.first_name': 'Jane',
          'id.last_name': 'Doe',
        },
      ]),
    ).toEqual({
      text: {
        'id.phone_number': '+17077190993',
        'id.email': 'jane@acme.com',
        'id.first_name': 'Jane',
        'id.last_name': 'Doe',
      },
    });
  });
});
