'use client';

import { Button } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

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
