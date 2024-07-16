import { Button, Stack, media } from '@onefootprint/ui';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_FORM_URL, LINTRK_CONVERSION_ID, SIGN_UP_URL } from 'src/config/constants';
import styled, { css } from 'styled-components';
import ContactDialog from '../contact-dialog';

type CtasDirection = {
  desktop: 'column' | 'row';
  mobile: 'column' | 'row';
};

type Labels = {
  primary?: string;
  secondary?: string;
};

type CtasProps = {
  labels?: Labels;
  direction?: CtasDirection;
  align?: 'left' | 'center' | 'right';
};

const Ctas = ({ labels, direction = { desktop: 'row', mobile: 'column' }, align = 'center' }: CtasProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.ctas' });
  const [showDialog, setShowDialog] = useState(false);

  const handleSignUpClick = () => {
    window.lintrk('track', { conversion_id: LINTRK_CONVERSION_ID });
    window.open(SIGN_UP_URL, '_blank');
  };

  const handleBookCall = useCallback(() => {
    window.lintrk('track', { conversion_id: LINTRK_CONVERSION_ID });
    setShowDialog(true);
  }, []);

  return (
    <>
      <ButtonsContainer flexDirection={direction} align={align}>
        <Button variant="primary" size="large" onClick={handleSignUpClick}>
          {labels?.primary || t('get-started')}
        </Button>
        <Button variant="secondary" size="large" onClick={handleBookCall}>
          {labels?.secondary || t('book-a-call')}
        </Button>
      </ButtonsContainer>
      <ContactDialog url={GET_FORM_URL} open={showDialog} onClose={() => setShowDialog(false)} />
    </>
  );
};

const ButtonsContainer = styled(Stack)<{
  align?: 'left' | 'center' | 'right';
  flexDirection?: CtasDirection;
}>`
	${({ theme, flexDirection, align }) => css`
		flex-direction: ${flexDirection?.mobile};
		gap: ${theme.spacing[3]};
		margin-top: ${theme.spacing[3]};
		width: 100%;
		justify-content: ${align};

    button {
      width: 100%;
    }

		${media.greaterThan('md')`
			flex-direction: ${flexDirection?.desktop};
            margin-top: ${theme.spacing[5]};
			justify-content: ${align};
			width: 100%;

			button {
				width: fit-content;
			}
		`}

        
	`}
`;

export default Ctas;
