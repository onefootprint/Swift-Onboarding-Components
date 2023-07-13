import themes from '@onefootprint/design-tokens';
import { customRenderHook, waitFor } from '@onefootprint/test-utils';
import { D2PStatus } from '@onefootprint/types';

import useStyleParams from './use-style-params';
import {
  authTokenFixture,
  withD2PStatus,
} from './use-style-params.test.config';

const defaultTheme = themes.light;

// TODO:
// https://linear.app/footprint/issue/FP-4116/test-in-ci-is-taking-too-long
describe.skip('useStyleParams', () => {
  describe('when the d2p has a valid style params', () => {
    beforeEach(() => {
      withD2PStatus({
        status: D2PStatus.waiting,
        meta: {
          styleParams:
            '{"variables":{"borderRadius": "12px", "buttonPrimaryBg": "orange"}}',
        },
      });
    });

    it('should just return the default theme', async () => {
      const { result } = customRenderHook(() =>
        useStyleParams(authTokenFixture),
      );

      const expectedTheme = structuredClone(defaultTheme);
      const { button, input } = expectedTheme.components;
      expectedTheme.borderRadius.default = '12px';
      button.borderRadius = '12px';
      input.global.borderRadius = '12px';
      button.variant.primary.bg = 'orange';

      await waitFor(() => {
        expect(result.current.data).toEqual(expectedTheme);
      });
    });
  });

  describe('when the d2p has an invalid style params', () => {
    beforeEach(() => {
      withD2PStatus({
        status: D2PStatus.waiting,
        meta: {
          styleParams: 'invalid parameter',
        },
      });
    });

    it('should just return the extended theme', async () => {
      const { result } = customRenderHook(() =>
        useStyleParams(authTokenFixture),
      );
      await waitFor(() => {
        expect(result.current.data).toEqual(defaultTheme);
      });
    });
  });

  describe('when the d2p does not have any style params', () => {
    beforeEach(() => {
      withD2PStatus({
        status: D2PStatus.waiting,
        meta: {
          styleParams: null,
        },
      });
    });

    it('should just return the default theme', async () => {
      const { result } = customRenderHook(() =>
        useStyleParams(authTokenFixture),
      );
      await waitFor(() => {
        expect(result.current.data).toEqual(defaultTheme);
      });
    });
  });
});
