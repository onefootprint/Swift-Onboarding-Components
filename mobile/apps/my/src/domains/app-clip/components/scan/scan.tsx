import {
  IcoCar24,
  IcoIdCard24,
  IcoIdGeneric40,
  IcoPassport24,
} from '@onefootprint/icons';
import {
  Box,
  Button,
  Container,
  Divider,
  RadioSelect,
  Select,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';

const Scan = () => {
  const [value, setValue] = useState('front-and-back');

  return (
    <Container scroll>
      <Box center marginBottom={7} marginTop={8}>
        <IcoIdGeneric40 />
        <Typography variant="heading-3">We need a photo of your ID</Typography>
        <Typography variant="body-3">
          Select the option that works best for you
        </Typography>
      </Box>
      <Select label="Country" placeholder="Select country" value="lorem" />
      <Divider marginVertical={7} />
      <RadioSelect
        value={value}
        onChange={setValue}
        marginBottom={7}
        options={[
          {
            title: "Driver's license",
            description: 'Front & Back',
            value: 'front-and-back',
            IconComponent: IcoCar24,
          },
          {
            title: 'Passport',
            description: 'Photo page',
            value: '2',
            IconComponent: IcoIdCard24,
          },
          {
            title: 'State ID',
            description: 'Front & Back',
            value: '3',
            IconComponent: IcoPassport24,
          },
        ]}
      />
      <Button>Continue</Button>
    </Container>
  );
};

export default Scan;
