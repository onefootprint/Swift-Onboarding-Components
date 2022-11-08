import themes from '@onefootprint/design-tokens';
import { renderHook, Wrapper } from '@onefootprint/test-utils';

import useSX from './use-sx';

describe('useSX', () => {
  describe('when the parameter is undefined', () => {
    it('should return an empty object', () => {
      const { result } = renderHook(() => useSX(), { wrapper: Wrapper });
      expect(result.current).toMatchObject({});
    });
  });

  describe('when the parameter is not empty', () => {
    it('should produce the expected style object', () => {
      const { result } = renderHook(
        () =>
          useSX({ backgroundColor: 'primary', marginX: 3, display: 'flex' }),
        { wrapper: Wrapper },
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
