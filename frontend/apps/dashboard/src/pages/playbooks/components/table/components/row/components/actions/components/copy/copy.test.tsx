import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Copy, { type CopyHandler, type CopyProps } from './copy';
import playbookFixture from './copy.test.config';

describe('<Copy />', () => {
  const CopyWithButton = ({
    playbook = playbookFixture,
  }: Partial<CopyProps>) => {
    const ref = React.useRef<CopyHandler>(null);

    return (
      <>
        <button onClick={() => ref.current?.launch()} type="button">
          Open
        </button>
        <Copy ref={ref} playbook={playbook} />
      </>
    );
  };

  const renderCopy = async ({
    playbook = playbookFixture,
  }: Partial<CopyProps> = {}) => {
    customRender(<CopyWithButton playbook={playbook} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      const modal = screen.getByRole('dialog', { name: 'Copying playbook' });
      expect(modal).toBeInTheDocument();
    });
  };

  it('should initialize the name with the playbook name + (copy)', async () => {
    await renderCopy();

    const nameInput = screen.getByDisplayValue('People verification (copy)');
    expect(nameInput).toBeInTheDocument();
  });
});
