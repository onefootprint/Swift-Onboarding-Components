import { useState } from 'react';

import type { MissingPermissionsSheetProps } from '../missing-permissions-sheet';

const useLocalSheet = () => {
  const [sheet, setSheet] = useState<
    Omit<MissingPermissionsSheetProps, 'device'> | undefined
  >();

  const show = (
    props: Omit<MissingPermissionsSheetProps, 'open' | 'device'>,
  ) => {
    setSheet({ ...props, open: true });
  };

  const hide = () => {
    if (!sheet) {
      return;
    }
    setSheet(currentSheet => {
      if (!currentSheet) {
        return undefined;
      }
      return {
        ...currentSheet,
        open: false,
      };
    });
  };

  return { sheet, show, hide };
};

export default useLocalSheet;
