'use client';

import { Button, Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/navigation';
import type React from 'react';

type ErrorProps = {
  children?: React.ReactNode;
  error?: Error & { digest?: string };
  goToLabel?: string;
  goToPath?: string;
  header?: React.ReactNode;
};

const ErrorComponent = ({ children, error, goToLabel, goToPath, header }: ErrorProps) => {
  const router = useRouter();

  return (
    <Stack flexDirection="column">
      <Text tag="h2" variant="heading-2" marginBottom={4}>
        {header || 'Something went wrong!'}
      </Text>
      {error ? (
        <Text variant="body-3" color="secondary" marginBottom={4}>
          {error.message}
        </Text>
      ) : null}
      {children ? (
        <Text variant="body-3" color="secondary" marginBottom={4}>
          {children}
        </Text>
      ) : null}
      {goToLabel && goToPath ? (
        <Button variant="secondary" onClick={() => router.push(goToPath, { scroll: false })}>
          {goToLabel}
        </Button>
      ) : null}
    </Stack>
  );
};

export default ErrorComponent;
