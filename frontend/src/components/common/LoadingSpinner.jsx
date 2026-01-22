// src/components/common/LoadingSpinner.jsx
export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
};

// src/components/common/ErrorAlert.jsx
export const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <span className="text-2xl mr-3">❌</span>
          <div>
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-700">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 font-bold text-xl"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// src/components/common/SuccessAlert.jsx
export const SuccessAlert = ({ message, onClose }) => {
  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <span className="text-2xl mr-3">✅</span>
          <div>
            <h3 className="text-green-800 font-semibold">Success</h3>
            <p className="text-green-700">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-700 font-bold text-xl"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// src/components/common/Card.jsx
export const Card = ({ children, title, icon, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {title && (
        <div className="flex items-center mb-4 pb-4 border-b-2 border-gray-100">
          {icon && <span className="text-3xl mr-3">{icon}</span>}
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

// src/components/common/Button.jsx
export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  type = 'button',
  disabled = false,
  className = '' 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};