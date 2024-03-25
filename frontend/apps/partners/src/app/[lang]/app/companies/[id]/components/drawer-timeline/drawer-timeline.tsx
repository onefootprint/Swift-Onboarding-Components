import { IcoClock16, IcoPencil16, IcoUpload16 } from '@onefootprint/icons';
import { Drawer, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type DrawerTimelineProps = { isOpen?: boolean; onClose: () => void };

const DrawerTimeline = ({ isOpen, onClose }: DrawerTimelineProps) => {
  const { t } = useTranslation('common');

  return isOpen ? (
    <Drawer
      onClickOutside={onClose}
      onClose={onClose}
      open={isOpen}
      title={t('doc.document-history')}
    >
      <Stack flexDirection="column" gap={8}>
        <Stack flexDirection="row" gap={5}>
          <VerticalLine>
            <IcoClock16 />
          </VerticalLine>
          <Stack flexDirection="column" flexGrow={1}>
            <Stack flexDirection="row" justifyContent="space-between">
              <Text variant="label-3">Waiting for review</Text>
              <Text tag="span" variant="body-4" color="tertiary" flexShrink={0}>
                Feb 7, 2024, 10:12 AM
              </Text>
            </Stack>
            <div>
              <TextWithSideMargin tag="span" variant="label-3">
                ·
              </TextWithSideMargin>
              <Text tag="span" variant="body-3" color="tertiary">
                Assigned to&nbsp;
              </Text>
              <Text tag="strong" variant="label-3" color="primary">
                John Garcia&nbsp;
              </Text>
              <Text tag="span" variant="body-3" color="tertiary">
                from&nbsp;
              </Text>
              <Text tag="strong" variant="label-3" color="primary">
                Evolve
              </Text>
            </div>
          </Stack>
        </Stack>

        <Stack flexDirection="row" gap={4}>
          <VerticalLine>
            <IcoUpload16 />
          </VerticalLine>
          <Stack flexDirection="column" flexGrow={1}>
            <Stack flexDirection="row" justifyContent="space-between">
              <div>
                <Text tag="strong" variant="label-3" color="primary">
                  Mike Stones&nbsp;
                </Text>
                <Text tag="span" variant="body-3" color="tertiary">
                  from&nbsp;
                </Text>
                <Text tag="strong" variant="label-3" color="primary">
                  Coba&nbsp;
                </Text>
                <Text tag="span" variant="body-3" color="tertiary">
                  uploaded the document
                </Text>
              </div>
              <Text tag="span" variant="body-4" color="tertiary" flexShrink={0}>
                Feb 7, 2024, 10:12 AM
              </Text>
            </Stack>
            <div>Body</div>
          </Stack>
        </Stack>

        <Stack flexDirection="row" gap={4}>
          <VerticalLine>
            <IcoPencil16 />
          </VerticalLine>
          <Stack flexDirection="column" flexGrow={1}>
            <Stack flexDirection="row" justifyContent="space-between">
              <div>
                <Text tag="strong" variant="label-3" color="primary">
                  John Garcia&nbsp;
                </Text>
                <Text tag="span" variant="body-3" color="tertiary">
                  from&nbsp;
                </Text>
                <Text tag="strong" variant="label-3" color="primary">
                  Evolve&nbsp;
                </Text>
                <Text tag="span" variant="body-3" color="tertiary">
                  reviewed the document
                </Text>
              </div>
              <Text tag="span" variant="body-4" color="tertiary" flexShrink={0}>
                Feb 7, 2024, 10:12 AM
              </Text>
            </Stack>
            <div>
              <TextWithSideMargin tag="span" variant="label-3" color="error">
                ·
              </TextWithSideMargin>
              <Text tag="span" variant="body-3" color="error">
                Document rejected. A new upload is required.
              </Text>
              <TextWithPadding
                tag="p"
                variant="body-3"
                color="primary"
                backgroundColor="secondary"
                marginTop={5}
              >
                ”Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat labore et dolore magna
                aliqua. Dolor sit amet, enim ad minim veniam.”
              </TextWithPadding>
            </div>
          </Stack>
        </Stack>

        <Stack flexDirection="row" gap={4}>
          <VerticalLine>
            <IcoClock16 />
          </VerticalLine>
          <Stack flexDirection="column" flexGrow={1}>
            <Stack flexDirection="row" justifyContent="space-between">
              <Text variant="label-3">Waiting for review</Text>
              <Text tag="span" variant="body-4" color="tertiary" flexShrink={0}>
                Feb 7, 2024, 10:12 AM
              </Text>
            </Stack>
            <div>
              <TextWithSideMargin tag="span" variant="label-3">
                ·
              </TextWithSideMargin>
              <Text tag="span" variant="body-3" color="tertiary">
                Assigned to&nbsp;
              </Text>
              <Text tag="strong" variant="label-3" color="primary">
                John Garcia&nbsp;
              </Text>
              <Text tag="span" variant="body-3" color="tertiary">
                from&nbsp;
              </Text>
              <Text tag="strong" variant="label-3" color="primary">
                Evolve
              </Text>
            </div>
          </Stack>
        </Stack>

        <Stack flexDirection="row" gap={4}>
          <VerticalLine>
            <IcoUpload16 />
          </VerticalLine>
          <Stack flexDirection="column" flexGrow={1}>
            <Stack flexDirection="row" justifyContent="space-between">
              <div>
                <Text tag="strong" variant="label-3" color="primary">
                  Mike Stones&nbsp;
                </Text>
                <Text tag="span" variant="body-3" color="tertiary">
                  from&nbsp;
                </Text>
                <Text tag="strong" variant="label-3" color="primary">
                  Coba&nbsp;
                </Text>
                <Text tag="span" variant="body-3" color="tertiary">
                  uploaded the document
                </Text>
              </div>
              <Text tag="span" variant="body-4" color="tertiary" flexShrink={0}>
                Feb 7, 2024, 10:12 AM
              </Text>
            </Stack>
            {/* <div>Body</div> */}
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  ) : null;
};

const VerticalLine = styled.div`
  ${({ theme }) => css`
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: ${theme.spacing[7]};
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      border-left: 2px solid ${theme.color.senary};
    }
  `};
`;

const TextWithSideMargin = styled(Text)`
  margin: 0 10px;
`;

const TextWithPadding = styled(Text)`
  ${({ theme }) => css`
    padding: 6px ${theme.spacing[4]};
  `};
`;

export default DrawerTimeline;
