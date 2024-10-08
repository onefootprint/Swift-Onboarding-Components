import themes from '@onefootprint/design-tokens';
import { Wrapper, renderHook } from '@onefootprint/test-utils';

import useSX from './use-sx';

const theme = themes.light;

describe('useSX', () => {
  describe('when the parameter is undefined', () => {
    it('should return an empty object', () => {
      const { result } = renderHook(() => useSX(), { wrapper: Wrapper });
      expect(result.current).toMatchObject({});
    });
  });

  describe('when the parameter is not empty', () => {
    it('should produce the expected style object', () => {
      const { result } = renderHook(() => useSX({ backgroundColor: 'primary', marginX: 3, display: 'flex' }), {
        wrapper: Wrapper,
      });
      expect(result.current).toMatchObject({
        backgroundColor: theme.backgroundColor.primary,
        display: 'flex',
        marginLeft: theme.spacing[3],
        marginRight: theme.spacing[3],
      });
    });
  });
});
