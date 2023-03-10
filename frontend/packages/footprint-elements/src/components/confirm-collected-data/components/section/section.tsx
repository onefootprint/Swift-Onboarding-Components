import { Color } from '@onefootprint/design-tokens';
import { Icon } from '@onefootprint/icons';
import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SectionItem from '../section-item';

export type SectionProps = {
  title: string;
  items: {
    text: string;
    subtext?: string;
    textColor?: Color;
  }[];
  editLabel?: string;
  onEdit?: () => void;
  IconComponent?: Icon;
};

const Section = ({
  title,
  editLabel,
  IconComponent,
  onEdit,
  items,
}: SectionProps) => (
  <Container>
    <Header>
      <TitleContainer>
        {IconComponent && <IconComponent />}
        <Typography sx={{ marginLeft: 2 }} variant="label-2">
          {title}
        </Typography>
      </TitleContainer>
      {onEdit && editLabel && (
        <LinkButton onClick={onEdit}>{editLabel}</LinkButton>
      )}
    </Header>
    <SectionContent>
      {items.map(({ text, subtext, textColor }) => (
        <SectionItem
          key={text}
          text={text}
          subtext={subtext}
          textColor={textColor}
        />
      ))}
    </SectionContent>
  </Container>
);

const SectionContent = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    row-gap: ${theme.spacing[7]};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[6]};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing[7]};
  `}
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: center;
`;

export default Section;
