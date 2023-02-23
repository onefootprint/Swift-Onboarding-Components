import { Icon } from '@onefootprint/icons';
import {
  Box,
  Button,
  createFontStyles,
  TextArea,
  Typography,
} from '@onefootprint/ui';
import React, { useId } from 'react';
import styled, { css } from 'styled-components';

export type UploadFileProps = {
  label: string;
  cta: string;
  placeholder: string;
  iconComponent: Icon;
};

const UploadFile = ({
  iconComponent: IconComponent,
  label,
  cta,
  placeholder,
}: UploadFileProps) => {
  const id = useId();

  return (
    <Box>
      <Label htmlFor={id}>
        <IconComponent />
        {label}
      </Label>
      <Box
        sx={{
          backgroundColor: 'secondary',
          padding: 5,
          borderRadius: 'default',
        }}
      >
        <Button variant="secondary" size="compact" fullWidth>
          {cta}
        </Button>
        <Box sx={{ marginY: 3, display: 'flex', justifyContent: 'center' }}>
          <Typography color="quaternary" variant="body-4">
            or
          </Typography>
        </Box>
        <TextArea placeholder={placeholder} id={id} />
      </Box>
    </Box>
  );
};

const Label = styled.label`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    margin-bottom: ${theme.spacing[5]};
    display: flex;
    align-items: center;
  `}
`;

export default UploadFile;
