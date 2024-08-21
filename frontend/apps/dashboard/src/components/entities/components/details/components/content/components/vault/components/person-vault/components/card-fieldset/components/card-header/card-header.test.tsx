import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';

import type { CardHeaderProps } from './card-header';
import { CardHeader } from './card-header';
import defaultCard from './card-header.config';

const renderCardHeader = ({ cards, selectedCard, onChange }: CardHeaderProps) =>
  customRender(<CardHeader cards={cards} selectedCard={selectedCard} onChange={onChange} />);

describe('<CardHeader />', () => {
  describe('should display topCard properly', () => {
    it('should display topcard alias it exists', () => {
      const currentCard = {
        ...defaultCard,
        alias: 'Hayes',
        issuer: 'visa',
        number_last4: '1234',
      };

      renderCardHeader({
        cards: [currentCard],
        selectedCard: currentCard,
        onChange: () => undefined,
      });

      expect(screen.getByText('(Hayes)')).toBeInTheDocument();
    });

    it('should display topcard last 4 if it exists', () => {
      const currentCard = {
        ...defaultCard,
        alias: 'Hayes',
        issuer: 'visa',
        number_last4: '1234',
      };

      renderCardHeader({
        cards: [currentCard],
        selectedCard: currentCard,
        onChange: () => undefined,
      });

      expect(screen.getByText('••••1234')).toBeInTheDocument();
    });

    it('should display just for dots if no 4 provided for selected card', () => {
      const currentCard = {
        ...defaultCard,
        alias: 'Hayes',
        issuer: 'visa',
        number_last4: null,
      };

      renderCardHeader({
        cards: [currentCard],
        selectedCard: currentCard,
        onChange: () => undefined,
      });

      expect(screen.getByText('••••')).toBeInTheDocument();
    });
  });

  describe('should display dropdown as expected', () => {
    it('should display other cards provided', async () => {
      const firstCard = { ...defaultCard, alias: 'Hayes', issuer: 'visa' };

      renderCardHeader({
        cards: [
          firstCard,
          { ...defaultCard, alias: 'Nopa', issuer: 'mastercard' },
          { ...defaultCard, alias: 'Haight-Ashbury', issuer: 'discover' },
        ],
        selectedCard: firstCard,
        onChange: () => undefined,
      });

      const dropdownTrigger = screen.getByLabelText('Open card options');
      await userEvent.click(dropdownTrigger);

      await waitFor(() => {
        expect(screen.getByText('Nopa')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Haight-Ashbury')).toBeInTheDocument();
      });
    });

    it('should display last4 on dropdown element', async () => {
      const firstCard = {
        ...defaultCard,
        alias: 'Hayes',
        issuer: 'visa',
        number_last4: null,
      };

      renderCardHeader({
        cards: [
          firstCard,
          {
            ...defaultCard,
            alias: 'Nopa',
            issuer: 'mastercard',
            number_last4: '1234',
          },
          {
            ...defaultCard,
            alias: 'Haight',
            issuer: 'discover',
            number_last4: null,
          },
        ],
        selectedCard: firstCard,
        onChange: () => undefined,
      });

      const dropdownTrigger = screen.getByLabelText('Open card options');
      await userEvent.click(dropdownTrigger);

      await waitFor(() => {
        expect(screen.getByText('••••1234')).toBeInTheDocument();
      });
    });
  });
});
