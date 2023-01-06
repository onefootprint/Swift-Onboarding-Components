import getDateLabel from './get-date-label';

describe('getDateLabel', () => {
  const options = [
    { value: 'all-time', label: 'All-time' },
    { value: 'today', label: 'Today' },
    { value: 'last-7-days', label: 'Last 7 days' },
    { value: 'last-30-days', label: 'Current month' },
    { value: 'custom', label: 'Custom' },
  ];

  it('should return the label of the selected option', () => {
    const selectedOptions = ['today'];
    const label = getDateLabel(options, selectedOptions);
    expect(label).toBe('Today');
  });

  describe('when the selected option is custom', () => {
    it('should return both dates formatted', () => {
      const from = new Date('01/05/2022').toISOString();
      const to = new Date('01/05/2023').toISOString();
      const selectedOptions = [from, to];
      const label = getDateLabel(options, selectedOptions);
      expect(label).toBe('1/5/2022 - 1/5/2023');
    });

    it('should return undefined when passing an invalid date', () => {
      const from = 'lorem';
      const to = 'ipsum';
      const selectedOptions = [from, to];
      const label = getDateLabel(options, selectedOptions);
      expect(label).toBeUndefined();
    });
  });
});
