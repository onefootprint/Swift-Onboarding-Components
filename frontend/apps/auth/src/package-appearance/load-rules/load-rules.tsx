import React from 'react';
import { createGlobalStyle, css } from 'styled-components';

export type LoadRulesProps = { rules?: string | null | undefined };

const LoadRules = ({ rules }: LoadRulesProps) =>
  rules ? <CustomRules rules={rules} /> : null;

const CustomRules = createGlobalStyle<{ rules?: string }>`
  ${({ rules }) => css`
    ${rules}
  `}
`;

export default LoadRules;
