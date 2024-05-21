import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Button, media, Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled from 'styled-components';

import ContactDialog from '../contact-dialog';

type ContactButtonsProps = {
  bookADemoButton: string;
  signUpButton: string;
  justify?: 'left' | 'center' | 'right';
};

const GET_FORM_URL =
  'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

const ContactButtons = ({
  signUpButton,
  bookADemoButton,
  justify = 'left',
}: ContactButtonsProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleClickTrigger = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <>
      <Buttons width="100%" justify={justify} gap={4}>
        <Button
          variant="primary"
          size="large"
          onClick={() =>
            window.open(
              `${DASHBOARD_BASE_URL}/authentication/sign-up`,
              '_blank',
            )
          }
        >
          {signUpButton}
        </Button>
        <Button variant="secondary" size="large" onClick={handleClickTrigger}>
          {bookADemoButton}
        </Button>
      </Buttons>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </>
  );
};

const Buttons = styled(Stack)`
  flex-direction: column;

  button,
  a {
    width: 100%;
    text-decoration: none;
  }

  ${media.greaterThan('md')`
      flex-direction: row;
    

      button,
      a {
        width: auto;
        text-decoration: none;
      }
    `}
`;

export default ContactButtons;
