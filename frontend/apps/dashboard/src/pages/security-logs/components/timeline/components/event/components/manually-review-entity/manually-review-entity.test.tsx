import { getAuditEventDetail } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import ManuallyReviewEntity from './manually-review-entity';

describe('<ManuallyReviewEntity />', () => {
  it('renders correctly for a user review', () => {
    const detail = getAuditEventDetail({
      kind: 'manually_review_entity',
      data: {
        decisionStatus: 'fail',
        fpId: 'user123',
        kind: 'person',
      },
    });

    customRender(<ManuallyReviewEntity detail={detail} hasPrincipalActor={false} />);

    const userLink = screen.getByRole('link', { name: 'user' });
    expect(userLink).toHaveAttribute('href', '/users/user123');
    expect(userLink).toHaveAttribute('target', '_blank');
  });

  it('renders correctly for a business review', () => {
    const detail = getAuditEventDetail({
      kind: 'manually_review_entity',
      data: {
        decisionStatus: 'pass',
        fpId: 'business123',
        kind: 'business',
      },
    });

    customRender(<ManuallyReviewEntity detail={detail} hasPrincipalActor={true} />);

    const businessLink = screen.getByRole('link', { name: 'business' });
    expect(businessLink).toHaveAttribute('href', '/businesses/business123');
    expect(businessLink).toHaveAttribute('target', '_blank');
  });

  it('renders fail status correctly for a user review', () => {
    const detail = getAuditEventDetail({
      kind: 'manually_review_entity',
      data: {
        decisionStatus: 'fail',
        fpId: 'user456',
        kind: 'person',
      },
    });

    customRender(<ManuallyReviewEntity detail={detail} hasPrincipalActor={true} />);

    const manuallyReviewedAnd = screen.getByText('manually reviewed and');
    expect(manuallyReviewedAnd).toBeInTheDocument();
    const markedA = screen.getByText('marked a');
    expect(markedA).toBeInTheDocument();
    const asFail = screen.getByText('as fail.');
    expect(asFail).toBeInTheDocument();
  });

  it('renders pass status correctly for a business review', () => {
    const detail = getAuditEventDetail({
      kind: 'manually_review_entity',
      data: {
        decisionStatus: 'pass',
        fpId: 'business456',
        kind: 'business',
      },
    });

    customRender(<ManuallyReviewEntity detail={detail} hasPrincipalActor={false} />);

    const manuallyReviewedAnd = screen.getByText('Manually reviewed and');
    expect(manuallyReviewedAnd).toBeInTheDocument();
    const markedA = screen.getByText('marked a');
    expect(markedA).toBeInTheDocument();
    const asPass = screen.getByText('as pass.');
    expect(asPass).toBeInTheDocument();
  });
});
