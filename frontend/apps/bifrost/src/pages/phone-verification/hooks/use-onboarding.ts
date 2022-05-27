import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { UserDataAttribute } from 'src/bifrost-machine/types';

export type OnboardingRequest = {
  authToken: string;
};

export type OnboardingResponse = {
  missingAttributes: UserDataAttribute[];
  missingWebAuthnCredentials: boolean;
};

// Labels sent from the backend for each attribute
const missingAttributesLabels: Record<string, UserDataAttribute> = {
  first_name: UserDataAttribute.firstName,
  last_name: UserDataAttribute.lastName,
  dob: UserDataAttribute.dob,
  email: UserDataAttribute.email,
  ssn: UserDataAttribute.ssn,
  street_address: UserDataAttribute.streetAddress,
  street_address2: UserDataAttribute.streetAddress2,
  city: UserDataAttribute.city,
  state: UserDataAttribute.state,
  country: UserDataAttribute.country,
  zip: UserDataAttribute.zipCode,
};

const onboardingRequest = async (payload: OnboardingRequest) => {
  const { data: response } = await request<RequestResponse<OnboardingResponse>>(
    {
      method: 'POST',
      url: '/onboarding',
      headers: {
        'X-Fpuser-Authorization': payload.authToken,
        'x-Client-Public-Key': 'pk_otkVUdD3vYxVH69ips3Ric', // TODO: Placeholder tenant ID for now
      },
    },
  );
  return {
    ...response.data,
    missingAttributes: response.data.missingAttributes.map(
      (attr: string) => missingAttributesLabels[attr],
    ),
  };
};

const useOnboarding = () =>
  useMutation<OnboardingResponse, RequestError, OnboardingRequest>(
    onboardingRequest,
  );

export default useOnboarding;
