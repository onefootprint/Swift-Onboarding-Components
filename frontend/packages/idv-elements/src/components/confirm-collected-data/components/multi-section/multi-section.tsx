import { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Divider, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

import Section, { SectionProps } from '../section';

type MultiSectionProps = {
  title: string;
  editLabel?: string;
  onEdit: () => void;
  sections: SectionProps[];
  IconComponent: Icon;
  testID?: string;
};

const MultiSection = ({
  title,
  editLabel,
  onEdit,
  sections,
  IconComponent,
  testID,
}: MultiSectionProps) => (
  <Container data-testid={testID}>
    <Header>
      <TitleContainer>
        <IconComponent />
        <Typography sx={{ marginLeft: 2 }} variant="label-2">
          {title}
        </Typography>
      </TitleContainer>
      {editLabel && <LinkButton onClick={onEdit}>{editLabel}</LinkButton>}
    </Header>
    <Sections>
      {sections.map((section: SectionProps, index: number) => (
        <React.Fragment key={section.title}>
          <Section
            actions={section.actions}
            key={section.title}
            title={section.title}
            content={section.content}
          />
          {index !== sections.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Sections>
  </Container>
);

const Sections = styled.div`
  ${({ theme }) => css`
    width: 100%;
    gap: ${theme.spacing[7]};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    > * {
      border: 0;
      padding: 0;
    }
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

export default MultiSection;
