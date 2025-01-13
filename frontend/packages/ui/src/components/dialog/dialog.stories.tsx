import type { Meta, StoryFn } from '@storybook/react';
import { uniqueId } from 'lodash';
import { useState } from 'react';
import Button from '../button';
import type { DialogProps } from './dialog';
import Dialog from './dialog';

export default {
  component: Dialog,
  title: 'Components/Dialog',
  argTypes: {
    title: { control: 'text' },
    onClose: { action: 'onClose' },
    children: { control: 'text' },
    open: { control: 'boolean' },
    size: { control: 'select', options: ['default', 'compact', 'full-screen'] },
    primaryButton: { control: 'object' },
    secondaryButton: { control: 'object' },
    linkButton: { control: 'object' },
    isConfirmation: { control: 'boolean' },
    preventEscapeKeyDown: { control: 'boolean' },
  },
} satisfies Meta<typeof Dialog>;

const Template: StoryFn<DialogProps> = args => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    args.onClose?.();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Dialog {...args} open={open} onClose={handleClose}>
        {args.children}
      </Dialog>
      {!open && <Button onClick={handleOpen}>Open Dialog</Button>}
    </>
  );
};

export const Base = Template.bind({});
Base.args = {
  children: 'Content',
  open: true,
  size: 'default',
  title: 'Title',
  isConfirmation: false,
};

export const OnlyPrimary = Template.bind({});
OnlyPrimary.args = {
  ...Base.args,
  primaryButton: { label: 'Primary', onClick: () => alert('Primary clicked') },
};

export const PrimaryAndSecondary = Template.bind({});
PrimaryAndSecondary.args = {
  ...Base.args,
  primaryButton: { label: 'Primary', onClick: () => alert('Primary clicked') },
  secondaryButton: { label: 'Secondary', onClick: () => alert('Secondary clicked') },
};

export const PrimarySecondaryAndLink = Template.bind({});
PrimarySecondaryAndLink.args = {
  ...Base.args,
  primaryButton: { label: 'Primary', onClick: () => alert('Primary clicked') },
  secondaryButton: { label: 'Secondary', onClick: () => alert('Secondary clicked') },
  linkButton: { label: 'Link button', onClick: () => alert('Link clicked') },
};

export const Confirmation: StoryFn<DialogProps> = args => {
  const [regularOpen, setRegularOpen] = useState(true);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const handleRegularClose = () => setRegularOpen(false);
  const handleConfirmationClose = () => setConfirmationOpen(false);
  const openConfirmation = () => setConfirmationOpen(true);
  const openRegular = () => setRegularOpen(true);

  return (
    <>
      <Dialog
        {...args}
        open={regularOpen}
        onClose={handleRegularClose}
        primaryButton={{ label: 'Open Confirmation', onClick: openConfirmation }}
        secondaryButton={{ label: 'Also Open Confirmation', onClick: openConfirmation }}
      >
        <p className="text-body-3">This is the regular dialog. Click a button to open the confirmation dialog.</p>
      </Dialog>
      <Dialog
        {...args}
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        isConfirmation={true}
        title="Confirmation"
        primaryButton={{
          label: 'Confirm',
          onClick: () => {
            alert('Confirmed');
            handleConfirmationClose();
          },
        }}
        secondaryButton={{ label: 'Cancel', onClick: handleConfirmationClose }}
      >
        <p className="text-body-3">Are you sure you want to proceed?</p>
      </Dialog>
      {!regularOpen && <Button onClick={openRegular}>Open Regular Dialog</Button>}
    </>
  );
};

export const FullScreen = Template.bind({});
FullScreen.args = {
  ...Base.args,
  children: (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 100 }, (_, i) => (
        <p key={uniqueId()} className="text-body-3">
          Dialog with overflowing content. Item {i + 1}
        </p>
      ))}
    </div>
  ),
  primaryButton: { label: 'Continue', onClick: () => alert('Continue') },
  secondaryButton: { label: 'Cancel', onClick: () => alert('Cancelled') },
  size: 'full-screen',
};

export const FullScreenOneButton = Template.bind({});
FullScreenOneButton.args = {
  ...Base.args,
  primaryButton: { label: 'Continue', onClick: () => alert('Continue') },
  size: 'full-screen',
};

export const FullScreenNoScrollNoPadding = Template.bind({});
FullScreenNoScrollNoPadding.args = {
  title: 'Full Screen',
  primaryButton: { label: 'Continue', onClick: () => alert('Continue') },
  secondaryButton: { label: 'Cancel', onClick: () => alert('Cancelled') },
  size: 'full-screen',
  noPadding: true,
  noScroll: true,
  children: <img src="https://picsum.photos/seed/picsum/200/300" aria-label="Random image" />,
};

export const OverflowingContent = Template.bind({});
OverflowingContent.args = {
  ...Base.args,
  open: true,
  title:
    'Irure velit ea non id aute exercitation in. Magna elit enim esse. Minim amet non reprehenderit duis ea amet commodo culpa. Tempor nisi ullamco pariatur ullamco ipsum excepteur. Magna aliquip deserunt reprehenderit ullamco ipsum aliqua sit consequat commodo. Proident ex cupidatat ipsum in ipsum.',
  size: 'default',
  children: (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 100 }, (_, i) => (
        <p key={uniqueId()} className="text-body-3">
          Dialog with overflowing content. Item {i + 1}
        </p>
      ))}
    </div>
  ),
};

export const OverflowingContentWithFooter = Template.bind({});
OverflowingContentWithFooter.args = {
  ...OverflowingContent.args,
  primaryButton: { label: 'Continue', onClick: () => alert('Continue') },
  secondaryButton: { label: 'Cancel', onClick: () => alert('Cancelled') },
};
