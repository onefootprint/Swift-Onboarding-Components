import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import { renderHook } from '@onefootprint/test-utils';
import useTitle from './use-title';

describe('useTitle', () => {
  describe('when it is a new playbook', () => {
    it('should return "Create"', () => {
      const { result } = renderHook(() => useTitle());
      expect(result.current).toEqual('Create playbook');
    });
  });

  describe('when editing an existing playbook', () => {
    it('should return title for existing playbook', () => {
      const playbook = getOnboardingConfiguration({ kind: 'kyc', name: 'User Verification' });
      const { result } = renderHook(() => useTitle(playbook));
      expect(result.current).toEqual('Editing ”User Verification” | KYC playbook');
    });
  });
});
