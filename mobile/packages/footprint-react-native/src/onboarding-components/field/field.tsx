import { get } from 'lodash';
import React, { useId, useMemo } from 'react';
import type { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import type { FormValues } from '../../types';
import type { ChidrenOrFunction } from '../types/children';
import FieldContext from '../field-context';

type FieldOptions = {
  error: FieldError | Merge<FieldError, FieldErrorsImpl<FormValues>> | undefined;
};

export type FieldProps = {
  name: keyof FormValues;
  children?: ChidrenOrFunction<FieldOptions>;
};

const Field = ({ name, children }: FieldProps) => {
  const id = useId();
  const contextValues = useMemo(() => ({ name, id }), [name, id]);
  const {
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name);

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children({ error });
    }
    return children;
  };

  return <FieldContext.Provider value={contextValues}>{renderChildren()}</FieldContext.Provider>;
};

export default Field;
