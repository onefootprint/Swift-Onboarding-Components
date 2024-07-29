import { BusinessDI, BusinessDIData } from '@onefootprint/types';
import React from 'react';
import useEffectOnceStrict from '../../../../components/identify/hooks/use-effect-once-strict';
import { useDecryptBusiness } from '../../../../queries';

type InitProps = {
  authToken?: string;
  children: React.ReactNode;
  onError: (error?: unknown) => void;
  onSuccess: (data: BusinessDIData) => void;
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

const BusinessFieldsLoader = ({ authToken, children, onError, onSuccess }: InitProps) => {
  const mutDecryptBusiness = useDecryptBusiness();

  const fetchBusinessDIData = (authToken: string) => {
    mutDecryptBusiness.mutate(
      { authToken, fields: businessFields },
      {
        onError,
        onSuccess: (res: BusinessDIData) =>
          res['business.tin'] != null ? onSuccess(res) : onSuccess({ ...res, 'business.tin': 'decrypted' }),
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
