import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import type { NameYourPlaybookWithContextProps } from './name-your-playbook.test.config';
import NameYourPlaybookWithContext from './name-your-playbook.test.config';

const renderNameYourPlaybook = ({ kind }: NameYourPlaybookWithContextProps) => {
  customRender(<NameYourPlaybookWithContext kind={kind} />);
};

describe('<NameYourPlaybook />', () => {
  it('should show error if no name provided', async () => {
    renderNameYourPlaybook({ kind: PlaybookKind.Kyb });
    const next = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(next);
    await waitFor(() => {
      expect(screen.getByText('Please name your Playbook')).toBeInTheDocument();
    });
  });
});
