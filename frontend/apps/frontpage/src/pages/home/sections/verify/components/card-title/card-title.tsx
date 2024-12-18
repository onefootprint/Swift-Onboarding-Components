type CardTitleProps = {
  title: string;
  subtitle: string;
};

const CardTitle = ({ title, subtitle }: CardTitleProps) => (
  <div className="relative z-10 flex flex-col flex-shrink-0 gap-3 p-9">
    <h4 className="text-label-1">{title}</h4>
    <h5 className="text-body-2">{subtitle}</h5>
  </div>
);

export default CardTitle;
