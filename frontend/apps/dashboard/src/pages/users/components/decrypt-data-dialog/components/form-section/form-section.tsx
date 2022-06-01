import React from 'react';
import { Box, Typography } from 'ui';

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

const FormSection = ({ title, children }: FormSectionProps) => (
  <Box>
    <Typography color="primary" variant="label-2" sx={{ marginBottom: 4 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

export default FormSection;
