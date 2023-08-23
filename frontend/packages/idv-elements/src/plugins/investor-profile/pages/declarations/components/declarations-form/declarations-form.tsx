import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileDeclaration,
  InvestorProfileDI,
} from '@onefootprint/types';
import { Checkbox, TextInput } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import CustomForm from '../../../../components/custom-form';
import { DeclarationData } from '../../../../utils/state-machine/types';
import UploadComplianceLetter from '../upload-compliance-letter';
import filterNonTruthy from './utils/filter-non-truthy';
import trimAndSplit from './utils/trim-and-split';
import validateCompanySymbols from './utils/validate-company-symbols';
import validateFamilyMemberNames from './utils/validate-family-member-names';

export type DeclarationsFormProps = {
  defaultValues?: Partial<DeclarationData>;
  isLoading?: boolean;
  onSubmit: (data: DeclarationData, files?: File[]) => void;
};

type FormData = Record<InvestorProfileDeclaration, boolean> & {
  seniorExecutiveSymbols?: string;
  familyMemberNames?: string;
  politicalOrganization?: string;
};

const declarationKeys = [
  InvestorProfileDeclaration.affiliatedWithUsBroker,
  InvestorProfileDeclaration.seniorExecutive,
  InvestorProfileDeclaration.seniorPoliticalFigure,
];

const DeclarationsForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: DeclarationsFormProps) => {
  const { t } = useTranslation('pages.declarations');
  const defaultEntries = (
    defaultValues?.[InvestorProfileDI.declarations] ?? []
  ).map(goal => [goal, true]);
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
    resetField,
  } = useForm<FormData>({
    defaultValues: {
      ...Object.fromEntries(defaultEntries),
      seniorExecutiveSymbols:
        defaultValues?.[InvestorProfileDI.seniorExecutiveSymbols],
      familyMemberNames: defaultValues?.[InvestorProfileDI.familyMemberNames],
      politicalOrganization:
        defaultValues?.[InvestorProfileDI.politicalOrganization],
    },
  });

  const checkboxes = watch(declarationKeys);
  const seniorExecutive = watch(InvestorProfileDeclaration.seniorExecutive);
  const politicalFigure = watch(
    InvestorProfileDeclaration.seniorPoliticalFigure,
  );
  const affiliatedWithUsBroker = watch(
    InvestorProfileDeclaration.affiliatedWithUsBroker,
  );
  const shouldRequireUpload = affiliatedWithUsBroker || seniorExecutive;
  const showCompanySymbols = seniorExecutive;
  const showFamilyMembers = politicalFigure;
  const showPoliticalOrganization = politicalFigure;
  const [shouldShowUploadError, setShouldShowUploadError] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const hasSelectedAnyOption = Object.values(checkboxes).some(value => value);
  const handleUploadChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setShouldShowUploadError(false);
    }
    setFiles(newFiles);
  };

  const handleBeforeSubmit = (data: FormData) => {
    if (shouldRequireUpload && files.length === 0) {
      setShouldShowUploadError(true);
      return;
    }
    const declarations = Object.fromEntries(
      declarationKeys.map(key => [key, data[key]]),
    );
    const payload: DeclarationData = {
      [InvestorProfileDI.declarations]: filterNonTruthy(
        declarations,
      ) as InvestorProfileDeclaration[],
      [InvestorProfileDI.seniorExecutiveSymbols]: trimAndSplit(
        data.seniorExecutiveSymbols,
      ),
      [InvestorProfileDI.familyMemberNames]: trimAndSplit(
        data.familyMemberNames,
      ),
      [InvestorProfileDI.politicalOrganization]: data.politicalOrganization,
    };

    if (files.length) {
      onSubmit(payload, files);
    } else {
      onSubmit(payload);
    }
  };

  return (
    <CustomForm
      title={t('title')}
      subtitle={t('subtitle')}
      isLoading={isLoading}
      ctaLabel={hasSelectedAnyOption ? undefined : t('cta-none')}
      formAttributes={{
        encType: 'multipart/form-data',
        onSubmit: handleSubmit(handleBeforeSubmit),
      }}
    >
      <Checkbox
        label={t(
          `options.${InvestorProfileDeclaration.affiliatedWithUsBroker}`,
        )}
        {...register(InvestorProfileDeclaration.affiliatedWithUsBroker)}
      />
      <Checkbox
        label={t(`options.${InvestorProfileDeclaration.seniorExecutive}`)}
        {...register(InvestorProfileDeclaration.seniorExecutive, {
          onChange: event => {
            if (!event.target.checked) {
              resetField('seniorExecutiveSymbols');
            }
          },
        })}
      />
      {showCompanySymbols && (
        <TextInput
          autoFocus
          hasError={!!errors.seniorExecutiveSymbols}
          hint={
            errors.seniorExecutiveSymbols
              ? t('company-symbols.error')
              : t('company-symbols.hint')
          }
          label={t('company-symbols.label')}
          placeholder={t('company-symbols.placeholder')}
          {...register('seniorExecutiveSymbols', {
            required: true,
            validate: validateCompanySymbols,
          })}
        />
      )}
      <Checkbox
        label={t(`options.${InvestorProfileDeclaration.seniorPoliticalFigure}`)}
        {...register(InvestorProfileDeclaration.seniorPoliticalFigure, {
          onChange: event => {
            if (!event.target.checked) {
              resetField('familyMemberNames');
              resetField('politicalOrganization');
            }
          },
        })}
      />
      {showFamilyMembers && (
        <TextInput
          autoFocus
          hasError={!!errors.familyMemberNames}
          hint={
            errors.familyMemberNames
              ? t('family-members.error')
              : t('family-members.hint')
          }
          label={t('family-members.label')}
          placeholder={t('family-members.placeholder')}
          {...register('familyMemberNames', {
            required: true,
            validate: validateFamilyMemberNames,
          })}
        />
      )}
      {showPoliticalOrganization && (
        <TextInput
          hasError={!!errors.politicalOrganization}
          hint={
            errors.politicalOrganization && t('political-organization.error')
          }
          label={t('political-organization.label')}
          placeholder={t('political-organization.placeholder')}
          {...register('politicalOrganization', {
            required: true,
          })}
        />
      )}
      {shouldRequireUpload && (
        <UploadComplianceLetter
          hasError={shouldShowUploadError}
          onChange={handleUploadChange}
        />
      )}
    </CustomForm>
  );
};

export default DeclarationsForm;
