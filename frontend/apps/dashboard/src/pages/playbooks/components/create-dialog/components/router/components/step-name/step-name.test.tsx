import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { asAdminUser, resetUser } from 'src/config/tests';

import { PlaybookKind } from '@/playbooks/utils/machine/types';
import { defaultNameFormData } from '@/playbooks/utils/machine/types';

import Name, { StepNameProps } from './step-name';

const defaultProps: StepNameProps = {
  defaultValues: defaultNameFormData,
  meta: {
    kind: PlaybookKind.Kyc,
  },
  onBack: jest.fn(),
  onSubmit: jest.fn(),
};

const renderStepName = ({ meta, defaultValues, onBack, onSubmit }: StepNameProps = defaultProps) => {
  return customRender(<Name meta={meta} defaultValues={defaultValues} onBack={onBack} onSubmit={onSubmit} />);
};

describe('<Name />', () => {
  beforeEach(() => {
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  it('should set a default value with tenant name + kind of playbook', () => {
    renderStepName();

    const input = screen.getByLabelText('Playbook name') as HTMLInputElement;
    expect(input.value.startsWith('Acme KYC')).toBeTruthy();
  });

  describe('when there is a default value', () => {
    it('should show the default value in the input', () => {
      const defaultValues = {
        name: 'My default name',
      };
      renderStepName({ ...defaultProps, defaultValues });

      const input = screen.getByLabelText('Playbook name') as HTMLInputElement;
      expect(input.value).toBe('My default name');
    });
  });

  describe('when the form is invalid', () => {
    it('should show an error message', async () => {
      renderStepName();

      const input = screen.getByLabelText('Playbook name') as HTMLInputElement;
      await userEvent.clear(input);

      const submitButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Please name your Playbook');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('when the form is valid', () => {
    it('should trigger the onSubmit function with the form data', async () => {
      const onSubmit = jest.fn();
      renderStepName({ ...defaultProps, onSubmit });

      const submitButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('when clicking on the back button', () => {
    it('should trigger the onBack function', async () => {
      const onBack = jest.fn();
      renderStepName({ ...defaultProps, onBack });

      const backButton = screen.getByRole('button', { name: 'Back' });
      await userEvent.click(backButton);

      expect(onBack).toHaveBeenCalled();
    });
  });
});
