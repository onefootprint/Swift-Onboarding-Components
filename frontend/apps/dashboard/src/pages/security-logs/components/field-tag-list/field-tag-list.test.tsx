import { customRender, screen } from '@onefootprint/test-utils';

import type { FieldTagListProps } from './field-tag-list';
import FieldTagList from './field-tag-list';

const renderFieldTagList = ({ targets }: FieldTagListProps) => {
  customRender(<FieldTagList targets={targets} />);
};

describe('FieldTagList', () => {
  describe('should display card DI properly', () => {
    it('should show two DIs as expected', () => {
      renderFieldTagList({
        targets: ['card.flerp.name', 'card.flerp.number'],
      });

      expect(screen.getByText('Card number')).toBeInTheDocument();
      expect(screen.getByText('Name on card')).toBeInTheDocument();
    });

    it('should display single DI as expected', () => {
      renderFieldTagList({
        targets: ['card.flerp.cvc'],
      });

      expect(screen.getByText('Card security code (CVC)')).toBeInTheDocument();
    });

    it('should display DIs from two cards as expected', () => {
      renderFieldTagList({
        targets: ['card.flerp.cvc', 'card.blurp.expiration'],
      });

      expect(screen.getByText('Card security code (CVC)')).toBeInTheDocument();
      expect(screen.getByText('Card expiration')).toBeInTheDocument();
    });
  });
});
