type HeaderProps = {
  title: string;
  subtitle: string;
};

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="mb-6">
      <h1 className="text-heading-3 text-primary mb-2">{title}</h1>
      <h2 className="text-body-2 text-secondary">{subtitle}</h2>
    </header>
  );
};

export default Header;
