import { createUseRouterSpy, renderHook } from '@onefootprint/test-utils';

import useUserId from './use-user-id';

const routerSpy = createUseRouterSpy();

describe('useUserId', () => {
  beforeEach(() => {
    routerSpy({
      pathname: '/detail?footprint_user_id=fp_id_yCZehsWNeywHnk5JqL20u',
      query: {
        footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
      },
    });
  });

  it('should return the correct user id', () => {
    const { result } = renderHook(() => useUserId());
    expect(result.current).toEqual('fp_id_yCZehsWNeywHnk5JqL20u');
  });
});
