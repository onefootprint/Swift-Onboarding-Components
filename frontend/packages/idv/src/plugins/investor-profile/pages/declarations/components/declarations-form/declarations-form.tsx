import { InvestorProfileDI, InvestorProfileDeclaration } from '@onefootprint/types';
import { Checkbox, TextInput } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormWithErrorAndFooter from '../../../../components/form-with-error-footer';
import type { DeclarationData } from '../../../../utils/state-machine/types';
import UploadComplianceLetter from '../upload-compliance-letter';
import filterNonTruthy from './utils/filter-non-truthy';
import trimAndSplit from './utils/trim-and-split';
import validateCompanySymbols from './utils/validate-company-symbols';
import validateFamilyMemberNames from './utils/validate-family-member-names';

export type DeclarationsFormProps = {
  defaultValues?: Partial<DeclarationData>;
  footer: React.ReactNode;
  onSubmit: (data: DeclarationData, files?: File[]) => void;
  selectedFiles?: File[];
};

type FormData = Record<InvestorProfileDeclaration, boolean> & {
  seniorExecutiveSymbols?: string;
  familyMemberNames?: string;
  politicalOrganization?: string;
  brokerageFirmEmployer?: string;
};

const declarationKeys = [
  InvestorProfileDeclaration.affiliatedWithUsBroker,
  InvestorProfileDeclaration.seniorExecutive,
  InvestorProfileDeclaration.seniorPoliticalFigure,
];

const DeclarationsForm = ({ defaultValues, footer, onSubmit, selectedFiles }: DeclarationsFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages.declarations' });
  const defaultEntries = (defaultValues?.[InvestorProfileDI.declarations] ?? []).map(goal => [goal, true]);
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
    resetField,
  } = useForm<FormData>({
    defaultValues: {
      ...Object.fromEntries(defaultEntries),
      brokerageFirmEmployer: defaultValues?.[InvestorProfileDI.brokerageFirmEmployer],
      seniorExecutiveSymbols: defaultValues?.[InvestorProfileDI.seniorExecutiveSymbols],
      familyMemberNames: defaultValues?.[InvestorProfileDI.familyMemberNames],
      politicalOrganization: defaultValues?.[InvestorProfileDI.politicalOrganization],
    },
  });

  const seniorExecutive = watch(InvestorProfileDeclaration.seniorExecutive);
  const politicalFigure = watch(InvestorProfileDeclaration.seniorPoliticalFigure);
  const affiliatedWithUsBroker = watch(InvestorProfileDeclaration.affiliatedWithUsBroker);
  const showFirmEmployer = affiliatedWithUsBroker;
  const shouldRequireUpload = affiliatedWithUsBroker || seniorExecutive;
  const showCompanySymbols = seniorExecutive;
  const showFamilyMembers = politicalFigure;
  const showPoliticalOrganization = politicalFigure;
  const [shouldShowUploadError, setShouldShowUploadError] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const handleUploadChange = (fileList: File[]) => {
    if (fileList.length > 0) {
      setShouldShowUploadError(false);
    }
    setFiles(fileList);
  };

  const handleBeforeSubmit = (data: FormData) => {
    if (shouldRequireUpload && files.length === 0) {
      setShouldShowUploadError(true);
      return;
    }
    const declarations = Object.fromEntries(declarationKeys.map(key => [key, data[key]]));
    const payload: DeclarationData = {
      [InvestorProfileDI.declarations]: filterNonTruthy(declarations) as InvestorProfileDeclaration[],
      [InvestorProfileDI.seniorExecutiveSymbols]: trimAndSplit(data.seniorExecutiveSymbols),
      [InvestorProfileDI.familyMemberNames]: trimAndSplit(data.familyMemberNames),
      [InvestorProfileDI.politicalOrganization]: data.politicalOrganization,
      [InvestorProfileDI.brokerageFirmEmployer]: data.brokerageFirmEmployer,
    };

    if (files.length) {
      onSubmit(payload, files);
    } else {
      onSubmit(payload);
    }
  };

  return (
    <FormWithErrorAndFooter
      footer={footer}
      formAttributes={{ encType: 'multipart/form-data', onSubmit: handleSubmit(handleBeforeSubmit) }}
    >
      <Checkbox
        label={t(`options.${InvestorProfileDeclaration.affiliatedWithUsBroker}`)}
        {...register(InvestorProfileDeclaration.affiliatedWithUsBroker, {
          onChange: event => {
            if (!event.target.checked) {
              resetField('brokerageFirmEmployer');
            }
          },
        })}
      />
      {showFirmEmployer && (
        <TextInput
          autoFocus
          hasError={!!errors.brokerageFirmEmployer}
          hint={errors.brokerageFirmEmployer && t('brokerage-firm-employer.error')}
          label={t('brokerage-firm-employer.label')}
          placeholder={t('brokerage-firm-employer.placeholder')}
          {...register('brokerageFirmEmployer', {
            required: true,
          })}
        />
      )}
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
          hint={errors.seniorExecutiveSymbols ? t('company-symbols.error') : t('company-symbols.hint')}
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
          hint={errors.familyMemberNames ? t('family-members.error') : t('family-members.hint')}
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
          hint={errors.politicalOrganization && t('political-organization.error')}
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
          selectedFiles={selectedFiles}
          onChange={handleUploadChange}
        />
      )}
    </FormWithErrorAndFooter>
  );
};

export default DeclarationsForm;
