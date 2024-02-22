'use client';

import styled from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React from 'react';

const Hello = () => (
  <div>
    <Title>hello</Title>
    <Button>hello</Button>
  </div>
);

const Title = styled.h1`
  color: red;
`;

export default Hello;
