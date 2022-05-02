import { renderHook, Wrapper } from 'test-utils';
import { themes } from 'ui';

import useXS from './use-xs';

describe('useXS', () => {
  describe('when the parameter is undefined', () => {
    it('should return an empty object', () => {
      const { result } = renderHook(() => useXS(), { wrapper: Wrapper });
      expect(result.current).toMatchObject({});
    });
  });

  describe('when the parameter is not empty', () => {
    it('should produce the expected style object', () => {
      const { result } = renderHook(
        () =>
          useXS({ backgroundColor: 'primary', marginX: 3, display: 'flex' }),
        { wrapper: Wrapper },
      );
      expect(result.current).toMatchObject({
        backgroundColor: themes.light.backgroundColors.primary,
        display: 'flex',
        marginLeft: themes.light.spacings[3],
        marginRight: themes.light.spacings[3],
      });
    });
  });
});
