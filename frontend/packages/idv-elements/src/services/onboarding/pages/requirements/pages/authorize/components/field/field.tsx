import { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';

export type FieldProps = {
  label: string;
  IconComponent: Icon;
};

const Field = ({ label, IconComponent }: FieldProps) => (
  <Category>
    <IconContainer>
      <IconComponent />
    </IconContainer>
    <LabelContainer>{label}</LabelContainer>
  </Category>
);

const IconContainer = styled.span`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]};
  `}
`;

const LabelContainer = styled.span`
  ${createFontStyles('body-4')};

  ${media.greaterThan('md')`
    ${createFontStyles('label-3')};
  `}
`;

const Category = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
`;

export default Field;
