import React from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../utils';

type FormInputAddonSize = 'default' | 'compact';

type FormInputAddonProps = {
  children: React.ReactNode;
  size?: FormInputAddonSize;
};

const FormInputAddon = ({ children, size = 'default' }: FormInputAddonProps) => {
  return <Container data-size={size}>{children}</Container>;
};

const Container = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};

    align-items: center;
    background: ${theme.backgroundColor.secondary};
    border-bottom-right-radius: 0px;
    border-inline-end-color: transparent;
    border-radius: ${theme.borderRadius.default} 0 0  ${theme.borderRadius.default};
    border-style: solid;
    border-top-right-radius: 0px;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    color: ${theme.color.primary};
    display: flex;
    flex: 0 0 auto;
    margin-inline-end: -1px;
    white-space: nowrap;
    width: auto;
    
    &[data-size='compact'] {
      padding: ${theme.spacing[2]} ${theme.spacing[5]};
    }

    &[data-size='default'] {
      padding: ${theme.spacing[3]} ${theme.spacing[5]};
    }
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

export default FormInputAddon;
