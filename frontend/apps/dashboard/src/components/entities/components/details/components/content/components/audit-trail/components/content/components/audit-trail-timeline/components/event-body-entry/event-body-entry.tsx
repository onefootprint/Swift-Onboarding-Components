import { IcoCheck16, Icon } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const LINE_HEIGHT = '26px';

type EventBodyEntryProps = {
  content: string | JSX.Element;
  testID?: string;
  iconComponent?: Icon;
};

const EventBodyEntry = ({
  content,
  testID,
  iconComponent: IconComponent = IcoCheck16,
}: EventBodyEntryProps) => (
  <Container data-testid={testID}>
    <IconBounds>
      <IconComponent />
    </IconBounds>
    <Content>{content}</Content>
  </Container>
);

const Container = styled.div`
  ${createFontStyles('body-3')};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
`;

const IconBounds = styled.div`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]};
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${LINE_HEIGHT};
    width: ${LINE_HEIGHT};
  `}
`;

const Content = styled.div`
  min-height: ${LINE_HEIGHT};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  & > * {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
  }
`;

export default EventBodyEntry;
