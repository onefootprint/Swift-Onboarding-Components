export type ContactDialogData = {
  [FormField.name]: string;
  [FormField.email]: string;
  [FormField.message]: string;
  [FormField.company]: string;
  meta?: string;
};

export enum FormField {
  email = 'Email',
  name = 'Name',
  message = 'Message',
  company = 'Company',
}
