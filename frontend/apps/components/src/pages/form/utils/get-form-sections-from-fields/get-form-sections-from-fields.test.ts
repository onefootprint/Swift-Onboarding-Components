import getFormSectionsFromFields from './get-form-sections-from-fields';

describe('getFormSectionsFromFields', () => {
  it('extracts field names correctly', () => {
    expect(getFormSectionsFromFields(['card.primary.number', 'card.primary.cvc', 'card.primary.expiration'])).toEqual([
      'card',
    ]);

    expect(
      getFormSectionsFromFields([
        'card.345t43543.number',
        'card.345t43543.cvc',
        'card.345t43543.name',
        'card.345t43543.expiration',
        'card.345t43543.billing_address.country',
      ]),
    ).toEqual(['name', 'card']);

    expect(
      getFormSectionsFromFields([
        'card.primary.number',
        'card.primary.cvc',
        'card.primary.expiration',
        'card.primary.name',
        'card.primary.billing_address.country',
        'card.primary.billing_address.zip',
      ]),
    ).toEqual(['name', 'card', 'partialAddress']);

    expect(
      getFormSectionsFromFields([
        'card.primary.number',
        'card.primary.cvc',
        'card.primary.expiration',
        'card.primary.billing_address.zip',
        'card.primary.billing_address.country',
      ]),
    ).toEqual(['card', 'partialAddress']);

    expect(getFormSectionsFromFields([])).toEqual([]);
  });
});
