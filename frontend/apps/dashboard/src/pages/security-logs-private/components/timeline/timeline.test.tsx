import { customRender, screen } from '@onefootprint/test-utils';
import Timeline from './timeline';
import { accessEventsFixture } from './timeline.test.config';

describe('<Timeline />', () => {
  it('shows empty state when no events', () => {
    customRender(<Timeline accessEvents={[]} />);
    const emptyText = screen.getByText('No items');
    expect(emptyText).toBeInTheDocument();
  });

  it('renders timeline when events exist', () => {
    customRender(<Timeline accessEvents={accessEventsFixture} />);
    const emptyText = screen.queryByText('No items');
    expect(emptyText).not.toBeInTheDocument();
  });
});
