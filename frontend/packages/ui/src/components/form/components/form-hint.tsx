import styled, { css } from 'styled-components';

import { createText } from '../../../utils/mixins';

export type FormHintProps = {
  children?: string;
  className?: string;
  textAlign?: 'left' | 'right';
};

const FormHint = ({ children, className, textAlign = 'left' }: FormHintProps) => (
  <Text className={`${className} fp-hint fp-custom-appearance`} textAlign={textAlign}>
    {children}
  </Text>
);

const Text = styled.div<{ textAlign: 'left' | 'right' }>`
  ${({ theme, textAlign }) => {
    const { hint } = theme.components;

    return css`
      color: ${hint.states.default.color};
      margin-top: ${theme.spacing[3]};
      text-align: ${textAlign};
      ${createText(hint.size.default.typography)}
    `;
  }}
`;

export default FormHint;
