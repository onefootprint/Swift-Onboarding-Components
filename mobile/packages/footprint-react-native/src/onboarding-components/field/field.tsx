import React, { useId, useMemo } from 'react';

import FieldContext from '../field-context';
import type { Di } from '../types/dis';

export type FieldProps = {
  name: keyof Di;
  children?: React.ReactNode;
};

const Field = ({ name, children }: FieldProps) => {
  const id = useId();
  const contextValues = useMemo(() => ({ name, id }), [name, id]);

  return (
    <FieldContext.Provider value={contextValues}>
      {children}
    </FieldContext.Provider>
  );
};

export default Field;
