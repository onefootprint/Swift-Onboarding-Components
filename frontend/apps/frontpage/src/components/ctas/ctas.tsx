import { Button, Stack, media } from '@onefootprint/ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonLink from 'src/components/button-link';
import MarketingLink from 'src/components/marketing-link';
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

  const handleBookCall = useCallback(() => {
    setShowDialog(true);
  }, []);

  return (
    <>
      <ButtonsContainer flexDirection={direction} align={align}>
        <Button variant="primary" size="large" onClick={handleBookCall}>
          {labels?.primary || t('book-a-call')}
        </Button>
        <MarketingLink app="dashboard" href="authentication/sign-up" target="_blank">
          <ButtonLink variant="secondary" size="large">
            {labels?.secondary || t('sign-up-for-free')}
          </ButtonLink>
        </MarketingLink>
      </ButtonsContainer>
      <ContactDialog open={showDialog} onClose={() => setShowDialog(false)} />
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
