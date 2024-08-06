import { customRender, screen } from '@onefootprint/test-utils';

import Section from './section';

describe('<Section />', () => {
  it('should render the title', () => {
    customRender(<Section title="Risk signals">Lorem</Section>);
    expect(screen.getByText('Risk signals')).toBeInTheDocument();
  });

  it('should render the content', () => {
    customRender(<Section title="Risk signals">Lorem</Section>);
    expect(screen.getByText('Lorem')).toBeInTheDocument();
  });
});
