import type { Icon } from '@onefootprint/icons';
import { Divider, LinkButton, Stack, Text } from '@onefootprint/ui';
import React from 'react';

import type { SectionProps } from '../section';
import Section from '../section';

type MultiSectionProps = {
  title: string;
  editLabel?: string;
  onEdit: () => void;
  sections: SectionProps[];
  IconComponent: Icon;
  testID?: string;
};

const MultiSection = ({ title, editLabel, onEdit, sections, IconComponent, testID }: MultiSectionProps) => (
  <Stack
    data-testid={testID}
    width="100%"
    borderColor="tertiary"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    padding={6}
    borderRadius="default"
    borderStyle="solid"
    borderWidth={1}
  >
    <Stack width="100%" justifyContent="space-between" alignItems="center" marginBottom={7}>
      <Stack flexDirection="row" justifyContent="center" alignItems="center">
        <IconComponent />
        <Text marginLeft={2} variant="label-2">
          {title}
        </Text>
      </Stack>
      {editLabel ? <LinkButton onClick={onEdit}>{editLabel}</LinkButton> : null}
    </Stack>
    <Stack width="100%" flexDirection="column" justifyContent="center" alignItems="center" gap={7}>
      {sections.map((section: SectionProps, index: number) => (
        <React.Fragment key={section.title}>
          <Section
            actions={section.actions}
            key={section.title}
            title={section.title}
            content={section.content}
            noBorder
          />
          {index !== sections.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Stack>
  </Stack>
);

export default MultiSection;
