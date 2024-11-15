import { getAuditEvent } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import Timeline from './timeline';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Timeline />', () => {
  it('shows empty state when no events', () => {
    customRender(<Timeline auditEvents={[]} isLoading={false} showDecryptionReason />);
    const emptyText = screen.getByText('No items');
    expect(emptyText).toBeInTheDocument();
  });

  it('renders timeline when events exist', () => {
    customRender(<Timeline auditEvents={[getAuditEvent({})]} isLoading={false} showDecryptionReason />);
    const emptyText = screen.queryByText('No items');
    expect(emptyText).not.toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    customRender(<Timeline auditEvents={[]} isLoading={true} showDecryptionReason />);
    const loading = screen.getByLabelText('Loading...');
    expect(loading).toBeInTheDocument();
  });
});
