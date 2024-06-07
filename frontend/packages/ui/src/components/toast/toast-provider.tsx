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

  const handleCloseClick = (id: string, onClose?: () => void) => () => {
    hide(id);
    onClose?.();
  };

  return (
    <Portal selector="#footprint-toast-portal">
      <ToastContainer>
        {toasts.map(({ closeAriaLabel, cta, description, id, leaving, onClose, testID, title, variant }) => (
          <Toast
            closeAriaLabel={closeAriaLabel}
            cta={cta}
            description={description}
            id={id}
            key={id}
            leaving={leaving}
            onClose={handleCloseClick(id, onClose)}
            testID={testID}
            title={title}
            variant={variant}
          />
        ))}
      </ToastContainer>
    </Portal>
  );
};

const ToastContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    position: fixed;
    right: ${theme.spacing[5]};
    top: ${theme.spacing[5]};
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
