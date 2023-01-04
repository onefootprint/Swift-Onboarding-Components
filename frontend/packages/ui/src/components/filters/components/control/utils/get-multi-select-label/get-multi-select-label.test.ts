import getMultiSelectLabel from './get-multi-select-label';

describe('getMultiSelectLabel', () => {
  describe('when just one option is selected', () => {
    it('should display the label of the selected option', () => {
      const result = getMultiSelectLabel(
        [
          { label: 'Verified', value: 'verified' },
          { label: 'Failed', value: 'failed' },
          { label: 'Review required', value: 'review_required' },
          { label: 'Id required', value: 'id_required' },
        ],
        ['verified'],
      );

      expect(result).toEqual('Verified');
    });
  });

  describe('when two options are selected', () => {
    it('should display both labels selected', () => {
      const result = getMultiSelectLabel(
        [
          { label: 'Verified', value: 'verified' },
          { label: 'Failed', value: 'failed' },
          { label: 'Review required', value: 'review_required' },
          { label: 'Id required', value: 'id_required' },
        ],
        ['verified', 'failed'],
      );

      expect(result).toEqual('Verified, Failed');
    });
  });

  describe('when more than two options are selected', () => {
    it('should display the first label and the remaining count of options selected', () => {
      const result = getMultiSelectLabel(
        [
          { label: 'Verified', value: 'verified' },
          { label: 'Failed', value: 'failed' },
          { label: 'Review required', value: 'review_required' },
          { label: 'Id required', value: 'id_required' },
        ],
        ['verified', 'failed', 'review_required'],
      );

      expect(result).toEqual('Verified and 2 more');
    });
  });
});
