import { fn } from '@onefootprint/storybook-utils';
import type { Meta, StoryFn } from '@storybook/react';
import NewBusinessIntroduction, { type NewBusinessIntroductionProps } from './new-business-introduction';

const Template: StoryFn<NewBusinessIntroductionProps> = ({ onDone }) => {
  return <NewBusinessIntroduction onDone={onDone} />;
};

export default {
  component: NewBusinessIntroduction,
  title: 'NewBusinessIntroduction',
  args: {
    onDone: fn(),
  },
} satisfies Meta<typeof NewBusinessIntroduction>;

export const Basic: StoryFn = () => <Template onDone={console.log} />;
