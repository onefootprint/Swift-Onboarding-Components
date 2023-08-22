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

export type DeclarationsFormProps = {
  defaultValues?: Partial<DeclarationData>;
  isLoading?: boolean;
  onSubmit: (data: DeclarationData, files?: File[]) => void;
};

type FormData = Record<InvestorProfileDeclaration, boolean> & {
  seniorExecutiveSymbols?: string;
};

const declarationKeys = [
  InvestorProfileDeclaration.affiliatedWithUsBroker,
  InvestorProfileDeclaration.seniorExecutive,
  InvestorProfileDeclaration.seniorPoliticalFigure,
  InvestorProfileDeclaration.familyOfPoliticalFigure,
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
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      ...Object.fromEntries(defaultEntries),
      seniorExecutiveSymbols:
        defaultValues?.[InvestorProfileDI.seniorExecutiveSymbols],
    },
  });
  const affiliatedWithUsBroker = watch(
    InvestorProfileDeclaration.affiliatedWithUsBroker,
  );
  const checkboxes = watch(declarationKeys);
  const seniorExecutive = watch(InvestorProfileDeclaration.seniorExecutive);
  const shouldRequireUpload = affiliatedWithUsBroker || seniorExecutive;
  const showCompanySymbols = seniorExecutive;
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
          onChange: () => {
            if (!seniorExecutive) {
              setValue('seniorExecutiveSymbols', '');
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
