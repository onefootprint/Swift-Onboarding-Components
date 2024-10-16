import { customRender, screen } from '@onefootprint/test-utils';
import Content from './content';
import { sentilinkSignalFixture } from './content.test.config';

describe('<Content />', () => {
  it('renders both synthetic and ID theft scores when both are present', () => {
    customRender(<Content data={sentilinkSignalFixture} />);
    const syntheticTitle = screen.getByText('Synthetic score');
    expect(syntheticTitle).toBeInTheDocument();

    const idTheftTitle = screen.getByText('ID theft score');
    expect(idTheftTitle).toBeInTheDocument();
  });

  it('renders only synthetic score when ID theft data is not present', () => {
    const dataWithoutIdTheft = { ...sentilinkSignalFixture, idTheft: undefined };
    customRender(<Content data={dataWithoutIdTheft} />);

    const syntheticTitle = screen.getByText('Synthetic score');
    expect(syntheticTitle).toBeInTheDocument();

    const idTheftTitle = screen.queryByText('ID theft score');
    expect(idTheftTitle).not.toBeInTheDocument();
  });

  it('renders only ID theft score when synthetic data is not present', () => {
    const dataWithoutSynthetic = { ...sentilinkSignalFixture, synthetic: undefined };
    customRender(<Content data={dataWithoutSynthetic} />);

    const syntheticTitle = screen.queryByText('Synthetic score');
    expect(syntheticTitle).not.toBeInTheDocument();

    const idTheftTitle = screen.getByText('ID theft score');
    expect(idTheftTitle).toBeInTheDocument();
  });
});
