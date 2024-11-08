import { TextField } from "@material-ui";
import { useStyles } from "../../styles";

const InputField = ({
  placeholder,
  type,
  onChange,
  name,
  value,
  InputProps,
  disabled,
  error,
  helperText,
  inputMode,
  size,
  autoFocus,
  variant,
  // defaultValue,
}) => {
  const classes = useStyles();
  return (
    <TextField
      className={classes.inputFields}
      placeholder={placeholder}
      type={type}
      onChange={onChange}
      name={name}
      value={value}
      InputProps={InputProps}
      disabled={disabled}
      error={error}
      helperText={helperText}
      inputMode={inputMode}
      fullWidth
      variant={variant ? variant : "outlined"}
      size={size ? size : "small"}
      autoFocus={autoFocus ? autoFocus : false}
      autoComplete={"off"}
    
    />
  );
};

export default InputField;
