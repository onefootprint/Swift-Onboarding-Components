import getMultiSelectGroupedLabel from './get-multi-select-grouped-label';

describe('getMultiSelectGroupedLabel', () => {
  describe('when just one option is selected', () => {
    it('should display the label of the selected option', () => {
      const result = getMultiSelectGroupedLabel(
        [
          {
            label: 'Basic Data',
            options: [
              { label: 'Full name', value: 'full_name' },
              { label: 'Email', value: 'email' },
              { label: 'Phone number', value: 'phone_number' },
            ],
          },
        ],
        ['full_name'],
      );

      expect(result).toEqual('Full name');
    });
  });

  describe('when two options are selected', () => {
    it('should display both labels selected', () => {
      const result = getMultiSelectGroupedLabel(
        [
          {
            label: 'Basic Data',
            options: [
              { label: 'Full name', value: 'full_name' },
              { label: 'Email', value: 'email' },
              { label: 'Phone number', value: 'phone_number' },
            ],
          },
        ],
        ['full_name', 'email'],
      );

      expect(result).toEqual('Full name, Email');
    });
  });

  describe('when more than two options are selected', () => {
    it('should display the first label and the remaining count of options selected', () => {
      const result = getMultiSelectGroupedLabel(
        [
          {
            label: 'Basic Data',
            options: [
              { label: 'Full name', value: 'full_name' },
              { label: 'Email', value: 'email' },
              { label: 'Phone number', value: 'phone_number' },
            ],
          },
        ],
        ['full_name', 'email', 'phone_number'],
      );

      expect(result).toEqual('Full name and 2 more');
    });
  });
});
