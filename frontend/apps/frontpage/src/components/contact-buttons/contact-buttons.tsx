import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import styled, { css } from '@onefootprint/styled';
import { Button, media, Stack } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';

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
      <Buttons width="100%" justify={justify}>
        <Link href={`${DASHBOARD_BASE_URL}/sign-up`}>
          <Button variant="primary">{signUpButton}</Button>
        </Link>
        <Button variant="secondary" onClick={handleClickTrigger}>
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
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[4]};

    button,
    a {
      width: 100%;
      text-decoration: none;
    }

    ${media.greaterThan('md')`
      flex-direction: row;
      gap: ${theme.spacing[5]};

      button,
      a {
        width: auto;
        text-decoration: none;
      }
    `}
  `}
`;

export default ContactButtons;
