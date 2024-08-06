import { Box, Stack, Text, createFontStyles } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

export type CustomIcons =
  | 'app-clip'
  | 'chip'
  | 'confidence'
  | 'confidence-alt'
  | 'customization'
  | 'heart'
  | 'ID'
  | 'lock'
  | 'phone'
  | 'safe'
  | 'servers'
  | 'store'
  | 'store-alt'
  | 'users'
  | 'users-alt';

type ProblemSolutionCardProps = {
  title: string;
  subtitle: string;
  key?: string;
  icon: CustomIcons;
};

const ProblemSolutionCard = ({ title, subtitle, icon, key }: ProblemSolutionCardProps) => (
  <CardContainer key={key}>
    <IconContainer>
      <Image src={`/industries/icons/${icon}.svg`} alt={icon} width={72} height={72} />
    </IconContainer>
    <TextContainer>
      <Text variant="label-1" tag="h3">
        {title}.<Subtitle tag="span">{subtitle}</Subtitle>
      </Text>
    </TextContainer>
  </CardContainer>
);

const CardContainer = styled(Stack)`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    flex-direction: column;
    gap: ${theme.spacing[5]};
    background: ${theme.backgroundColor.primary};
  `}
`;

const TextContainer = styled(Box)`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[9]} ${theme.spacing[9]} ${theme.spacing[9]};
  `}
`;

const IconContainer = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    height: fit-content;
    width: fit-content;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[9]} ${theme.spacing[7]} 0 ${theme.spacing[7]};
  `}
`;

const Subtitle = styled(Box)`
  ${({ theme }) => css`
    ${createFontStyles('body-1')}
    color: ${theme.color.tertiary};
    padding-left: ${theme.spacing[2]};
  `}
`;

export default ProblemSolutionCard;
