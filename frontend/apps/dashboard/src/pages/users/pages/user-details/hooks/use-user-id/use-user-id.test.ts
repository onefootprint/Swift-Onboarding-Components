import { createUseRouterSpy, renderHook } from '@onefootprint/test-utils';

import useUserId from './use-user-id';

const routerSpy = createUseRouterSpy();
const footprintUserId = 'fp_id_yCZehsWNeywHnk5JqL20u';

describe('useUserId', () => {
  beforeEach(() => {
    routerSpy({
      pathname: '/user/detail',
      query: {
        footprint_user_id: footprintUserId,
      },
    });
  });

  it('should return the correct user id', () => {
    const { result } = renderHook(() => useUserId());
    expect(result.current).toEqual(footprintUserId);
  });
});
