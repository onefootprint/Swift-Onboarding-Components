import type { Icon } from '@onefootprint/icons';
import { IcoInfo16 } from '@onefootprint/icons';
import { useContext } from 'react';
import styled, { css } from 'styled-components';
import { createText } from '../../../utils';
import Tooltip from '../../tooltip';
import formFieldContext from './form-field-context';

type LabelTooltipProps = {
  text: string;
  triggerAriaLabel?: string;
  iconComponent?: Icon;
};

type FormLabelLabelProps = {
  children: string | React.ReactNode;
  hasError?: boolean;
  htmlFor?: string;
  id?: string;
  size?: 'default' | 'compact';
  tooltip?: LabelTooltipProps;
};

const FormLabel = ({
  children,
  hasError = false,
  htmlFor,
  id,
  size = 'default',
  tooltip = undefined,
}: FormLabelLabelProps) => {
  const { id: contextId } = useContext(formFieldContext);
  if (!contextId) {
    throw new Error('Label must be used inside a Field component');
  }

  return (
    <LabelContainer>
      <StyledLabel
        /** Do not change/remove these classes */
        className="fp-label fp-custom-appearance"
        data-has-error={hasError}
        data-size={size}
        htmlFor={htmlFor || contextId}
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
};

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

const StyledLabel = styled.label`
  ${({ theme }) => {
    const { label } = theme.components;

    return css`
      ${createText(label.size.default.typography)}
      color: ${label.states.default.color};

      &[data-has-error='true'] {
        color: ${label.states.error.color};
      }

      &[data-size='compact'] {
        ${createText(label.size.compact.typography)}
      }
    `;
  }}
`;

const InfoButton = styled.button`
  ${({ theme }) => css`
    background: none;
    border: none;
    padding: ${theme.spacing[1]} 0 0 0;
    margin: 0;
  `}
`;

export default FormLabel;
