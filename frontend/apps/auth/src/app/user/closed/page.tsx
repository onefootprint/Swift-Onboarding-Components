import SvgSafeAndPenguin from '../../../components/svg/svg-safe-penguin';

const UserClosedPage = () => (
  <main id="__next" data-variant="modal">
    <div style={{ maxWidth: '480px', textAlign: 'center' }}>
      <div style={{ padding: '23px' }}>
        <SvgSafeAndPenguin />
      </div>
      <h3 style={{ fontFamily: 'var(--font-family-default)', fontSize: '19px', marginBottom: '11px' }}>
        Your data is safe and secure!
      </h3>
      <p style={{ fontFamily: 'var(--font-family-default)', fontSize: '15px' }}>You can now close this tab.</p>
    </div>
  </main>
);

export default UserClosedPage;
