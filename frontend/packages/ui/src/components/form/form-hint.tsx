import styled, { css } from 'styled-components';

import { createText } from '../../utils/mixins';

export type FormHintProps = {
  children?: string;
  className?: string;
};

const FormHint = ({ children, className }: FormHintProps) => (
  <Text className={`${className} fp-hint fp-custom-appearance`}>{children}</Text>
);

const Text = styled.div`
  ${({ theme }) => {
    const { hint } = theme.components;

    return css`
      color: ${hint.states.default.color};
      margin-top: ${theme.spacing[3]};
      text-align: left;
      ${createText(hint.size.default.typography)}
    `;
  }}
`;

export default FormHint;
