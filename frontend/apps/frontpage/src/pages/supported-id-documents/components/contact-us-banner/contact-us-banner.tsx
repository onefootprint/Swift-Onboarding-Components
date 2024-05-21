import { Button, media, Stack, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ContactDialog from 'src/components/contact-dialog';
import styled, { css } from 'styled-components';

type ContactUsBannerProps = {
  title: string;
  subtitle: string;
  cta: string;
};

const GET_FORM_URL = 'https://getform.io/f/pbygomeb';

const ContactUsBanner: React.FC<ContactUsBannerProps> = ({
  title,
  subtitle,
  cta,
}) => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const handleClick = (): void => {
    setShowDialog(true);
  };
  const handleClose = (): void => {
    setShowDialog(false);
  };
  return (
    <ContactContainer
      align="center"
      direction="column"
      marginBottom={10}
      textAlign="center"
      backgroundColor="primary"
    >
      <Text variant="label-1" marginBottom={3}>
        {title}
      </Text>
      <Text color="secondary" variant="body-2" marginBottom={7}>
        {subtitle}
      </Text>
      <Button onClick={handleClick}>{cta}</Button>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </ContactContainer>
  );
};

const ContactContainer = styled(Stack)`
  ${({ theme }) => css`
    ${media.greaterThan('lg')`
            margin-bottom: ${theme.spacing[11]};
        `};
  `}
`;

export default ContactUsBanner;
