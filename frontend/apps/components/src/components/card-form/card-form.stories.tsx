import { Meta, Story } from '@storybook/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import CardForm from './card-form';

export default {
  component: CardForm,
  title: 'Components/CardForm',
  argTypes: {},
} as Meta;

const Template: Story<{}> = () => {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <form>
        <CardForm />
      </form>
    </FormProvider>
  );
};

export const Base = Template.bind({});
Base.args = {};
