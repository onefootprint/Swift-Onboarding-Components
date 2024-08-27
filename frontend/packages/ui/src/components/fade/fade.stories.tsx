import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import Button from '../button';
import Fade from './fade';

export default {
  title: 'Components/Fade',
  argTypes: {
    from: {
      control: {
        type: 'select',
        options: ['left', 'right', 'top', 'bottom', 'center'],
      },
    },
    to: {
      control: {
        type: 'select',
        options: ['left', 'right', 'top', 'bottom', 'center'],
      },
    },
  },
} as Meta;

const Template: StoryFn = ({ from, to, onClick }) => {
  const [isVisible, setisVisible] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Button onClick={() => setisVisible(!isVisible)}>Trigger</Button>
      <Fade isVisible={isVisible} from={from} to={to} onClick={onClick}>
        <div
          style={{
            backgroundColor: 'red',
            width: 200,
            height: 200,
            marginTop: 8,
            borderRadius: '6px',
          }}
        />
      </Fade>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  from: 'left',
  to: 'right',
  onClick: () => alert('I was clicked'), // eslint-disable-line no-alert
};
