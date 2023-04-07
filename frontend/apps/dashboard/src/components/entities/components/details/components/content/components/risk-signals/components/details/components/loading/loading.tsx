import { Box, Grid, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box testID="risk-signal-details-loading" aria-busy>
    <Box id="overview-shimmer" sx={{ marginBottom: 9 }}>
      <Box id="overview-title" sx={{ marginBottom: 6 }}>
        <Shimmer
          sx={{
            width: '71px',
            height: '24px',
          }}
        />
      </Box>
      <Box id="data-vendor" sx={{ marginBottom: 7 }}>
        <Box sx={{ marginBottom: 2 }}>
          <Shimmer
            sx={{
              width: '87px',
              height: '20px',
            }}
          />
        </Box>
        <Box>
          <Shimmer
            sx={{
              width: '59px',
              height: '20px',
            }}
          />
        </Box>
      </Box>
      <Grid.Row>
        <Grid.Column col={6}>
          <Box id="severity" sx={{ marginBottom: 7 }}>
            <Box sx={{ marginBottom: 2 }}>
              <Shimmer
                sx={{
                  width: '58px',
                  height: '20px',
                }}
              />
            </Box>
            <Box>
              <Shimmer
                sx={{
                  width: '28px',
                  height: '20px',
                }}
              />
            </Box>
          </Box>
        </Grid.Column>
        <Grid.Column col={6}>
          <Box id="scope" sx={{ marginBottom: 7 }}>
            <Box sx={{ marginBottom: 2 }}>
              <Shimmer
                sx={{
                  width: '45px',
                  height: '20px',
                }}
              />
            </Box>
            <Box>
              <Shimmer
                sx={{
                  width: '58px',
                  height: '20px',
                }}
              />
            </Box>
          </Box>
        </Grid.Column>
      </Grid.Row>
      <Box id="note" sx={{ marginBottom: 6 }}>
        <Box sx={{ marginBottom: 2 }}>
          <Shimmer
            sx={{
              width: '34px',
              height: '20px',
            }}
          />
        </Box>
        <Box>
          <Shimmer
            sx={{
              width: '139px',
              height: '20px',
            }}
          />
        </Box>
      </Box>
      <Box id="note-details" sx={{ marginBottom: 7 }}>
        <Box sx={{ marginBottom: 2 }}>
          <Shimmer
            sx={{
              width: '86px',
              height: '20px',
            }}
          />
        </Box>
        <Box>
          <Shimmer
            sx={{
              width: '452px',
              height: '80px',
            }}
          />
        </Box>
      </Box>
    </Box>
    <Box id="related-signals-shimmer" sx={{ marginBottom: 9 }}>
      <Box id="related-signals-title-shimmer" sx={{ marginBottom: 6 }}>
        <Shimmer
          sx={{
            width: '112px',
            height: '24px',
          }}
        />
      </Box>
      <Box id="related-signals-table-shimmer">
        <Shimmer
          sx={{
            width: '452px',
            height: '94px',
          }}
        />
      </Box>
    </Box>
    <Box id="raw-response-shimmer">
      <Box
        id="raw-response-title-shimmer"
        sx={{
          marginBottom: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Shimmer
            sx={{
              width: '105px',
              height: '24px',
            }}
          />
        </Box>
        <Box>
          <Shimmer
            sx={{
              width: '33px',
              height: '24px',
            }}
          />
        </Box>
      </Box>
      <Box>
        <Shimmer
          sx={{
            width: '452px',
            height: '135px',
          }}
        />
      </Box>
    </Box>
  </Box>
);

export default Loading;
