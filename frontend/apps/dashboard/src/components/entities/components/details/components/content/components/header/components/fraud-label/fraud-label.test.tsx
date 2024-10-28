import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';

import { EntityLabel } from '@onefootprint/types';
import FraudLabel from './fraud-label';
import { entityIdFixture, withEditLabel, withLabel, withLabelError } from './fraud-label.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const renderFraudLabel = () => {
  customRender(<FraudLabel />);
};

const renderLabelAndWaitFinishLoading = async () => {
  renderFraudLabel();
  const dropdownTrigger = await screen.findByRole('button', { name: 'Add fraud label' });
  expect(dropdownTrigger).toBeInTheDocument();
};

describe('<FraudLabel />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/entities');
    mockRouter.query = {
      id: entityIdFixture,
    };
  });

  describe('when the label request fails', () => {
    it('should not render', async () => {
      withLabelError();
      renderFraudLabel();

      await waitFor(() => {
        const dropdownTrigger = screen.queryByRole('button', { name: 'Add fraud label' });
        expect(dropdownTrigger).not.toBeInTheDocument();
      });
    });
  });

  describe('when the label request succeeds', () => {
    it('should show add label text if there is no label', async () => {
      withLabel(null);
      await renderLabelAndWaitFinishLoading();

      const noLabelText = screen.getByText('Add fraud label');
      expect(noLabelText).toBeInTheDocument();
    });

    it('should show label if there is a label', async () => {
      withLabel(EntityLabel.offboard_fraud);
      await renderLabelAndWaitFinishLoading();

      const labelText = screen.getByText('Offboard (Fraud)');
      expect(labelText).toBeInTheDocument();
    });

    it('should add a label correctly', async () => {
      withLabel(null);
      withEditLabel();
      await renderLabelAndWaitFinishLoading();

      const dropdownTrigger = screen.getByRole('button', { name: 'Add fraud label' });
      await userEvent.click(dropdownTrigger);

      const dropdownItems = await screen.findAllByRole('menuitem');
      expect(dropdownItems).toHaveLength(3);
      const active = screen.getByRole('menuitem', { name: 'Active' });
      expect(active).toBeInTheDocument();
      const offboardFraud = screen.getByRole('menuitem', { name: 'Offboard (Fraud)' });
      expect(offboardFraud).toBeInTheDocument();
      const offboardOther = screen.getByRole('menuitem', { name: 'Offboard (Other)' });
      expect(offboardOther).toBeInTheDocument();

      await userEvent.click(offboardOther);

      expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
      const labelText = screen.getByText('Offboard (Other)');
      expect(labelText).toBeInTheDocument();
    });

    it('should edit a label correctly', async () => {
      withLabel(EntityLabel.active);
      withEditLabel();
      await renderLabelAndWaitFinishLoading();

      const dropdownTrigger = screen.getByRole('button', { name: 'Add fraud label' });
      await userEvent.click(dropdownTrigger);

      const dropdownItems = await screen.findAllByRole('menuitem');
      expect(dropdownItems).toHaveLength(4);

      const offboardFraud = screen.getByRole('menuitem', { name: 'Offboard (Fraud)' });
      await userEvent.click(offboardFraud);

      expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
      const labelText = screen.getByText('Offboard (Fraud)');
      expect(labelText).toBeInTheDocument();
    });

    it('should remove a label correctly', async () => {
      withLabel(EntityLabel.offboard_other);
      withEditLabel();
      await renderLabelAndWaitFinishLoading();

      const dropdownTrigger = screen.getByRole('button', { name: 'Add fraud label' });
      await userEvent.click(dropdownTrigger);

      const dropdownItems = await screen.findAllByRole('menuitem');
      expect(dropdownItems).toHaveLength(4);

      const removeLabel = screen.getByRole('menuitem', { name: 'Remove label' });
      expect(removeLabel).toBeInTheDocument();
      await userEvent.click(removeLabel);

      expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
      const noLabelText = screen.getByText('Add fraud label');
      expect(noLabelText).toBeInTheDocument();
    });
  });
});
