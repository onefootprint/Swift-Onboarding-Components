import React from 'react';
import { Typography } from 'ui';

type FormTitleProps = {
  title: string;
  description: string;
  error?: string;
};

const FormTitle = ({ title, description, error }: FormTitleProps) => {
  const hasError = !!error;

  return (
    <>
      <Typography variant="label-2" sx={{ marginBottom: 1 }} as="h2">
        {title}
      </Typography>
      <Typography
        color="secondary"
        sx={{ marginBottom: hasError ? 3 : 6 }}
        variant="body-3"
      >
        {description}
      </Typography>
      {hasError && (
        <Typography color="error" variant="caption-1" sx={{ marginBottom: 6 }}>
          {error}
        </Typography>
      )}
    </>
  );
};

export default FormTitle;
