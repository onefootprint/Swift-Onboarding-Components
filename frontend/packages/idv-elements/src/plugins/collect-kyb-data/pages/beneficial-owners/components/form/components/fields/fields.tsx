import React from 'react';
import styled, { css } from 'styled-components';

import Email from './components/email';
import Header from './components/header';
import Name from './components/name';
import OwnershipStake from './components/ownership-stake';
import Phone from './components/phone';

export type FieldsProps = {
  index: number;
  onRemove: (index: number) => void;
};

const Fields = ({ index, onRemove }: FieldsProps) => {
  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <Container>
      <Header shouldShowRemove={index > 0} onRemove={handleRemove} />
      <Name index={index} />
      <Email index={index} />
      <Phone index={index} />
      <OwnershipStake index={index} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[1]};
    padding: ${theme.spacing[5]};
    display: grid;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Fields;
