import styled, { css } from 'styled-components';

import { createText } from '../../utils/mixins';

export type FormErrorsProps = {
  children?: unknown;
  className?: string;
};

const FormErrors = ({ children, className }: FormErrorsProps) =>
  children && typeof children === 'string' ? (
    <Text className={`${className} fp-hint fp-custom-appearance`}>{children}</Text>
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
