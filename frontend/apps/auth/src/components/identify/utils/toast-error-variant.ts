import { getErrorMessage } from '@onefootprint/request';

const getErrorToastVariant = (err?: unknown) => ({
  description: getErrorMessage(err),
  title: 'Uh-oh!',
  variant: 'error' as const,
});

export default getErrorToastVariant;
