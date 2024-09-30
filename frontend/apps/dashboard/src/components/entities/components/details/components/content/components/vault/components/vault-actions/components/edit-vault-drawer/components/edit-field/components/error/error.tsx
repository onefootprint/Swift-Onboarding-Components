import type { DataIdentifier, Entity } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import get from 'lodash/get';
import { useFormContext } from 'react-hook-form';
import useFieldProps from '../../../../utils/use-field-props';

export type ErrorOrHintProps = {
  entity: Entity;
  fieldName: DataIdentifier;
};

const ErrorOrHint = ({ entity, fieldName }: ErrorOrHintProps) => {
  const {
    formState: { errors },
  } = useFormContext();
  const { inputOptions } = useFieldProps(entity, fieldName);
  const error = get(errors, fieldName);

  if (error) {
    return <Form.Errors textAlign="left">{error?.message}</Form.Errors>;
  }
  if (inputOptions?.hint) {
    return <Form.Hint textAlign="right">{inputOptions?.hint}</Form.Hint>;
  }
  return null;
};

export default ErrorOrHint;
