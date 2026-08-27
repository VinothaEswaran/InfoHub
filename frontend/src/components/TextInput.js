import React from 'react';

const font = '"Times New Roman",Times,serif';

/**
 * Styled text / email / password input with optional icon.
 * Props: label, name, type, value, onChange, placeholder, icon (React node),
 *        disabled, required, rightIcon (React node — e.g. show/hide toggle)
 */
export default function TextInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  rightIcon,
  disabled = false,
  required = false,
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block text-slate-400 text-xs mb-1.5"
          style={{ fontFamily: font }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all
            placeholder-slate-500 focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(108,63,197,0.25)',
            fontFamily: font,
            paddingLeft: icon ? '2.75rem' : undefined,
            paddingRight: rightIcon ? '3rem' : undefined,
          }}
        />
        {rightIcon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
}
