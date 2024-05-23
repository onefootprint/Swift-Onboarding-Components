import React from 'react';

import Box from '../box';

export type FormFieldProps = {
  children: JSX.Element | JSX.Element[];
};

const FormField = ({ children }: FormFieldProps) => <Box>{children}</Box>;

export default FormField;
