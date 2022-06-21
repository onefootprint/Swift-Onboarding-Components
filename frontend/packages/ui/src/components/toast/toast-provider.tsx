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
  const { toasts, close } = useContext();
  const handleCloseClick = (id: string, onClose?: () => void) => () => {
    close(id);
    onClose?.();
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
              onClose,
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
                onClose={handleCloseClick(id, onClose)}
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
    <div id="footprint-toast-portal" />
  </Provider>
);

export default ToastProvider;
export { useContext as useToast };
