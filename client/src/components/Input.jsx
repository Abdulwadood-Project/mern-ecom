const Input = ({
  label,
  id,
  type = 'text',
  error,
  className = '',
  required = false,
  as = 'input',
  children,
  ...rest
}) => {
  const inputId = id || rest.name;

  return (
    <div className={`form-field ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required"> *</span>}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea id={inputId} className={`form-control ${error ? 'is-invalid' : ''}`} {...rest} />
      ) : as === 'select' ? (
        <select id={inputId} className={`form-control ${error ? 'is-invalid' : ''}`} {...rest}>
          {children}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          {...rest}
        />
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
};

export default Input;
