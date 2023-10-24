import { Grid, ScrollArea, Shimmer, Stack } from '@onefootprint/ui';
import React from 'react';

import Container from '../container';

const Loading = () => (
  <Container
    header={
      <>
        <CloseButton />
        <Title />
      </>
    }
    footer={
      <Stack justify="end" align="center" width="100%">
        <Stack direction="row" gap={4} position="relative" overflow="hidden">
          <Button />
          <Button />
        </Stack>
      </Stack>
    }
  >
    <div style={{ flexGrow: 1 }}>
      <ScrollArea>
        <Grid.Container rowGap={5}>
          <SectionTitle />
          <Grid.Container templateAreas={['number number', 'date cvc']} gap={5}>
            <Grid.Item gridArea="number">
              <Label />
              <CardNumberInput />
            </Grid.Item>
            <Grid.Item gridArea="date">
              <Label />
              <CardExpDateInput />
            </Grid.Item>
            <Grid.Item gridArea="cvc">
              <Label />
              <CardCvc />
            </Grid.Item>
          </Grid.Container>
        </Grid.Container>
      </ScrollArea>
    </div>
  </Container>
);

const CloseButton = () => (
  <Shimmer
    sx={{ width: '30px', height: '30px', position: 'absolute', left: '20px' }}
  />
);

const Title = () => <Shimmer sx={{ width: '120px', height: '25px' }} />;

const SectionTitle = () => (
  <Shimmer sx={{ width: '120px', height: '25px', marginBottom: 4 }} />
);

const Label = () => (
  <Shimmer sx={{ width: '70px', height: '20px', marginBottom: 3 }} />
);

const CardNumberInput = () => (
  <Shimmer sx={{ width: '100%', height: '40px' }} />
);

const CardExpDateInput = () => (
  <Shimmer sx={{ width: '100%', height: '40px' }} />
);

const CardCvc = () => <Shimmer sx={{ width: '100%', height: '40px' }} />;

const Button = () => <Shimmer sx={{ width: '100px', height: '40px' }} />;

export default Loading;
