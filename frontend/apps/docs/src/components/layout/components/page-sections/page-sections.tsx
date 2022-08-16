import IcoFileText16 from 'icons/ico/ico-file-text-16';
import React from 'react';
import styled from 'styled-components';
import { Typography } from 'ui';

// TODO:
// https://linear.app/footprint/issue/FP-1075/add-section-on-this-page
const PageSections = () => (
  <Container>
    <Typography variant="label-3">
      <IcoFileText16 />
      On this page
    </Typography>
    <ul>
      <li>
        <a href="#getting-started">
          <Typography variant="label-3">Getting started</Typography>
        </a>
      </li>
      <li>
        <a href="#getting-started">
          <Typography variant="body-3" color="tertiary">
            Add Footprint.js to your app
          </Typography>
        </a>
      </li>
      <li>
        <a href="#getting-started">
          <Typography variant="body-3" color="tertiary">
            Verify the Footprint token server-side
          </Typography>
        </a>
      </li>
    </ul>
  </Container>
);

const Container = styled.div`
  a {
    text-decoration: none;
  }
`;

export default PageSections;
