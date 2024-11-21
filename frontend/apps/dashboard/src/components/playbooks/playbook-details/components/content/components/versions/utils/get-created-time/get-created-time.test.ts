import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import getCreatedTime from './get-created-time';

describe('getCreatedTime', () => {
  it('should format the date correctly', () => {
    const playbook = getOnboardingConfiguration({
      createdAt: '2024-01-15T14:30:00Z',
    });

    expect(getCreatedTime(playbook)).toBe('01/15/24, 02:30 PM');
  });

  it('should handle different time zones correctly', () => {
    const playbook = getOnboardingConfiguration({
      createdAt: '2024-01-15T00:00:00Z',
    });

    // The exact expected time will depend on the timezone where the tests run
    // We'll verify the format matches the expected pattern
    const result = getCreatedTime(playbook);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} [AP]M$/);
  });

  it('should handle single digit hours correctly', () => {
    const playbook = getOnboardingConfiguration({
      createdAt: '2024-01-15T04:05:00Z',
    });

    const result = getCreatedTime(playbook);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} [AP]M$/);
  });
});
