import { customRender, screen } from '@onefootprint/test-utils';
import { Document } from '@onefootprint/types';
import React from 'react';

import ConfidenceScores from './confidence-scores';
import documentFixture, {
  documentWithNoScores,
  documentWithOneScore,
  documentWithTwoScores,
} from './confidence-scores.test.config';

const renderConfidenceScores = (document: Document) =>
  customRender(<ConfidenceScores document={document} />);

describe('<ConfidenceScores />', () => {
  it('should render all labels properly', () => {
    renderConfidenceScores(documentFixture);
    expect(screen.getByText('Scores')).toBeInTheDocument();
    expect(screen.getByText('Face match')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('Extracted data')).toBeInTheDocument();
  });

  it('should render all scores properly', () => {
    renderConfidenceScores(documentFixture);
    expect(screen.getByText('50/')).toBeInTheDocument();
    expect(screen.getByText('55/')).toBeInTheDocument();
  });

  it('should render properly when just two scores defined', () => {
    renderConfidenceScores(documentWithTwoScores);
    expect(screen.getByText('Scores')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('55/')).toBeInTheDocument();
    expect(screen.getByText('Extracted data')).toBeInTheDocument();
    expect(screen.getByText('45/')).toBeInTheDocument();

    expect(screen.queryByText('Face match')).not.toBeInTheDocument();
  });

  it('should render properly when just one score defined', () => {
    renderConfidenceScores(documentWithOneScore);
    expect(screen.getByText('Scores')).toBeInTheDocument();
    expect(screen.getByText('Extracted data')).toBeInTheDocument();
    expect(screen.getByText('45/')).toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Face match')).not.toBeInTheDocument();
  });

  it('should render null when no scores defined', () => {
    renderConfidenceScores(documentWithNoScores);
    expect(screen.queryByText('Extracted data')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Face match')).not.toBeInTheDocument();
    expect(screen.queryByText('Scores')).not.toBeInTheDocument();
  });
});
