import constate from 'constate';
import React from 'react';
import styled, { css } from 'styled-components';

import Portal from '../portal';
import useLocalToast from './hooks/use-toast';
import Toast from './toast';

export type ToastProviderProps = {
  children: React.ReactNode;
};

const [Provider, useContext] = constate(useLocalToast);

const ToastManager = () => {
  const { toasts, hide } = useContext();

  const handleCloseClick = (id: string, onHide?: () => void) => () => {
    hide(id);
    onHide?.();
  };

  return (
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
  );
};

const ToastContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]}px;
    position: fixed;
    right: ${theme.spacing[5]}px;
    top: ${theme.spacing[5]}px;
    z-index: ${theme.zIndex.toast};
  `}
`;

const ToastProvider = ({ children }: ToastProviderProps) => (
  <Provider>
    <ToastManager />
    {children}
  </Provider>
);

export const useToast = () => {
  const toast = useContext();
  return { hide: toast.hide, show: toast.show };
};

export default ToastProvider;
