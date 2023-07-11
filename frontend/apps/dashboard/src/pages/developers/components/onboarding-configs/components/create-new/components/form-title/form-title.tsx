import styled from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type FormTitleProps = {
  title: string;
  description: string;
};

const FormTitle = ({ title, description }: FormTitleProps) => (
  <Container>
    <Typography variant="label-2" sx={{ marginBottom: 1 }} as="h2">
      {title}
    </Typography>
    <Typography color="secondary" variant="body-3">
      {description}
    </Typography>
  </Container>
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default FormTitle;
