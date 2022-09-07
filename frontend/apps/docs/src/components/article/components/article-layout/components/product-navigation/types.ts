export type SupportFormData = {
  [FormField.name]: string;
  [FormField.email]: string;
  [FormField.message]: string;
};

export enum FormField {
  email = 'email',
  name = 'name',
  message = 'message',
}
