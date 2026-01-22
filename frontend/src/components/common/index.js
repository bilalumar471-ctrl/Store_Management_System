// Loading Spinner
export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
    <p className="mt-4 text-gray-600 font-medium">{message}</p>
  </div>
);

// Error Alert
export const ErrorAlert = ({ message, onClose }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg">
    <div className="flex justify-between items-start">
      <div className="flex items-start">
        <span className="text-2xl mr-3">❌</span>
        <div>
          <p className="font-semibold text-red-800">Error</p>
          <p className="text-red-700">{message}</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-red-500 hover:text-red-700 font-bold text-xl">
          ×
        </button>
      )}
    </div>
  </div>
);

// Success Alert
export const SuccessAlert = ({ message, onClose }) => (
  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg">
    <div className="flex justify-between items-start">
      <div className="flex items-start">
        <span className="text-2xl mr-3">✅</span>
        <div>
          <p className="font-semibold text-green-800">Success</p>
          <p className="text-green-700">{message}</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-green-500 hover:text-green-700 font-bold text-xl">
          ×
        </button>
      )}
    </div>
  </div>
);

// Card Component
export const Card = ({ title, icon, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
    {title && (
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          {icon && <span className="mr-3 text-3xl">{icon}</span>}
          {title}
        </h2>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button', 
  disabled = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};