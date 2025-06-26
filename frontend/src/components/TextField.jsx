
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Reusable TextField Component
const TextField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  disabled = false,
  required = false,
  className = "",
  showPasswordToggle = false,
  autoComplete = "off", // Added autocomplete prop with default "off"
  disableAutocomplete = true, // New prop to aggressively disable autocomplete
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="form-control">
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Hidden dummy input to trick browsers */}
          {disableAutocomplete && (
            <input
              type="text"
              style={{
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
                opacity: 0,
                pointerEvents: 'none'
              }}
              tabIndex={-1}
            />
          )}
          
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5" />
            </div>
          )}

          <input
            type={inputType}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
              Icon ? "pl-10" : ""
            } ${showPasswordToggle ? "pr-10" : ""} ${
              error
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : ""
            } ${disabled ? "cursor-not-allowed" : ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            autoComplete={disableAutocomplete ? "new-password" : autoComplete}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name={disableAutocomplete ? `field_${Math.random().toString(36).substr(2, 9)}` : props.name}
            data-lpignore="true" // LastPass ignore
            data-form-type="other" // Additional browser hint
            {...(disableAutocomplete ? {} : props)}
            {...(disableAutocomplete ? { ...props, name: undefined } : {})}
          />

          {showPasswordToggle && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-sm">{error}</p>}
    </div>
  );
};

export default TextField;