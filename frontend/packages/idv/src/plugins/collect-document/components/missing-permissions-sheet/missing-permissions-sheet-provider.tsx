import constate from 'constate';
import React from 'react';

import type { DeviceInfo } from '../../../../hooks';
import useLocalSheet from './hooks/use-local-sheet';
import MissingPermissionsSheet from './missing-permissions-sheet';

export type MissingPermissionsSheetProviderProps = {
  device: DeviceInfo;
  children: React.ReactNode;
};

const [Provider, useContext] = constate(useLocalSheet);

const SheetManager = ({ device }: { device: DeviceInfo }) => {
  const { sheet, hide } = useContext();

  const handleClose = (onClose?: () => void) => () => {
    hide();
    onClose?.();
  };

  return sheet ? (
    <MissingPermissionsSheet device={device} open={sheet.open} onClose={handleClose(sheet.onClose)} />
  ) : null;
};

const MissingPermissionsSheetProvider = ({ device, children }: MissingPermissionsSheetProviderProps) => (
  <Provider>
    <SheetManager device={device} />
    {children}
  </Provider>
);

export const useMissingPermissionsSheet = () => {
  const sheet = useContext();
  return { hide: sheet.hide, show: sheet.show };
};

export default MissingPermissionsSheetProvider;
