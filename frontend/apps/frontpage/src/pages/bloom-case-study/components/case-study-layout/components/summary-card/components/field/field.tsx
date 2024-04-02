import { Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

type FieldProps = {
  label: string;
  value: string;
  href?: string;
};

const Field = ({ label, value, href }: FieldProps) => (
  <Container direction="column" gap={2}>
    <Text variant="caption-3" color="tertiary" textTransform="uppercase">
      {label}
    </Text>
    {href ? (
      <Link href={href}>
        <Text variant="body-2" color="primary">
          {value}
        </Text>
      </Link>
    ) : (
      <Text variant="body-2" color="primary">
        {value}
      </Text>
    )}
  </Container>
);

const Container = styled(Stack)`
  && {
    p {
      margin-bottom: 0;
    }
  }
`;
export default Field;
