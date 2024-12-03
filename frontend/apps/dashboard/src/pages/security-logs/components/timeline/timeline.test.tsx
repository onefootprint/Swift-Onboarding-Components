import { getAuditEvent } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import Timeline from './timeline';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Timeline />', () => {
  it('shows empty state when no events', () => {
    customRender(<Timeline auditEvents={[]} isLoading={false} showDecryptionReason isError={false} />);
    const emptyText = screen.getByText('No items');
    expect(emptyText).toBeInTheDocument();
  });

  it('renders timeline when events exist', () => {
    customRender(<Timeline auditEvents={[getAuditEvent({})]} isLoading={false} showDecryptionReason isError={false} />);
    const emptyText = screen.queryByText('No items');
    expect(emptyText).not.toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    customRender(<Timeline auditEvents={[]} isLoading={true} showDecryptionReason isError={false} />);
    const loading = screen.getByLabelText('Loading...');
    expect(loading).toBeInTheDocument();
  });

  it('shows error state when error', () => {
    customRender(<Timeline auditEvents={[]} isLoading={false} showDecryptionReason isError={true} />);
    const error = screen.getByText('An error occurred while fetching data.');
    expect(error).toBeInTheDocument();
  });
});
