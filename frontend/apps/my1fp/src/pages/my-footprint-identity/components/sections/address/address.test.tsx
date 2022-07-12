import React from 'react';
import { useStore } from 'src/hooks/use-session-user';
import { customRender, screen } from 'test-utils';

import Address from './address';
import createAddressLine from './utils/create-address-line/create-address-line';

const originalState = useStore.getState();

describe('<Address />', () => {
  const renderAddress = () => customRender(<Address />);

  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('when all the values are filled', () => {
    const data = {
      streetAddress: '413 Missouri Street',
      streetAddress2: 'Apt 104',
      city: 'San Francisco',
      zip: '94107',
      state: 'CA',
      country: 'US',
    };

    beforeEach(() => {
      useStore.setState({
        data,
      });
    });

    it('should render the correct first address line', () => {
      renderAddress();
      expect(
        screen.getByText(
          createAddressLine([data.streetAddress, data.streetAddress2]),
        ),
      ).toBeInTheDocument();
    });

    it('should render the correct second address line', () => {
      renderAddress();
      expect(
        screen.getByText(
          createAddressLine([data.city, data.state, data.zip, data.country]),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('when there are missing values', () => {
    const data = {
      streetAddress: '413 Missouri Street',
      streetAddress2: null,
      city: 'San Francisco',
      zip: '94107',
      state: null,
      country: 'US',
    };

    beforeEach(() => {
      useStore.setState({
        data,
      });
    });

    it('should render the correct first address line', () => {
      renderAddress();
      expect(screen.getByText('413 Missouri Street')).toBeInTheDocument();
    });

    it('should render the correct second address line', () => {
      renderAddress();
      expect(screen.getByText('San Francisco, 94107, US')).toBeInTheDocument();
    });
  });
});
