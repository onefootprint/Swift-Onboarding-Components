import styled, { css } from 'styled';

const Square = styled.li<{ lastColumn: boolean; selected: boolean }>`
  ${({ theme }) => css`
    border-right: ${theme.borderWidth[1]}px dashed #c2cbc3;
    border-bottom: ${theme.borderWidth[1]}px dashed #c2cbc3;

    &:first-child {
      border-top-left-radius: ${theme.borderRadius[1]}px;
    }

    &:last-child {
      border-bottom-right-radius: ${theme.borderRadius[1]}px;
    }

    &:nth-child(14) {
      border-bottom-left-radius: ${theme.borderRadius[1]}px;
    }

    &:nth-child(505) {
      border-top-right-radius: ${theme.borderRadius[1]}px;
    }

    &:nth-child(14n) {
      border-bottom: none;
    }
  `}

  ${({ lastColumn }) =>
    lastColumn &&
    css`
      border-right: none;
    `}

&:hover {
    background: #c2cbc3;
  }

  ${({ selected }) =>
    selected &&
    css`
      background: #c2cbc3;
      cursor: pointer;
    `}
`;

const Tooltip = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => (visible ? 'block' : 'none')};
`;

export default { Square, Tooltip };
