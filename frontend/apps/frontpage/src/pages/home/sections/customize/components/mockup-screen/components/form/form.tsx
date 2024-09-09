import { Box, Stack, Text, TextInput, createFontStyles, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import ComponentNameBadge from '../../../component-name-badge';

type FormProps = {
  $borderRadius: string;
  $backgroundColor: string;
};

const Form = ({ $borderRadius, $backgroundColor }: FormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.customize.components.screen',
  });
  const generateComponentName = (name: string) => {
    const formattedName = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return `<${`${formattedName}Input`} />`;
  };

  return (
    <FormContainer>
      <Stack direction="column" gap={3} width="100%">
        <Text variant="label-3">{t('title')}</Text>
        <Text variant="body-3" color="secondary">
          {t('subtitle')}
        </Text>
      </Stack>
      <FieldsContainer>
        <Box position="relative" width="100%">
          <TextInput type="text" label={t('first-name')} placeholder="Jane" />
          <BadgeAligner>
            <ComponentNameBadge>{generateComponentName(t('first-name'))}</ComponentNameBadge>
          </BadgeAligner>
        </Box>
        <Box position="relative" width="100%">
          <TextInput type="text" label={t('last-name')} placeholder="Doe" />
          <BadgeAligner>
            <ComponentNameBadge>{generateComponentName(t('last-name'))}</ComponentNameBadge>
          </BadgeAligner>
        </Box>
        <Box position="relative" width="100%">
          <TextInput
            type="text"
            label={t('date-of-birth')}
            mask={{
              date: true,
              delimiter: '/',
              datePattern: ['m', 'd', 'Y'],
            }}
            placeholder="MM/DD/YYYY"
          />
          <BadgeAligner>
            <ComponentNameBadge>{'<DOBInput />'}</ComponentNameBadge>
          </BadgeAligner>
        </Box>
        <StyledButton $borderRadius={$borderRadius} $backgroundColor={$backgroundColor}>
          {t('cta')}
        </StyledButton>
      </FieldsContainer>
    </FormContainer>
  );
};

const FormContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[9]} ${theme.spacing[7]};
    gap: ${theme.spacing[7]};

    ${media.greaterThan('md')`
    padding: ${theme.spacing[9]} ${theme.spacing[10]};
      align-items: flex-start;
      width: 100%;   
    `}
  `}
`;

const FieldsContainer = styled(Stack)`
  ${({ theme }) => css`
    width: 100%;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    position: relative;
  `}
`;

const BadgeAligner = styled(Box)`
  ${({ theme }) => css`
    position: absolute;
    right: 0;
    top: -${theme.spacing[3]};

    ${media.greaterThan('md')`
      transform: translateX(50%);
      top: -${theme.spacing[3]};
      right: -${theme.spacing[10]};
    `}
  `}
`;

const StyledButton = styled.button<FormProps>`
  ${({ theme, $borderRadius, $backgroundColor }) => css`
    all: unset;
    ${createFontStyles('label-3')}
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${theme.color.quinary};
    padding: ${theme.spacing[3]};
    flex: 1;
    border-radius: ${$borderRadius}px;
    background-color: ${$backgroundColor};
    margin-top: ${theme.spacing[5]};
  `}
`;

export default Form;
