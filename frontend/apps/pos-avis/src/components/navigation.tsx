import icoBack from '../images/ico-back.png';

const Navigation = ({ onClick }) => {
  return (
    <nav className="navigation">
      <button className="back-button" onClick={onClick} type="button">
        <img src={icoBack} width={24} height={24} alt="Go back" />
      </button>
    </nav>
  );
};

export default Navigation;
