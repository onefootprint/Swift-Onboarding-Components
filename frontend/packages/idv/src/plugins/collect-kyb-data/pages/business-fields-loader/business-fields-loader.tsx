import { BusinessDI, BusinessDIData, CollectedKybDataOption } from '@onefootprint/types';
import React from 'react';
import useEffectOnceStrict from '../../../../components/identify/hooks/use-effect-once-strict';
import { useDecryptBusiness } from '../../../../queries';

type InitProps = {
  authToken?: string;
  children: React.ReactNode;
  onError: (error?: unknown) => void;
  onSuccess: (data: BusinessDIData) => void;
  populatedAttributes?: CollectedKybDataOption[];
};

const businessFields: `${BusinessDI}`[] = [
  'business.address_line1',
  'business.address_line2',
  'business.beneficial_owners',
  'business.city',
  'business.corporation_type',
  'business.country',
  'business.dba',
  'business.formation_date',
  'business.formation_state',
  'business.kyced_beneficial_owners',
  'business.name',
  'business.phone_number',
  'business.state',
  'business.website',
  'business.zip',
  // 'business.tin', Requires an auth token with mobile access scope
];

const omitNullAndUndefined = (data: BusinessDIData): BusinessDIData =>
  Object.entries(data).reduce((response, [key, value]) => {
    if (value != null) response[key] = value;
    return response;
  }, Object.create(null));

const BusinessFieldsLoader = ({ authToken, children, onError, onSuccess, populatedAttributes }: InitProps) => {
  const mutDecryptBusiness = useDecryptBusiness();

  const fetchBusinessDIData = (authToken: string) => {
    mutDecryptBusiness.mutate(
      { authToken, fields: businessFields },
      {
        onError,
        onSuccess: (response: BusinessDIData) => {
          const res = omitNullAndUndefined(response);
          return populatedAttributes?.includes(CollectedKybDataOption.tin)
            ? onSuccess({ ...res, 'business.tin': 'decrypted' })
            : onSuccess(res);
        },
      },
    );
  };

  useEffectOnceStrict(() => {
    if (authToken) {
      fetchBusinessDIData(authToken);
    }
  });

  return children;
};

export default BusinessFieldsLoader;
