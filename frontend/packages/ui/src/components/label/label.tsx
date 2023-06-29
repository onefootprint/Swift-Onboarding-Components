import { IcoInfo16, Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

import Tooltip from '../tooltip';

export type LabelTooltipProps = {
  text: string;
  triggerAriaLabel?: string;
  iconComponent?: Icon;
};

export type LabelProps = {
  children: string;
  hasError?: boolean;
  htmlFor?: string;
  id?: string;
  size?: 'default' | 'compact';
  tooltip?: LabelTooltipProps;
};

const Label = ({
  children,
  hasError = false,
  htmlFor,
  id,
  size = 'default',
  tooltip = undefined,
}: LabelProps) => (
  <LabelContainer>
    <StyledLabel
      className="fp-label"
      data-has-error={hasError}
      data-size={size}
      htmlFor={htmlFor}
      id={id}
    >
      {children}
    </StyledLabel>
    {tooltip && (
      <Tooltip text={tooltip.text} alignment="center" position="bottom">
        <InfoButton aria-label={tooltip?.triggerAriaLabel ?? tooltip?.text}>
          {tooltip?.iconComponent ? <tooltip.iconComponent /> : <IcoInfo16 />}
        </InfoButton>
      </Tooltip>
    )}
  </LabelContainer>
);
const InfoButton = styled.button`
  ${({ theme }) => css`
    background: none;
    border: none;
    padding: ${theme.spacing[1]} 0 0 0;
    margin: 0;
  `}
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[3]};
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    gap: ${theme.spacing[3]};
  `}
`;

const StyledLabel = styled.label`
  ${({ theme }) => {
    const { inputLabel } = theme.components;

    return css`
      color: ${inputLabel.states.default.color};
      font: ${inputLabel.size.default.typography};

      &[data-has-error='true'] {
        color: ${inputLabel.states.error.color};
      }

      &[data-size='compact'] {
        font: ${inputLabel.size.compact.typography};
      }
    `;
  }}
`;

export default Label;
