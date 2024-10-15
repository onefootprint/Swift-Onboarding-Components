import { customRender, screen } from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';
import StreetViewDialog from './street-view-dialog';

// Mock the useInitializeStreetView hook to avoid complexity
jest.mock('./utils/use-initialize-street-view', () => ({
  __esModule: true,
  default: () => ({
    isSuccess: true,
    data: { latitude: 40.7128, longitude: -74.006 },
  }),
}));

describe('<StreetViewDialog />', () => {
  const mockAddressValues: Partial<Record<IdDI, string>> = {
    [IdDI.addressLine1]: '123 Main St',
    [IdDI.addressLine2]: 'Apt 4B',
    [IdDI.city]: 'New York',
    [IdDI.state]: 'NY',
    [IdDI.zip]: '10001',
  };

  it('formats the address correctly in the card', () => {
    customRender(<StreetViewDialog open={true} onClose={jest.fn()} addressValues={mockAddressValues} />);

    const addressLine1Element = screen.getByText('123 Main St Apt 4B');
    expect(addressLine1Element).toBeInTheDocument();

    const cityStateZipElement = screen.getByText('New York, NY 10001');
    expect(cityStateZipElement).toBeInTheDocument();
  });

  it('handles missing address fields gracefully', () => {
    const incompleteAddressValues: Partial<Record<IdDI, string>> = {
      [IdDI.addressLine1]: '456 Elm St',
      [IdDI.city]: 'Chicago',
      [IdDI.state]: 'IL',
    };

    customRender(<StreetViewDialog open={true} onClose={jest.fn()} addressValues={incompleteAddressValues} />);

    const addressLine1Element = screen.getByText('456 Elm St');
    expect(addressLine1Element).toBeInTheDocument();

    const cityStateElement = screen.getByText('Chicago, IL');
    expect(cityStateElement).toBeInTheDocument();
  });
});
