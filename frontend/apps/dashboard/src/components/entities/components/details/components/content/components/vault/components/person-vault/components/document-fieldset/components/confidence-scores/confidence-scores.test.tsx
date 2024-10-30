import { customRender, screen } from '@onefootprint/test-utils';
import type { Document } from '@onefootprint/types';

import ConfidenceScores from './confidence-scores';
import {
  documentWithNoScores,
  documentWithOneScore,
  documentWithTwoScores,
  documentWithZeroScores,
} from './confidence-scores.test.config';

const renderConfidenceScores = (document: Document) => customRender(<ConfidenceScores document={document} />);

describe('<ConfidenceScores />', () => {
  it('should render properly when just two scores defined', () => {
    renderConfidenceScores(documentWithTwoScores);

    const scoresLabel = screen.getByText('Scores');
    expect(scoresLabel).toBeInTheDocument();
    const documentLabel = screen.getByText('Document');
    expect(documentLabel).toBeInTheDocument();
    const documentScore = screen.getByText('55/');
    expect(documentScore).toBeInTheDocument();
    const ocrLabel = screen.getByText('Extracted data');
    expect(ocrLabel).toBeInTheDocument();
    const ocrScore = screen.getByText('45/');
    expect(ocrScore).toBeInTheDocument();
    const faceMatchLabel = screen.queryByText('Face match');
    expect(faceMatchLabel).not.toBeInTheDocument();
  });

  it('should render properly when just one score defined', () => {
    renderConfidenceScores(documentWithOneScore);

    const scoresLabel = screen.getByText('Scores');
    expect(scoresLabel).toBeInTheDocument();
    const ocrLabel = screen.getByText('Extracted data');
    expect(ocrLabel).toBeInTheDocument();
    const ocrScore = screen.getByText('45/');
    expect(ocrScore).toBeInTheDocument();
    const documentLabel = screen.queryByText('Document');
    expect(documentLabel).not.toBeInTheDocument();
    const faceMatchLabel = screen.queryByText('Face match');
    expect(faceMatchLabel).not.toBeInTheDocument();
  });

  it('should render null when no scores defined', () => {
    renderConfidenceScores(documentWithNoScores);

    const ocrLabel = screen.queryByText('Extracted data');
    expect(ocrLabel).not.toBeInTheDocument();
    const documentLabel = screen.queryByText('Document');
    expect(documentLabel).not.toBeInTheDocument();
    const faceMatchLabel = screen.queryByText('Face match');
    expect(faceMatchLabel).not.toBeInTheDocument();
    const scoresLabel = screen.queryByText('Scores');
    expect(scoresLabel).not.toBeInTheDocument();
  });

  it('should render three scores when they are all 0 when no scores defined', () => {
    renderConfidenceScores(documentWithZeroScores);

    const scoresLabel = screen.getByText('Scores');
    expect(scoresLabel).toBeInTheDocument();
    const faceMatchLabel = screen.getByText('Face match');
    expect(faceMatchLabel).toBeInTheDocument();
    const documentLabel = screen.getByText('Document');
    expect(documentLabel).toBeInTheDocument();
    const ocrLabel = screen.getByText('Extracted data');
    expect(ocrLabel).toBeInTheDocument();
    const scores = screen.getAllByText('0/');
    expect(scores).toHaveLength(3);
  });
});
