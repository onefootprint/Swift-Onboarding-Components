import { customRender, fireEvent, screen, waitFor } from '@onefootprint/test-utils';
import { BusinessDI, IdDI } from '@onefootprint/types';
import { FormProvider, useForm } from 'react-hook-form';
import DateInput from './date-input';

const renderDateInput = (fieldName: IdDI | BusinessDI, value: string) => {
  const Wrapper = () => {
    const methods = useForm();
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(jest.fn())} aria-label="date-input-form">
          <DateInput fieldName={fieldName} value={value} />
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  };
  return customRender(<Wrapper />);
};

describe('<DateInput />', () => {
  describe('date of birth', () => {
    it('rejects a date too old for DOB', async () => {
      renderDateInput(IdDI.dob, '1824-08-26');
      fireEvent.submit(screen.getByRole('form', { name: 'date-input-form' }));
      await waitFor(() => {
        const tooOldWarning = screen.getByText('Cannot be before 1900');
        expect(tooOldWarning).toBeInTheDocument();
      });
    });

    it('rejects a far future date for DOB', async () => {
      renderDateInput(IdDI.dob, '2095-01-01');
      fireEvent.submit(screen.getByRole('form', { name: 'date-input-form' }));
      await waitFor(() => {
        const futureDateWarning = screen.getByText('Cannot be in the future');
        expect(futureDateWarning).toBeInTheDocument();
      });
    });

    it('rejects a recent date for DOB', async () => {
      renderDateInput(IdDI.dob, '2024-08-26');
      fireEvent.submit(screen.getByRole('form', { name: 'date-input-form' }));
      await waitFor(() => {
        const tooYoungWarning = screen.getByText('Must be at least 18 years old');
        expect(tooYoungWarning).toBeInTheDocument();
      });
    });

    it('rejects an invalid date for DOB', async () => {
      renderDateInput(IdDI.dob, '2023/13/32');
      fireEvent.submit(screen.getByRole('form', { name: 'date-input-form' }));
      await waitFor(() => {
        const invalidDOBHint = screen.getByText('Must be formatted YYYY-MM-DD');
        expect(invalidDOBHint).toBeInTheDocument();
      });
    });
  });

  describe('business formation date', () => {
    it('rejects a far future date for business formation date', async () => {
      renderDateInput(BusinessDI.formationDate, '2095-01-01');
      fireEvent.submit(screen.getByRole('form', { name: 'date-input-form' }));
      await waitFor(() => {
        const futureDateWarning = screen.getByText('Cannot be in the future');
        expect(futureDateWarning).toBeInTheDocument();
      });
    });

    it('accepts a recent date for business formation date', async () => {
      renderDateInput(BusinessDI.formationDate, '2024-08-26');
      fireEvent.submit(screen.getByRole('form', { name: 'date-input-form' }));
      await waitFor(() => {
        const futureDateWarning = screen.queryByText('Cannot be in the future');
        expect(futureDateWarning).not.toBeInTheDocument();
      });
    });

    it('accepts an old date for business formation date', async () => {
      renderDateInput(BusinessDI.formationDate, '1824-08-26');
      fireEvent.submit(screen.getByRole('form', { name: 'date-input-form' }));
      await waitFor(() => {
        const tooOldWarning = screen.queryByText('Cannot be before 1900');
        expect(tooOldWarning).not.toBeInTheDocument();
      });
    });

    it('rejects an invalid date for business formation date', async () => {
      renderDateInput(BusinessDI.formationDate, '2023/13/32');
      fireEvent.submit(screen.getByRole('form', { name: 'date-input-form' }));
      await waitFor(() => {
        const invalidBusinessDateHint = screen.getByText('Must be formatted YYYY-MM-DD');
        expect(invalidBusinessDateHint).toBeInTheDocument();
      });
    });
  });
});
