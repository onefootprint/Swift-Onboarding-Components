import constate from 'constate';
import React from 'react';

import type { DeviceInfo } from '../../../../hooks';
import useLocalSheet from './hooks/use-local-sheet';
import MissingPermissionsSheet from './missing-permissions-sheet';

export type MissingPermissionsSheetProviderProps = {
  device: DeviceInfo;
  children: React.ReactNode;
};

const [LocalSheetProvider, useLocalSheetContext] = constate(useLocalSheet);

const SheetManager = ({ device }: { device: DeviceInfo }) => {
  const { sheet, hide } = useLocalSheetContext();

  const handleClose = (onClose?: () => void) => () => {
    hide();
    onClose?.();
  };

  return sheet ? (
    <MissingPermissionsSheet device={device} open={sheet.open} onClose={handleClose(sheet.onClose)} />
  ) : null;
};

const MissingPermissionsSheetProvider = ({ device, children }: MissingPermissionsSheetProviderProps) => (
  <LocalSheetProvider>
    <SheetManager device={device} />
    {children}
  </LocalSheetProvider>
);

export const useMissingPermissionsSheet = () => {
  const sheet = useLocalSheetContext();
  return { hide: sheet.hide, show: sheet.show };
};

export default MissingPermissionsSheetProvider;
