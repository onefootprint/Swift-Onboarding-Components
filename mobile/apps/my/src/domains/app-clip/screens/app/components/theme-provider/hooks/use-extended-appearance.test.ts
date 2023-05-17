import themes from '@onefootprint/design-tokens';
import { customRenderHook, waitFor } from '@onefootprint/test-utils';
import { D2PStatus } from '@onefootprint/types';

import useExtendedAppearance from './use-extended-appearance';
import {
  authTokenFixture,
  withD2PStatus,
} from './use-extended-appearance.test.config';

const defaultTheme = themes.light;

// TODO:
// https://linear.app/footprint/issue/FP-4116/test-in-ci-is-taking-too-long
describe.skip('useExtendedAppearance', () => {
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
        useExtendedAppearance(authTokenFixture),
      );

      const expectedTheme = structuredClone(defaultTheme);
      const { button, input } = expectedTheme.components;
      expectedTheme.borderRadius.default = '12px';
      button.global.borderRadius = '12px';
      input.global.borderRadius = '12px';
      button.variant.primary.bg = 'orange';
      button.variant.primary.hover.bg = 'orange';

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
        useExtendedAppearance(authTokenFixture),
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
        useExtendedAppearance(authTokenFixture),
      );
      await waitFor(() => {
        expect(result.current.data).toEqual(defaultTheme);
      });
    });
  });
});
