import styled, { css } from 'styled';

import { createFontStyles, createOverlayBackground } from '../../utils/mixins';

const Container = styled.div`
  position: relative;
`;

const DropdownContainer = styled.div<{ withPaddingTop: boolean }>`
  ${({ theme }) => css`
    z-index: ${theme.zIndex.dropdown};
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.primary};
    box-shadow: ${theme.elevation[2]};
    width: 100%;
  `}

  ${({ withPaddingTop, theme }) =>
    withPaddingTop &&
    css`
      padding: ${theme.spacing[2]}px 0 0;
    `}
`;

const Dropdown = styled.ul`
  ${({ theme }) => css`
    border-bottom-left-radius: ${theme.borderRadius[1]}px;
    border-bottom-right-radius: ${theme.borderRadius[1]}px;
    max-height: 180px;
    overflow: auto;
  `}
`;

const EmptyState = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    color: ${theme.color.tertiary};
    margin: ${theme.spacing[3]}px 0;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `}
`;

const DefaultOption = styled('li')<{
  children: React.ReactNode;
  disableHoverStyles: boolean;
  highlighted: boolean;
}>`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    align-items: center;
    background: ${theme.backgroundColor.primary};
    color: ${theme.color.secondary};
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[2]}px;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `}

  ${({ disableHoverStyles }) =>
    !disableHoverStyles &&
    css`
      &:hover {
        ${createOverlayBackground('darken-1', 'primary')}
      }
    `}

  ${({ highlighted }) =>
    highlighted &&
    css`
      ${createOverlayBackground('darken-1', 'primary')}
    `}
`;

export default {
  Container,
  DropdownContainer,
  Dropdown,
  EmptyState,
  DefaultOption,
};
