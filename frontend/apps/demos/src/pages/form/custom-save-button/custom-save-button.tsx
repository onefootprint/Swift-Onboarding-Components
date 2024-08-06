import type { FootprintFormRef } from '@onefootprint/footprint-js';
import { Box, Button, Stack } from '@onefootprint/ui';
import { useRef } from 'react';
import styled, { css } from 'styled-components';

import useFootprintForm from '../hooks/use-footprint-form';

const CustomSaveButton = () => {
  const buttonRef = useRef<FootprintFormRef>();

  useFootprintForm({
    containerId: 'my-form',
    variant: 'inline',
    options: {
      hideFootprintLogo: true,
      hideButtons: true,
    },
    getRef(ref: FootprintFormRef) {
      buttonRef.current = ref;
    },
  });

  const handleSave = async () => {
    try {
      await buttonRef.current?.save();
      // eslint-disable-next-line no-alert
      alert('success');
    } catch (_e) {
      // eslint-disable-next-line no-alert
      alert('error');
    }
  };

  return (
    <Stack direction="column" width="500px">
      <Form id="my-form" />
      <Box padding={1}>
        <Button size="compact" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Stack>
  );
};

const Form = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]};
    width: 500px;
    min-width: 500px;
    height: 650px;
    min-height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

export default CustomSaveButton;
