'use client';

import { LogoFpCompact } from '@onefootprint/icons';
import {
  Box,
  Button,
  Divider,
  GoogleButton,
  Stack,
  Text,
  TextInput,
} from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

const Page = () => (
  <Box
    backgroundColor="primary"
    borderRadius="lg"
    borderWidth={1}
    borderStyle="solid"
    borderColor="tertiary"
    padding={8}
    elevation={1}
    position="relative"
  >
    <StyledImage
      alt="Penguin"
      height={90}
      src="/auth/penguin-create.png"
      width={135}
    />
    <Stack width="398px" direction="column" gap={7}>
      <LogoFpCompact />
      <Text variant="label-2">Create your account</Text>
      <GoogleButton size="large">Continue with Google</GoogleButton>
      <Stack direction="row" center gap={4}>
        <Divider />
        <Text variant="body-4" color="tertiary">
          or
        </Text>
        <Divider />
      </Stack>
      <Stack direction="column" gap={4}>
        <TextInput label="Email address" placeholder="your.email@email.com" />
        <Button size="large" fullWidth>
          Continue with email
        </Button>
      </Stack>
      <Text color="secondary" variant="body-4" gap={2} display="inline-flex">
        <span>Already have an account?</span>
        <Link href="/auth/sign-in">Sign in</Link>
      </Text>
    </Stack>
  </Box>
);

const StyledImage = styled(Image)`
  color: transparent;
  position: absolute;
  top: -90px;
  right: 24px;
`;

export default Page;
