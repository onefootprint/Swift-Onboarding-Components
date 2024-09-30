import { IcoFilter16 } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type FilterButtonProps = {
  children: React.ReactNode;
  hasFilters?: boolean;
  onClick?: () => void;
};

const FilterButton = ({ children, onClick, hasFilters }: FilterButtonProps) => {
  return (
    <Button onClick={onClick} data-checked={hasFilters} type="button">
      <IcoFilter16 />
      {children}
    </Button>
  );
};

const Button = styled.button`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    align-items: center;
    background: ${theme.backgroundColor.primary};
    border-color: ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    border-style: dashed;
    border-width: ${theme.borderWidth[1]};
    color: ${theme.color.secondary};
    cursor: pointer;
    display: flex;
    gap: ${theme.spacing[2]};
    height: 32px;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    transition: all 200ms ease-in-out;
    width: fit-content;

    @media (hover: hover) {
      &:hover {
        background: ${theme.backgroundColor.secondary};
      }
    }

    &[data-checked='true'] {
      background: ${theme.backgroundColor.tertiary};
      border-color: transparent;
      color: ${theme.color.quinary};

      path {
        stroke: ${theme.color.quinary};
      }
    }
  `}
`;

export default FilterButton;
