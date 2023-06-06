import styled, { css } from 'styled-components';

import { createFontStyles, createOverlayBackground } from '../../utils/mixins';

const Container = styled.div`
  position: relative;
`;

const DropdownContainer = styled.div<{ withPaddingTop: boolean }>`
  ${({ theme }) => css`
    z-index: ${theme.zIndex.dropdown};
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    box-shadow: ${theme.elevation[2]};
    width: 100%;
  `}

  ${({ withPaddingTop, theme }) =>
    withPaddingTop &&
    css`
      padding: ${theme.spacing[2]} 0 0;
    `}
`;

const ListContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    max-height: 180px;
    overflow: auto;
  `}
`;

const List = styled.ul`
  position: relative;
  width: 100%;
`;

const EmptyState = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    color: ${theme.color.tertiary};
    margin: ${theme.spacing[3]} 0;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
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
    margin-bottom: ${theme.spacing[2]};
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `}

  ${({ disableHoverStyles }) =>
    !disableHoverStyles &&
    css`
      @media (hover: hover) {
        &:hover {
          ${createOverlayBackground('darken-1', 'primary')}
        }
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
  List,
  ListContainer,
  EmptyState,
  DefaultOption,
};
