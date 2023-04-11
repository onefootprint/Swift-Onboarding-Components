import constate from 'constate';

type CloseButtonOptionsProviderProps = {
  onClose?: () => void;
  hideClose?: boolean;
};

const useLocalCloseButtonOptions = ({
  onClose,
  hideClose,
}: CloseButtonOptionsProviderProps) => ({
  onClose,
  hideClose,
});

export const [CloseButtonOptionsProvider, useCloseButtonOptions] = constate(
  useLocalCloseButtonOptions,
);
