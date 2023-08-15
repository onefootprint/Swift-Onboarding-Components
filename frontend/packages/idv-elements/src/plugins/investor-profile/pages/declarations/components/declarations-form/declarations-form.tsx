import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDeclaration,
  InvestorProfileDI,
} from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import CustomForm from '../../../../components/custom-form';
import { DeclarationData } from '../../../../utils/state-machine/types';
import UploadComplianceLetter from '../upload-compliance-letter';

export type DeclarationsFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.declarations>;
  isLoading?: boolean;
  onSubmit: (data: DeclarationData, files?: File[]) => void;
};

type FormData = Record<InvestorProfileDeclaration, boolean>;

const DeclarationsForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: DeclarationsFormProps) => {
  const { t } = useTranslation('pages.declarations');
  const defaultEntries = (
    defaultValues?.[InvestorProfileDI.declarations] ?? []
  ).map(goal => [goal, true]);
  const { handleSubmit, register, watch } = useForm<FormData>({
    defaultValues: Object.fromEntries(defaultEntries),
  });
  const affiliatedWithUsBroker = watch(
    InvestorProfileDeclaration.affiliatedWithUsBroker,
  );
  const checkboxes = watch([
    InvestorProfileDeclaration.affiliatedWithUsBroker,
    InvestorProfileDeclaration.seniorExecutive,
    InvestorProfileDeclaration.seniorPoliticalFigure,
    InvestorProfileDeclaration.familyOfPoliticalFigure,
  ]);
  const seniorExecutive = watch(InvestorProfileDeclaration.seniorExecutive);
  const shouldRequireUpload = affiliatedWithUsBroker || seniorExecutive;
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

    const filteredData = Object.entries(data)
      .filter(([, value]) => !!value)
      .map(([key]) => key as InvestorProfileDeclaration);
    const declarations = {
      [InvestorProfileDI.declarations]: filteredData,
    };

    if (files.length) {
      onSubmit(declarations, files);
    } else {
      onSubmit(declarations);
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
        {...register(InvestorProfileDeclaration.seniorExecutive)}
      />
      <Checkbox
        label={t(`options.${InvestorProfileDeclaration.seniorPoliticalFigure}`)}
        {...register(InvestorProfileDeclaration.seniorPoliticalFigure)}
      />
      <Checkbox
        label={t(
          `options.${InvestorProfileDeclaration.familyOfPoliticalFigure}`,
        )}
        {...register(InvestorProfileDeclaration.familyOfPoliticalFigure)}
      />
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
