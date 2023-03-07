export type ContactFormData = {
  [FormField.name]: string;
  [FormField.email]: string;
  [FormField.message]: string;
  [FormField.company]: string;
};

export enum FormField {
  email = 'Email',
  name = 'Name',
  message = 'Message',
  company = 'Company',
}
