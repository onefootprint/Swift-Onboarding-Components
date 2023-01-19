import { useState } from 'react';

import { MissingPermissionsSheetProps } from '../missing-permissions-sheet';

const useLocalSheet = () => {
  const [sheet, setSheet] = useState<
    MissingPermissionsSheetProps | undefined
  >();

  const show = (props: Omit<MissingPermissionsSheetProps, 'open'>) => {
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
