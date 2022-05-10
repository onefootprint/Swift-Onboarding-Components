import { Property } from 'csstype';
import styled, { css } from 'styled';

const Container = styled.div`
  position: relative;
`;

const Dropdown = styled.ul<{
  maxHeight?: Property.MaxHeight;
}>`
  ${({ theme, maxHeight = 330 }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.primary};
    box-shadow: ${theme.elevation[2]};
    max-height: ${maxHeight};
    outline: none;
    padding: ${theme.spacing[3]}px 0 0;
    width: 100%;
  `}
`;

export default { Container, Dropdown };
