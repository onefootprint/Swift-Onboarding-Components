import { TextInput } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';

type State = { input: string };
type InputTextFormProps = {
  formId: string;
  label: string;
  onSubmit: (newName: string) => void;
  placeholder?: string;
  requiredMsg: string;
  value?: string;
};

const InputTextForm = ({ formId, label, onSubmit, placeholder, requiredMsg, value }: InputTextFormProps) => {
  const { formState, handleSubmit, register } = useForm<State>({
    defaultValues: { input: value },
  });

  const handleFormSubmit = (formData: State) => {
    onSubmit(formData.input);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} id={formId}>
      <TextInput
        autoFocus
        hasError={!!formState.errors.input}
        hint={formState.errors.input?.message}
        label={label}
        placeholder={placeholder || ''}
        {...register('input', {
          required: { value: true, message: requiredMsg },
        })}
      />
    </form>
  );
};

export default InputTextForm;
