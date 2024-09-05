import styled, { css } from 'styled-components';

import { createText } from '../../utils/mixins';
import Box, { type BoxProps } from '../box';

export type FormErrorsProps = {
  children?: unknown;
  className?: string;
} & Omit<BoxProps, 'children'>;

const FormErrors = ({ children, className }: FormErrorsProps) =>
  children && typeof children === 'string' ? (
    <Text className={`${className} fp-form-errors fp-custom-appearance`}>{children}</Text>
  ) : null;

const Text = styled(Box)`
  ${({ theme }) => {
    const { hint } = theme.components;

    return css`
      color: ${hint.states.error.color};
      margin-top: ${theme.spacing[3]};
      ${createText(hint.size.default.typography)}
    `;
  }}
`;

export default FormErrors;
