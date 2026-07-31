import React from 'react';

interface IErrorProps {
  errorMessage: string;
}

const ErrorMessage: React.FC<IErrorProps> = (props: IErrorProps) => {
  const { errorMessage } = props;

  return (
    <div className="absolute h-1/5 w-2/4 top-1/3 left-1/4 flex justify-center items-center bg-slate-200 z-30 rounded-[5px]">
      {errorMessage}
    </div>
  );
};

export default ErrorMessage;
