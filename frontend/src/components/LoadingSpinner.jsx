import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  let spinnerSize;

  switch (size) {
    case 'sm':
      spinnerSize = 'w-4 h-4 border-2';
      break;
    case 'lg':
      spinnerSize = 'w-8 h-8 border-4';
      break;
    case 'md':
    default:
      spinnerSize = 'w-6 h-6 border-3';
      break;
  }

  return (
    <div className={`${spinnerSize} border-t-transparent border-black animate-spin rounded-full`}></div>
  );
};

export default LoadingSpinner;
