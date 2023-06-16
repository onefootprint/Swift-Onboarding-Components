import constate from 'constate';
import React from 'react';

import useLocalSheet from './hooks/use-local-sheet';
import MissingPermissionsSheet from './missing-permissions-sheet';

export type MissingPermissionsSheetProviderProps = {
  children: React.ReactNode;
};

const [Provider, useContext] = constate(useLocalSheet);

const SheetManager = () => {
  const { sheet, hide } = useContext();

  const handleClose = (onClose?: () => void) => () => {
    hide();
    onClose?.();
  };

  return sheet ? (
    <MissingPermissionsSheet
      open={sheet.open}
      onClose={handleClose(sheet.onClose)}
    />
  ) : null;
};

const MissingPermissionsSheetProvider = ({
  children,
}: MissingPermissionsSheetProviderProps) => (
  <Provider>
    <SheetManager />
    {children}
  </Provider>
);

export const useMissingPermissionsSheet = () => {
  const sheet = useContext();
  return { hide: sheet.hide, show: sheet.show };
};

export default MissingPermissionsSheetProvider;
