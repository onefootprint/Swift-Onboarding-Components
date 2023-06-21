import styled, { css } from '@onefootprint/styled';

const InputAddon = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    margin-inline-end: -1px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    border-inline-end-color: transparent;
    width: auto;
    align-items: center;
    white-space: nowrap;
    border-style: solid;
    flex: 0 0 auto;
    display: flex;
    background: ${theme.backgroundColor.secondary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    color: ${theme.color.primary};
    font: ${theme.typography['body-4']};
    border-radius: ${theme.borderRadius.default} 0 0
      ${theme.borderRadius.default};
  `}

  + .fp-input-container {
    display: flex;
    flex-grow: 1;
    width: 100%;

    input {
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
    }
  }
`;

export default InputAddon;
