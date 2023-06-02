import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import FormLabel from '../label';
import InputAddon from '../input-addon';
import InputGroup from '../input-group';
import TextInput from '../text-input';
import FormControl, { FormControlProps } from './form-control';

export default {
  component: FormControl,
  title: 'Components/FormControl',
  argTypes: {},
} as Meta;

const Template: Story<FormControlProps> = () => {
  const [value, setValue] = useState<string>('');

  return (
    <FormControl>
      <FormLabel htmlFor="website">Website</FormLabel>
      <InputGroup>
        <InputAddon>https://</InputAddon>
        <TextInput
          id="website"
          onChangeText={setValue}
          placeholder="Website"
          value={value}
        />
      </InputGroup>
    </FormControl>
  );
};

export const Base = Template.bind({});
Base.args = {};
