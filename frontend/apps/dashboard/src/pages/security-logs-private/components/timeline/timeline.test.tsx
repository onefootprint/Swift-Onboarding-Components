import { customRender, screen } from '@onefootprint/test-utils';
import Timeline from './timeline';
import { accessEventsFixture } from './timeline.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Timeline />', () => {
  it('shows empty state when no events', () => {
    customRender(<Timeline accessEvents={[]} isLoading={false} />);
    const emptyText = screen.getByText('No items');
    expect(emptyText).toBeInTheDocument();
  });

  it('renders timeline when events exist', () => {
    customRender(<Timeline accessEvents={accessEventsFixture} isLoading={false} />);
    const emptyText = screen.queryByText('No items');
    expect(emptyText).not.toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    customRender(<Timeline accessEvents={[]} isLoading={true} />);
    const loading = screen.getByLabelText('Loading...');
    expect(loading).toBeInTheDocument();
  });
});
