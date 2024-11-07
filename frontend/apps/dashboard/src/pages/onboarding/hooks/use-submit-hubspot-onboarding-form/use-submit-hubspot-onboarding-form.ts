import { useMutation } from '@tanstack/react-query';

type AccountCreationPayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companySize?: string;
  companyWebsite?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmMedium?: string;
  utmSource?: string;
  utmTerm?: string;
};

const submitHubspotOnboardingForm = async (payload: AccountCreationPayload) => {
  const HUBSPOT_PORTAL_ID = '44814407';
  const HUBSPOT_FORM_ID = 'e018a6b8-616f-4f74-99f7-d7004ca8e63b';
  const HUBSPOT_FORM_URL = 'https://api.hsforms.com/submissions/v3/integration/submit';
  const HUBSPOT_TOKEN = process.env.NEXT_PUBLIC_HUBSPOT_TOKEN;

  if (!HUBSPOT_TOKEN) {
    throw new Error('NEXT_PUBLIC_HUBSPOT_TOKEN is not set');
  }

  const response = await fetch(`${HUBSPOT_FORM_URL}/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    },
    body: JSON.stringify({
      fields: [
        { name: 'firstname', value: payload.firstName },
        { name: 'lastname', value: payload.lastName },
        { name: 'email', value: payload.email },
        { name: 'company', value: payload.companyName },
        { name: 'website', value: payload.companyWebsite },
        { name: 'company_size', value: payload.companySize },
        { name: 'utm_campaign', value: payload.utmCampaign },
        { name: 'utm_medium', value: payload.utmMedium },
        { name: 'utm_source', value: payload.utmSource },
        { name: 'utm_content', value: payload.utmContent },
        { name: 'utm_term', value: payload.utmTerm },
      ].filter(entry => Boolean(entry.value)),
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to submit HubSpot form');
  }

  return result;
};

export const useSubmitHubspotOnboardingForm = () => {
  return useMutation({
    mutationFn: submitHubspotOnboardingForm,
  });
};
