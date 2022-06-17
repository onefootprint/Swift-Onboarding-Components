import { Meta, Story } from '@storybook/react';
import React from 'react';

import FootprintLogo from './footprint-logo';

export default {
  component: FootprintLogo,
  title: 'Components/FootprintLogo',
} as Meta;

const Template: Story<{}> = () => <FootprintLogo />;

export const Base = Template.bind({});
Base.args = {};
