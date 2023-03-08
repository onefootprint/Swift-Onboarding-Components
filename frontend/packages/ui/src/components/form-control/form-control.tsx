import React from 'react';

import Box from '../box';

export type FormControlProps = {
  // isDisabled?: boolean;
  // isInvalid?: boolean;
  // isReadOnly?: boolean;
  // isRequired?: boolean;
  children: JSX.Element | JSX.Element[];
};

const FormControl = ({ children }: FormControlProps) => <Box>{children}</Box>;

export default FormControl;
