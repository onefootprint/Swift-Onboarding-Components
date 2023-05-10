import getSingleSelectLabel from './get-single-select-label';

describe('getSingleSelectLabel', () => {
  it('should display the label of the selected option', () => {
    const result = getSingleSelectLabel(
      [
        { label: 'Tyumen', value: 'tyumen' },
        { label: 'Albuquerue', value: 'albuquerque' },
        { label: 'Stanford', value: 'stanford' },
      ],
      'stanford',
    );

    expect(result).toEqual('Stanford');
  });
});
