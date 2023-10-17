import convertFormData from './convert-form-data';

describe('convertFormData', () => {
  it('generates correct data', () => {
    expect(
      convertFormData(
        {
          name: 'test',
          number: '1234 5678 9012 3456',
          expiry: '12/34',
          cvc: '123',
          zip: '12345',
          country: {
            label: 'United States',
            value: 'US',
          },
        },
        'primary',
      ),
    ).toEqual({
      'card.primary.number': '1234567890123456',
      'card.primary.expiration': '12/34',
      'card.primary.cvc': '123',
      'card.primary.name': 'test',
      'card.primary.billing_address.zip': '12345',
      'card.primary.billing_address.country': 'US',
    });

    expect(
      convertFormData(
        {
          name: 'test',
          number: '1234 5678 9012 3456',
          expiry: '12/34',
          cvc: '123',
          zip: '12345',
          country: {
            label: 'United States',
            value: 'US',
          },
        },
        '3243-34t43c-4k3r3k4',
      ),
    ).toEqual({
      'card.3243-34t43c-4k3r3k4.number': '1234567890123456',
      'card.3243-34t43c-4k3r3k4.expiration': '12/34',
      'card.3243-34t43c-4k3r3k4.cvc': '123',
      'card.3243-34t43c-4k3r3k4.name': 'test',
      'card.3243-34t43c-4k3r3k4.billing_address.zip': '12345',
      'card.3243-34t43c-4k3r3k4.billing_address.country': 'US',
    });
  });
});
