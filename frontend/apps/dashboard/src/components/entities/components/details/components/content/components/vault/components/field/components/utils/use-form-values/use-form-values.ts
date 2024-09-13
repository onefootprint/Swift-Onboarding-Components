import { BusinessDI, IdDI } from '@onefootprint/types';
import { useFormContext, useWatch } from 'react-hook-form';

export type EditDetailsFormData = {
  [IdDI.firstName]?: string;
  [IdDI.middleName]?: string;
  [IdDI.lastName]?: string;
  [IdDI.dob]?: string;
  [IdDI.ssn9]?: string;
  [IdDI.ssn4]?: string;
  [IdDI.addressLine1]?: string;
  [IdDI.addressLine2]?: string;
  [IdDI.city]?: string;
  [IdDI.state]?: string;
  [IdDI.country]?: string;
  [IdDI.zip]?: string;
  [IdDI.nationality]?: string;
  [IdDI.usLegalStatus]?: string;
  [IdDI.visaKind]?: string;
  [IdDI.visaExpirationDate]?: string;
  [IdDI.citizenships]?: string[];
  [BusinessDI.name]?: string;
  [BusinessDI.doingBusinessAs]?: string;
  [BusinessDI.website]?: string;
  [BusinessDI.tin]?: string;
  [BusinessDI.corporationType]?: string;
  [BusinessDI.addressLine1]?: string;
  [BusinessDI.addressLine2]?: string;
  [BusinessDI.city]?: string;
  [BusinessDI.state]?: string;
  [BusinessDI.country]?: string;
  [BusinessDI.zip]?: string;
  [BusinessDI.formationState]?: string;
  [BusinessDI.formationDate]?: string;
};

const useFormValues = () => {
  const { getValues } = useFormContext<EditDetailsFormData>();

  return {
    ...useWatch(),
    ...getValues(),
  };
};

export default useFormValues;
