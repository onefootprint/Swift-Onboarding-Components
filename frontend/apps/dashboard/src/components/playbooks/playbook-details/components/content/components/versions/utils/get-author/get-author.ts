import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';

const getAuthor = ({ author }: OnboardingConfiguration) => {
  if (author?.kind === 'organization') {
    const name = [author.firstName, author.lastName].filter(Boolean).join(' ');
    return name || author.email;
  }
  if (author?.kind === 'footprint') {
    return 'Footprint';
  }
  return 'Unknown';
};

export default getAuthor;
