type ErrorProps = {
  message: string;
};

const ErrorComponent = ({ message }: ErrorProps) => <p className="text-body-2 text-secondary">{message}</p>;

export default ErrorComponent;
