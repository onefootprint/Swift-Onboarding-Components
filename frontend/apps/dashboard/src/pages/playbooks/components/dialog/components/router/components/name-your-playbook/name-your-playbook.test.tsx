import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import { Kind } from '@/playbooks/utils/machine/types';

import NameYourPlaybookWithContext, {
  NameYourPlaybookWithContextProps,
} from './name-your-playbook.test.config';

const renderNameYourPlaybook = ({ kind }: NameYourPlaybookWithContextProps) => {
  customRender(<NameYourPlaybookWithContext kind={kind} />);
};

describe('<NameYourPlaybook />', () => {
  it('should render "User ID verification" placeholder for KYC', () => {
    renderNameYourPlaybook({ kind: Kind.KYC });
    expect(
      screen.getByPlaceholderText('User ID verification'),
    ).toBeInTheDocument();
  });

  it('should render "Business verification" placeholder for KYB', () => {
    renderNameYourPlaybook({ kind: Kind.KYB });
    expect(
      screen.getByPlaceholderText('Business verification'),
    ).toBeInTheDocument();
  });

  it('should show error if no name provided', async () => {
    renderNameYourPlaybook({ kind: Kind.KYB });
    const next = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(next);
    await waitFor(() => {
      expect(screen.getByText('Please name your Playbook')).toBeInTheDocument();
    });
  });
});
