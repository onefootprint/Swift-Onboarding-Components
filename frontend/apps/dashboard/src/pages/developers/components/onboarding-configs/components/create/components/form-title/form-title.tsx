import { Typography } from '@onefootprint/ui';
import React from 'react';

type FormTitleProps = {
  title: string;
  description: string;
};

const FormTitle = ({ title, description }: FormTitleProps) => (
  <>
    <Typography variant="label-2" sx={{ marginBottom: 1 }} as="h2">
      {title}
    </Typography>
    <Typography color="secondary" sx={{ marginBottom: 6 }} variant="body-3">
      {description}
    </Typography>
  </>
);

export default FormTitle;
