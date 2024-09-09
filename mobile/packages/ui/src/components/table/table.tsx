import type { Icon } from '@onefootprint/icons';
import React, { Fragment } from 'react';

import Box from '../box';
import Divider from '../divider';
import Pressable from '../pressable';
import Typography from '../typography';

export type TableProps = {
  options: { label: string; options: TableOption[] }[];
};

export type TableOption = {
  content: React.ReactNode;
  endIcon?: Icon;
  endText?: string;
  onPress?: () => void;
  startIcon?: Icon;
  'aria-label': string;
};

const Table = ({ options }: TableProps) => (
  <Box gap={4}>
    {options.map(group => (
      <Box
        backgroundColor="primary"
        borderColor="primary"
        borderRadius="default"
        borderWidth={1}
        key={group.label}
        role="list"
      >
        {group.options.map(
          (
            { 'aria-label': ariaLabel, content, endIcon: EndIcon, endText, onPress, startIcon: StartIcon },
            optionIndex,
          ) => {
            const isLast = optionIndex === group.options.length - 1;
            return (
              <Fragment key={ariaLabel}>
                <Pressable
                  onPress={() => {
                    onPress?.();
                  }}
                >
                  <Box
                    alignItems="center"
                    aria-label={ariaLabel}
                    flexDirection="row"
                    gap={3}
                    justifyContent="space-around"
                    paddingHorizontal={4}
                    paddingVertical={5}
                    role="listitem"
                  >
                    {StartIcon && (
                      <Box>
                        <StartIcon />
                      </Box>
                    )}
                    <Box flexGrow={1} alignItems="flex-start">
                      {typeof content === 'string' ? <Typography variant="body-2">{content}</Typography> : content}
                    </Box>
                    {endText && (
                      <Typography color="tertiary" variant="body-3">
                        {endText}
                      </Typography>
                    )}
                    {EndIcon && (
                      <Box>
                        <EndIcon />
                      </Box>
                    )}
                  </Box>
                </Pressable>
                {isLast ? null : <Divider />}
              </Fragment>
            );
          },
        )}
      </Box>
    ))}
  </Box>
);

export default Table;
