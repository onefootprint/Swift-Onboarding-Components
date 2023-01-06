import getFormDefaultValues from './get-form-default-values';

describe('getFormDefaultValues', () => {
  describe('when selectedOptions is empty', () => {
    it('should return default period and date values', () => {
      const now = new Date('2020-01-01');
      const result = getFormDefaultValues([], now);

      expect(result).toEqual({
        period: 'all-time',
        customDate: {
          from: new Date('2020-01-01'),
          to: new Date('2020-01-08'),
        },
      });
    });
  });

  describe('when selectedOptions is not empty', () => {
    describe('custom period', () => {
      it('should return the custom period and the dates selected', () => {
        const now = new Date('2020-01-01');
        const result = getFormDefaultValues(['2020-01-01', '2020-01-08'], now);

        expect(result).toEqual({
          period: 'custom',
          customDate: {
            from: new Date('2020-01-01'),
            to: new Date('2020-01-08'),
          },
        });
      });
    });

    describe('pre determined period', () => {
      it('should return the selected period and the default custom date', () => {
        const now = new Date('2020-01-01');
        const result = getFormDefaultValues(['all-time'], now);

        expect(result).toEqual({
          period: 'all-time',
          customDate: {
            from: new Date('2020-01-01'),
            to: new Date('2020-01-08'),
          },
        });
      });
    });
  });
});
