import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';

import type { SessionSelectProps } from './session-select';
import SessionSelect from './session-select';
import {
  driversLicenseDoc1,
  driversLicenseDoc2,
  driversLicenseDoc3,
  driversLicenseDoc4,
  driversLicenseViaApi,
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
      documents: [driversLicenseDoc1, driversLicenseDoc2, driversLicenseDoc3, driversLicenseDoc4],
      activeDocumentVersion: '4',
      onActiveDocumentVersionChange: jest.fn(),
    });
    const select = screen.getByRole('button');
    expect(screen.getByText('Session 4 (7/26/23, 12:00 AM)')).toBeInTheDocument();
    await userEvent.click(select);
    await waitFor(() => {
      expect(screen.getByText('Session 3 (7/25/23, 12:00 AM)')).toBeInTheDocument();
    });
    expect(screen.getByText('Session 2 (7/24/23, 12:00 AM)')).toBeInTheDocument();
    expect(screen.getByText('Session 1 (7/23/23, 12:00 AM)')).toBeInTheDocument();
  });

  it('should display nothing when there are no sessions', async () => {
    renderSessionSelector({
      documents: [],
      activeDocumentVersion: '1',
      onActiveDocumentVersionChange: jest.fn(),
    });
    expect(screen.queryByText('Session 1')).not.toBeInTheDocument();
  });

  it('should display nothing when there is only an API sesson', async () => {
    renderSessionSelector({
      documents: [driversLicenseViaApi],
      activeDocumentVersion: '1',
      onActiveDocumentVersionChange: jest.fn(),
    });
    expect(screen.queryByText('Session 1')).not.toBeInTheDocument();
  });
});
