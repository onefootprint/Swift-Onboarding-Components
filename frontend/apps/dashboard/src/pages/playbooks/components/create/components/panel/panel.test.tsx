import { customRender, screen } from '@onefootprint/test-utils';
import Panel, { type PanelProps } from './panel';

const defaultProps: PanelProps = {
  children: <div>Child content</div>,
  title: 'Title text',
};

const renderPanel = (props: Partial<PanelProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return customRender(<Panel {...combinedProps} />);
};

describe('<Panel />', () => {
  it('should render the title', () => {
    renderPanel({ title: 'Investor profile questions' });

    const title = screen.getByText('Investor profile questions');
    expect(title).toBeInTheDocument();
  });

  it('should render the children', () => {
    renderPanel({ children: <div>Child content</div> });

    const children = screen.getByText('Child content');
    expect(children).toBeInTheDocument();
  });

  it('should render the cta', () => {
    renderPanel({ cta: <button type="button">Button</button> });

    const button = screen.getByRole('button', { name: 'Button' });
    expect(button).toBeInTheDocument();
  });
});
