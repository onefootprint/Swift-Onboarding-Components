import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { PlaybookFormData } from '@/playbooks/utils/machine/types';

type PersonalScopesProps = {
  playbook: PlaybookFormData;
};

const PersonalScopes = ({ playbook }: PersonalScopesProps) => {
  const { register } = useFormContext();
  const { allT } = useTranslation(
    'pages.playbooks.dialog.your-playbook.data-collection.authorized-scopes',
  );

  const { personalInformationAndDocs } = playbook;
  const { selfie, idDoc, nationality, ssn, ssnKind } =
    personalInformationAndDocs;

  const isCollectingInvestorProfile =
    playbook[CollectedInvestorProfileDataOption.investorProfile];

  return (
    <>
      <Checkbox
        disabled
        checked
        label={allT('cdo.email')}
        {...register(CollectedKycDataOption.email)}
      />
      <Checkbox
        disabled
        checked
        label={allT('cdo.phone_number')}
        {...register(CollectedKycDataOption.phoneNumber)}
      />
      <Checkbox
        label={allT('cdo.name')}
        {...register(CollectedKycDataOption.name)}
      />
      <Checkbox
        label={allT('cdo.dob')}
        {...register(CollectedKycDataOption.dob)}
      />
      <Checkbox
        label={allT('cdo.full_address')}
        {...register(CollectedKycDataOption.fullAddress)}
      />
      {ssn &&
        (ssnKind === CollectedKycDataOption.ssn4 ? (
          <Checkbox
            label={allT('cdo.ssn4')}
            {...register(CollectedKycDataOption.ssn4)}
          />
        ) : (
          <Checkbox
            label={allT('cdo.ssn9')}
            {...register(CollectedKycDataOption.ssn9)}
          />
        ))}

      {nationality && (
        <Checkbox
          label={allT('cdo.nationality')}
          {...register(CollectedKycDataOption.nationality)}
        />
      )}
      {idDoc && (
        <Box>
          <Checkbox
            label={
              selfie ? allT('cdo.document_and_selfie') : allT('cdo.document')
            }
            {...register(CollectedDocumentDataOption.document)}
          />
        </Box>
      )}
      {isCollectingInvestorProfile && (
        <Checkbox
          label={allT('cdo.investor_profile')}
          {...register(CollectedInvestorProfileDataOption.investorProfile)}
        />
      )}
    </>
  );
};

export default PersonalScopes;
