import { getPrivateBusinessOwnerKycLink } from '@onefootprint/fixtures/dashboard';
import type { PrivateBusinessOwnerKycLink } from '@onefootprint/request-types/dashboard';
import { expect, userEvent, within } from '@onefootprint/storybook-utils';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import AwaitingBosEvent from './awaiting-bos-event';

const meta: Meta<typeof AwaitingBosEvent> = {
  component: AwaitingBosEvent,
  title: 'AwaitingBosEvent',
  args: {
    fpId: 'fp_bid_test_KyqHsSFpKTajkP0BxBJToE',
  },
  parameters: {
    msw: {
      handlers: {
        kycLinks: http.post<never, PrivateBusinessOwnerKycLink[]>(
          'https://api.dev.onefootprint.com/entities/fp_bid_test_KyqHsSFpKTajkP0BxBJToE/business_owners/kyc_links',
          async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
            return HttpResponse.json([
              getPrivateBusinessOwnerKycLink({
                id: 'bo_LCG6lhG5P44H4RrXffoxlA',
                name: 'Jane D.',
                link: 'http://hosted.onefootprint.com?type=bo&r=713#botok_zCHOLmqnX97FlggJa1IUQVxPxRAwo4twad',
              }),
              getPrivateBusinessOwnerKycLink({
                id: 'bo_KDH7miH6Q55I5SsYggpymB',
                name: 'John S.',
                link: 'http://hosted.onefootprint.com?type=bo&r=714#botok_aDIPMnroY98GmhhKb2JVRWyQySBxp5uxbe',
              }),
            ]);
          },
        ),
      },
    },
  },
};

type Story = StoryObj<typeof AwaitingBosEvent>;

export const SendLinkViaSmsAndEmail: Story = {
  play: async () => {
    const screen = within(document.body);

    const triggerButton = screen.getByRole('button', {
      name: 'Resend KYC link',
    });
    await userEvent.click(triggerButton);

    const submitButton = await screen.findByRole('button', {
      name: 'Send via SMS and Email',
    });
    await userEvent.click(submitButton);

    const confirmation = await screen.findByText('KYC links sent');
    expect(confirmation).toBeInTheDocument();
  },
};

export const CopyKycLink: Story = {
  play: async () => {
    const screen = within(document.body);

    const triggerButton = screen.getByRole('button', {
      name: 'Resend KYC link',
    });
    await userEvent.click(triggerButton);

    const [copyButton] = await screen.findAllByRole('button', {
      name: 'Copy KYC link',
    });
    await userEvent.click(copyButton);

    const copiedConfirmation = await screen.findByText('Copied!');
    expect(copiedConfirmation).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);
  },
};

export const FormWithError: Story = {
  play: async () => {
    const screen = within(document.body);

    const triggerButton = screen.getByRole('button', {
      name: 'Resend KYC link',
    });
    await userEvent.click(triggerButton);

    const firstOption = await screen.findByRole('checkbox', { name: 'Jane D.' });
    await userEvent.click(firstOption);

    const secondOption = await screen.findByRole('checkbox', { name: 'John S.' });
    await userEvent.click(secondOption);

    const submitButton = await screen.findByRole('button', {
      name: 'Send via SMS and Email',
    });
    await userEvent.click(submitButton);

    const errorMessage = await screen.findByRole('Please select at least one beneficial owner');
    expect(errorMessage).toBeInTheDocument();
  },
};

export default meta;
