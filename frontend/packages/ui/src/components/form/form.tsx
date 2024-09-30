import FormAddon from './form-addon';
import FormCheckbox from './form-checkbox';
import FormErrors from './form-errors';
import FormField from './form-field';
import FormFieldContext from './form-field-context';
import FormGroup from './form-group';
import FormHint from './form-hint';
import FormInput from './form-input';
import FormLabel from './form-label';
import FormRadio from './form-radio';
import FormSelect from './form-select';

const Form = {
  Field: FormField,
  Label: FormLabel,
  Group: FormGroup,
  Addon: FormAddon,
  Errors: FormErrors,
  Context: FormFieldContext,
  Input: FormInput,
  Select: FormSelect,
  Radio: FormRadio,
  Checkbox: FormCheckbox,
  Hint: FormHint,
};

export default Form;
