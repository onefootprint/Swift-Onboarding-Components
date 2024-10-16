import { Checkbox, Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type CheckboxChipProps = {
  isSelected: boolean;
  onChange: () => void;
  label: string;
  value: string;
};

const CheckboxChip = ({ isSelected, onChange, label, value }: CheckboxChipProps) => (
  <Container direction="row" borderRadius="default" align="center" data-is-selected={isSelected}>
    <Checkbox value={value} label={label} checked={isSelected} onChange={onChange} />
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    cursor: pointer;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &[data-is-selected='true'] {
      background-color: ${theme.backgroundColor.primary};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    }
  `}
`;

export default CheckboxChip;
