import { IcoSparkles16 } from '@onefootprint/icons';
import { Button, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';

import styled, { css } from 'styled-components';

import ContactDialog from 'src/components/contact-dialog';
import Penguin from './components/penguin/penguin';

type BannerProps = {
  children: React.ReactNode;
  title: string;
  cta: string;
};

const Banner = ({ children, cta, title }: BannerProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleClose = () => {
    setShowDialog(false);
  };

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  return (
    <Container direction="column" gap={5}>
      <Stack direction="row" align="center" gap={3}>
        <IcoSparkles16 />
        <Text variant="label-2">{title}</Text>
      </Stack>
      {children}
      <Button onClick={handleOpenDialog} type="button">
        {cta}
      </Button>
      <ContactDialog open={showDialog} onClose={handleClose} />
      <PenguinContainer>
        <Penguin />
      </PenguinContainer>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    background-color: #edf3fc;
    padding: ${theme.spacing[7]};
    padding-right: ${theme.spacing[8]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    height: fit-content;
    margin-top: ${theme.spacing[5]};

    && {
      p {
        margin: 0;
      }
    }

    button {
      width: fit-content;
    }
  `}
`;

const PenguinContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    bottom: -${theme.spacing[3]};
    right: ${theme.spacing[8]};
  `}
`;

export default Banner;
