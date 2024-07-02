import { get } from 'lodash';
import React, { useId, useMemo } from 'react';
import type { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import FieldContext from '../field-context';
import type { Di } from '../types/dis';

export type FieldProps = {
  name: keyof Di;
  children?: (
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    error: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined,
  ) => React.ReactNode;
};

const Field = ({ name, children }: FieldProps) => {
  const id = useId();
  const contextValues = useMemo(() => ({ name, id }), [name, id]);
  const {
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name);

  return (
    <FieldContext.Provider value={contextValues}>
      {children?.(error)}
    </FieldContext.Provider>
  );
};

export default Field;
