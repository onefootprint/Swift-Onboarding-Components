import { InvestorProfileDI } from '@onefootprint/types';
import { getLogger, trackAction } from '../../../../utils/logger';
import ContinueButton from '../../components/form-with-error-footer/components/continue-button';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { EmploymentData } from '../../utils/state-machine/types';
import EmploymentForm from './components/employment-form';

const { logError } = getLogger({ location: 'investor-profile-employment' });

type EmploymentProps = {
  onSuccess?: () => void;
  renderFooter?: (isLoading: boolean) => React.ReactNode;
};
const Employment = ({ onSuccess, renderFooter }: EmploymentProps) => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (data: EmploymentData) => {
    trackAction('investor-profile:employment-submit');
    syncData({
      authToken,
      data,
      onSuccess: () => {
        send({ type: 'employmentSubmitted', payload: { ...data } });
        onSuccess?.();
      },
      onError: (error: unknown) => {
        logError('Encountered error while speculatively syncing data on investor-profile employment pages', error);
      },
    });
  };

  return (
    <EmploymentForm
      onSubmit={handleSubmit}
      defaultValues={{
        [InvestorProfileDI.employmentStatus]: data?.[InvestorProfileDI.employmentStatus],
        [InvestorProfileDI.occupation]: data?.[InvestorProfileDI.occupation],
        [InvestorProfileDI.employer]: data?.[InvestorProfileDI.employer],
      }}
      footer={
        renderFooter ? (
          renderFooter(mutation.isPending)
        ) : (
          <ContinueButton isLoading={mutation.isPending} trackActionName="investor-profile:employment-continue" />
        )
      }
    />
  );
};

export default Employment;
