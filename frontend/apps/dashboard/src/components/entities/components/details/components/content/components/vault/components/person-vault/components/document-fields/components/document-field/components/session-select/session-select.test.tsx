import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import type { SessionSelectProps } from './session-select';
import SessionSelect from './session-select';
import {
  driversLicenseDoc1,
  driversLicenseDoc2,
  driversLicenseDoc3,
  driversLicenseDoc4,
} from './session-select.test.config';

const renderSessionSelector = ({
  documents,
  activeDocumentVersion,
  onActiveDocumentVersionChange,
}: SessionSelectProps) =>
  customRender(
    <SessionSelect
      documents={documents}
      activeDocumentVersion={activeDocumentVersion}
      onActiveDocumentVersionChange={onActiveDocumentVersionChange}
    />,
  );

describe('<SessionSelector />', () => {
  it('should display all document sessions correctly', async () => {
    renderSessionSelector({
      documents: [
        driversLicenseDoc1,
        driversLicenseDoc2,
        driversLicenseDoc3,
        driversLicenseDoc4,
      ],
      activeDocumentVersion: '1',
      onActiveDocumentVersionChange: jest.fn(),
    });
    const select = screen.getByRole('button');
    expect(screen.getByText('Session 1 (07/23/2023)')).toBeInTheDocument();
    await userEvent.click(select);
    await waitFor(() => {
      expect(screen.getByText('Session 2 (07/24/2023)')).toBeInTheDocument();
    });
    expect(screen.getByText('Session 3 (07/25/2023)')).toBeInTheDocument();
    expect(screen.getByText('Session 4 (07/26/2023)')).toBeInTheDocument();
  });
});
