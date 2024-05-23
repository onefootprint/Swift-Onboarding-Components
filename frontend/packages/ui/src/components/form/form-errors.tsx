import React from 'react';
import styled, { css } from 'styled-components';

import { createText } from '../../utils/mixins';

export type FormErrorsProps = {
  children?: React.ReactNode;
  className?: string;
};

const FormErrors = ({ children, className }: FormErrorsProps) =>
  children ? (
    <Text className={`${className} fp-hint fp-custom-appearance`}>
      {children}
    </Text>
  ) : null;

const Text = styled.div`
  ${({ theme }) => {
    const { hint } = theme.components;

    return css`
      color: ${hint.states.error.color};
      margin-top: ${theme.spacing[3]};
      text-align: left;
      ${createText(hint.size.default.typography)}
    `;
  }}
`;

export default FormErrors;
