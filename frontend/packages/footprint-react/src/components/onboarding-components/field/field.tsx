/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { HTMLAttributes } from 'react';
import React, { useId, useMemo } from 'react';

import type { Di } from '../../../@types';
import FieldContext from '../field-context';

export type FieldProps = {
  name: keyof Di;
  children?: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const Field = ({ name, className, children, ...props }: FieldProps) => {
  const id = useId();
  const contextValues = useMemo(() => ({ name, id }), [name, id]);

  return (
    <FieldContext.Provider value={contextValues}>
      <div className={cx('fp-field', className)} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  );
};

export default Field;
