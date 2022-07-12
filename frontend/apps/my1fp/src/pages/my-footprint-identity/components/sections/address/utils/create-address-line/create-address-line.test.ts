import createAddressLine from './create-address-line';

describe('createAddressLine', () => {
  it('filters out empty entries', () => {
    const address = [null, 'San Mateo', null, '', 'CA', ' ', 'USA'];
    expect(createAddressLine(address)).toEqual('San Mateo, CA, USA');
  });

  it('trims white space correctly', () => {
    const address = [
      null,
      '      San Mateo       ',
      null,
      '',
      '     CA',
      '    ',
      'USA    ',
    ];
    expect(createAddressLine(address)).toEqual('San Mateo, CA, USA');
  });

  it('creates the correct address given valid entries', () => {
    const address = ['San Francisco', 'CA', '94107', 'USA'];
    expect(createAddressLine(address)).toEqual('San Francisco, CA, 94107, USA');
  });
});
