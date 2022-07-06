import constate from 'constate';
import React from 'react';
import styled, { css } from 'styled-components';

import Portal from '../portal';
import useToast from './hooks/use-toast';
import Toast from './toast';

export type ToastManagerProps = {
  children: React.ReactNode;
};

export type ToastProviderProps = {
  children: React.ReactNode;
};

const [Provider, useContext] = constate(useToast);

const ToastManager = ({ children }: ToastManagerProps) => {
  const { toasts, hide } = useContext();
  const handleCloseClick = (id: string, onHide?: () => void) => () => {
    hide(id);
    onHide?.();
  };

  return (
    <>
      {children}
      <Portal selector="#footprint-toast-portal">
        <ToastContainer>
          {toasts.map(
            ({
              closeAriaLabel,
              description,
              id,
              leaving,
              onHide,
              testID,
              title,
              variant,
            }) => (
              <Toast
                closeAriaLabel={closeAriaLabel}
                description={description}
                id={id}
                key={id}
                leaving={leaving}
                onHide={handleCloseClick(id, onHide)}
                testID={testID}
                title={title}
                variant={variant}
              />
            ),
          )}
        </ToastContainer>
      </Portal>
    </>
  );
};

const ToastContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]}px;
    position: absolute;
    right: ${theme.spacing[5]}px;
    top: ${theme.spacing[5]}px;
    z-index: ${theme.zIndex.toast};
  `}
`;

const ToastProvider = ({ children }: ToastProviderProps) => (
  <Provider>
    <ToastManager>{children}</ToastManager>
  </Provider>
);

export default ToastProvider;
export { useContext as useToast };
