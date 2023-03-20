import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
  InvestorProfileDeclaration,
} from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button';
import { DeclarationData } from '../../../../utils/state-machine/types';
import UploadDoc from '../upload-doc';

export type DeclarationsFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDataAttribute.declarations
  >;
  isLoading?: boolean;
  onSubmit: (data: DeclarationData) => void;
};

type FormData = Record<InvestorProfileDeclaration, boolean>;

const DeclarationsForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: DeclarationsFormProps) => {
  const { t } = useTranslation('pages.declarations.form');
  const defaultEntries = (
    defaultValues?.[InvestorProfileDataAttribute.declarations] ?? []
  ).map(goal => [goal, true]);
  const { handleSubmit, register, watch } = useForm<FormData>({
    defaultValues: Object.fromEntries(defaultEntries),
  });
  const affiliatedWithUsBroker = watch(
    InvestorProfileDeclaration.affiliatedWithUsBroker,
  );
  const seniorExecutive = watch(InvestorProfileDeclaration.seniorExecutive);
  const shouldShowUpload = affiliatedWithUsBroker || seniorExecutive;

  const handleBeforeSubmit = (data: FormData) => {
    const goals = Object.entries(data)
      .filter(([, value]) => !!value)
      .map(([key]) => key as InvestorProfileDeclaration);
    onSubmit({
      [InvestorProfileDataAttribute.declarations]: goals,
    });
  };

  return (
    <Form onSubmit={handleSubmit(handleBeforeSubmit)}>
      <CheckboxContainer>
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
          label={t(
            `options.${InvestorProfileDeclaration.seniorPoliticalFigure}`,
          )}
          {...register(InvestorProfileDeclaration.seniorPoliticalFigure)}
        />
        <Checkbox
          label={t(
            `options.${InvestorProfileDeclaration.familyOfPoliticalFigure}`,
          )}
          {...register(InvestorProfileDeclaration.familyOfPoliticalFigure)}
        />
      </CheckboxContainer>
      {shouldShowUpload && <UploadDoc />}
      <ContinueButton isLoading={isLoading} />
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

const CheckboxContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[6]};

    // For checkbox labels that wrap around, we want to align the text baseline
    label {
      align-items: baseline;
    }
  `}
`;

export default DeclarationsForm;
