import type React from 'react';
import { useState } from 'react';
import { PopupModal } from 'react-calendly';
import useSession from 'src/hooks/use-session';
import styled from 'styled-components';

type ContactFormProps = {
  children: React.ReactNode;
};

const ContactForm = ({ children }: ContactFormProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const { data } = useSession();

  const prefill = {
    email: data.user?.email || '',
    firstName: data.user?.firstName || '',
    lastName: data.user?.lastName || '',
    name: `${data.user?.firstName} ${data.user?.lastName}` || '',
  };

  const handleClickTrigger = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <>
      <Trigger type="button" onClick={handleClickTrigger}>
        {children}
      </Trigger>
      <PopupModal
        url="https://calendly.com/mhreben"
        onModalClose={handleClose}
        open={showDialog}
        rootElement={document.body}
        prefill={prefill}
      />
    </>
  );
};

const Trigger = styled.button`
  all: unset;
  cursor: pointer;
`;

export default ContactForm;
