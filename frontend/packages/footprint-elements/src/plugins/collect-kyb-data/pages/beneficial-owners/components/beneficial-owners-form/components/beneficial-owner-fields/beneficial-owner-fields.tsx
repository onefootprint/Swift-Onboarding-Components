import React from 'react';
import styled, { css } from 'styled-components';

import BeneficialOwnerEmail from '../beneficial-owner-email';
import BeneficialOwnerName from '../beneficial-owner-name';
import FieldsHeader from '../fields-header';
import OwnershipStake from '../ownership-stake';

export type BeneficialOwnerFieldsProps = {
  index: number;
  onRemove: (index: number) => void;
};

const BeneficialOwnerFields = ({
  index,
  onRemove,
}: BeneficialOwnerFieldsProps) => {
  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <Container>
      <FieldsHeader shouldShowRemove={index > 0} onRemove={handleRemove} />
      <BeneficialOwnerName index={index} />
      <BeneficialOwnerEmail index={index} />
      <OwnershipStake index={index} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default BeneficialOwnerFields;
