import React, { useState } from 'react';
import styled from 'styled-components';

import ContactDialog from './dialog/dialog';

const GET_FORM_URL =
  'https://getform.io/f/dcda4ab1-bf30-4aeb-bf3c-af013bbc2b30';

type ContactFormProps = {
  children: React.ReactNode;
};

const ContactForm = ({ children }: ContactFormProps) => {
  const [showDialog, setShowDialog] = useState(false);

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
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </>
  );
};

const Trigger = styled.button`
  all: unset;
  cursor: pointer;
`;

export default ContactForm;
