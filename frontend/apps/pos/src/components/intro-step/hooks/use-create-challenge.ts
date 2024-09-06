import { useFootprint } from '@onefootprint/footprint-react';
import { useMutation } from '@tanstack/react-query';

const useCreateChallenge = () => {
  const fp = useFootprint();
  return useMutation({
    mutationFn: (phoneNumber: string) => fp.createEmailPhoneBasedChallenge({ phoneNumber }),
  });
};

export default useCreateChallenge;
