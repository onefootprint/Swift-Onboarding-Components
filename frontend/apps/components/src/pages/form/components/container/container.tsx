import { createFontStyles, media } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

type ContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  testID?: string;
};

const Container = ({ header, footer, testID, children }: ContainerProps) => (
  <Wrapper data-testid={testID}>
    {header && <Header>{header}</Header>}
    <Content>{children}</Content>
    {footer && <Footer>{footer}</Footer>}
  </Wrapper>
);

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    flex: 1;

    body[data-variant='modal'] & {
      padding: ${theme.spacing[7]};
    }
    body[data-variant='drawer'] & {
      padding: ${theme.spacing[7]};
    }
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[2]};
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 1;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;
    height: 46px;
    ${createFontStyles('label-2')}

    body[data-variant='inline'] & {
      ${createFontStyles('label-1')}
    }

    body[data-variant='modal'] & {
      justify-content: center;
      padding: ${theme.spacing[4]};
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }

    body[data-variant='drawer'] & {
      justify-content: center;
      padding: ${theme.spacing[4]};
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${theme.backgroundColor.primary};
    width: 100%;
    z-index: 1;
    position: sticky;
    bottom: 0;
    border-radius: 0 0 ${theme.borderRadius.default}
      ${theme.borderRadius.default};

    body[data-variant='inline'] & {
      ${createFontStyles('label-1')}
      padding: ${theme.spacing[7]} 0 0 0;
    }

    body[data-variant='modal'] & {
      justify-content: center;
      padding: 0 ${theme.spacing[7]} ${theme.spacing[7]} ${theme.spacing[7]};
    }

    body[data-variant='drawer'] & {
      justify-content: center;
      padding: 0 ${theme.spacing[7]} ${theme.spacing[7]} ${theme.spacing[7]};
    }
  `}
`;

const Wrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    justify-content: stretch;
    width: 100%;
    max-height: 100%;
    overflow: auto;

    body[data-variant='modal'] & {
      box-shadow: ${theme.elevation[3]};
      border: 1px solid ${theme.borderColor.tertiary};
      height: 100%;
      width: 100%;
      border-radius: 0;
      margin: 0;

      ${media.greaterThan('md')`
        height: auto;
        max-width: calc(100% - (2 * ${theme.spacing[9]}));
        max-height: calc(100% - (2 * ${theme.spacing[9]}));
        margin: ${theme.spacing[9]};
        border-radius: ${theme.borderRadius.default};
        max-width: 480px;
    `}
    }

    body[data-variant='drawer'] & {
      box-shadow: ${theme.elevation[3]};
      border: none;
      border-radius: 0;
      height: 100vh;
      width: 100%;
      position: fixed;
      right: 0;

      ${media.greaterThan('md')`
        width: 480px;
        border-radius: 0;
    `}
    }
  `}
`;

export default Container;
