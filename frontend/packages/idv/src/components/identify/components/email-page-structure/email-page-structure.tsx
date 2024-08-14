import type { ComponentProps } from 'react';

import EmailForm from '../../../email-form';
import type { HeaderProps } from '../../types';

type EmailFormProps = ComponentProps<typeof EmailForm>;

type EmailPageStructureProps = {
  children?: JSX.Element | null;
  defaultEmail?: string;
  Footer?: JSX.Element;
  Header: (props: HeaderProps) => JSX.Element;
  isLoading?: boolean;
  onSubmit: (email: string) => void;
  texts: {
    header: {
      title: string;
      subtitle?: string;
    };
  } & EmailFormProps['texts'];
};

const EmailPageStructure = ({
  children,
  defaultEmail,
  Footer,
  Header,
  isLoading,
  onSubmit,
  texts,
}: EmailPageStructureProps) => {
  const {
    header: { title, subtitle },
    ...formTexts
  } = texts;

  const handleFormSubmit = (formData: { email: string }) => {
    onSubmit(formData.email);
  };

  return (
    <>
      <Header title={title} subtitle={subtitle} />
      <EmailForm defaultEmail={defaultEmail} isLoading={isLoading} onSubmit={handleFormSubmit} texts={formTexts} />
      {Footer}
      {children}
    </>
  );
};

export default EmailPageStructure;
