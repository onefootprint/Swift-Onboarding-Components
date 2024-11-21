import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import getAuthor from './get-author';

describe('getAuthor', () => {
  it('should return full name for organization author when both first and last names exist', () => {
    const playbook = getOnboardingConfiguration({
      author: {
        kind: 'organization',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        member: 'member-1',
      },
    });

    expect(getAuthor(playbook)).toBe('John Doe');
  });

  it('should return email for organization author when name is not available', () => {
    const playbook = getOnboardingConfiguration({
      author: {
        kind: 'organization',
        firstName: '',
        lastName: '',
        email: 'john@example.com',
        member: 'member-1',
      },
    });

    expect(getAuthor(playbook)).toBe('john@example.com');
  });

  it('should return "Footprint" for footprint author', () => {
    const playbook = getOnboardingConfiguration({
      author: {
        kind: 'footprint',
      },
    });

    expect(getAuthor(playbook)).toBe('Footprint');
  });

  it('should return "Unknown" when author is undefined', () => {
    const playbook = getOnboardingConfiguration({
      author: undefined,
    });

    expect(getAuthor(playbook)).toBe('Unknown');
  });
});
