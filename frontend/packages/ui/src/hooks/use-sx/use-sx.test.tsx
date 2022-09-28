import { HookWrapper, renderHook } from '@onefootprint/test-utils';
import themes from '@onefootprint/themes';

import useSX from './use-sx';

describe('useSX', () => {
  describe('when the parameter is undefined', () => {
    it('should return an empty object', () => {
      const { result } = renderHook(() => useSX(), { wrapper: HookWrapper });
      expect(result.current).toMatchObject({});
    });
  });

  describe('when the parameter is not empty', () => {
    it('should produce the expected style object', () => {
      const { result } = renderHook(
        () =>
          useSX({ backgroundColor: 'primary', marginX: 3, display: 'flex' }),
        { wrapper: HookWrapper },
      );
      expect(result.current).toMatchObject({
        backgroundColor: themes.light.backgroundColor.primary,
        display: 'flex',
        marginLeft: themes.light.spacing[3],
        marginRight: themes.light.spacing[3],
      });
    });
  });
});
