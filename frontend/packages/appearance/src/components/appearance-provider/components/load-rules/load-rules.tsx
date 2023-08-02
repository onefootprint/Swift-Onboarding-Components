import { createGlobalStyle, css } from '@onefootprint/styled';
import React from 'react';

export type LoadRulesProps = {
  rules?: string | null;
};

const LoadRules = ({ rules }: LoadRulesProps) =>
  rules ? <CustomRules rules={rules} /> : null;

const CustomRules = createGlobalStyle<{
  rules?: string;
}>`
  ${({ rules }) => css`
    ${rules}
  `}
`;

export default LoadRules;
