import { Meta, Story } from '@storybook/react';
import React from 'react';

import FootprintFooter from './footprint-footer';

export default {
  component: FootprintFooter,
  title: 'Components/FootprintFooter',
} as Meta;

const Template: Story<{}> = () => <FootprintFooter />;

export const Base = Template.bind({});
Base.args = {};
