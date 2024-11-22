import { Button, Stack, media } from '@onefootprint/ui';
import { useState } from 'react';
import styled from 'styled-components';

import ButtonLink from '../button-link';
import ContactDialog from '../contact-dialog';
import MarketingLink from '../marketing-link';

type ContactButtonsProps = {
  bookADemoButton: string;
  signUpButton: string;
  justify?: 'left' | 'center' | 'right';
};

const ContactButtons = ({ signUpButton, bookADemoButton, justify = 'left' }: ContactButtonsProps) => {
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
        <MarketingLink app="dashboard" href="authentication/sign-up" target="_blank">
          <ButtonLink variant="primary" size="large">
            {signUpButton}
          </ButtonLink>
        </MarketingLink>
        <Button variant="secondary" size="large" onClick={handleClickTrigger}>
          {bookADemoButton}
        </Button>
      </Buttons>
      <ContactDialog open={showDialog} onClose={handleClose} />
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
