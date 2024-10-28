import { customRender, screen } from '@onefootprint/test-utils';
import InsightEventDisplay from './insight-event-display';
import { emptyInsightEvent, insightEventFixture, partialInsightEvent } from './insight-event-display.test.config';

describe('<InsightEvent />', () => {
  it('renders all labels', () => {
    customRender(<InsightEventDisplay insightEvent={insightEventFixture} />);

    const userInsights = screen.getByText('User insights');
    expect(userInsights).toBeInTheDocument();
    const region = screen.getByText('Region');
    expect(region).toBeInTheDocument();
    const country = screen.getByText('Country');
    expect(country).toBeInTheDocument();
    const zipCode = screen.getByText('Zip code');
    expect(zipCode).toBeInTheDocument();
    const ipAddress = screen.getByText('IP address');
    expect(ipAddress).toBeInTheDocument();
    const deviceOS = screen.getByText('Device/OS');
    expect(deviceOS).toBeInTheDocument();
  });

  it('renders all values when provided', () => {
    customRender(<InsightEventDisplay insightEvent={insightEventFixture} />);

    const region = screen.getByText('California');
    expect(region).toBeInTheDocument();
    const country = screen.getByText('United States');
    expect(country).toBeInTheDocument();
    const zipCode = screen.getByText('94105');
    expect(zipCode).toBeInTheDocument();
    const ipAddress = screen.getByText('192.168.1.1');
    expect(ipAddress).toBeInTheDocument();
    const userAgent = screen.getByText(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );
    expect(userAgent).toBeInTheDocument();
  });

  it('renders dashes when no values are provided', () => {
    customRender(<InsightEventDisplay insightEvent={emptyInsightEvent} />);

    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(5);
  });

  it('renders some dashes when some values are missing', () => {
    customRender(<InsightEventDisplay insightEvent={partialInsightEvent} />);

    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(3);
    const ipAddress = screen.getByText('192.168.1.1');
    expect(ipAddress).toBeInTheDocument();
    const userAgent = screen.getByText(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );
    expect(userAgent).toBeInTheDocument();
  });

  it('renders dashes when insightEvent is undefined', () => {
    customRender(<InsightEventDisplay insightEvent={undefined} />);

    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(5);
  });
});
