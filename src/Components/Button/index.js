import { LoadingButton } from "@mui/lab";
import { useStyles } from "../../styles";

const Button = ({ label, onClick, type, disabled, loading ,id}) => {
  const classes = useStyles();
  return (
    <LoadingButton
      className={classes.commonButton}
      onClick={onClick}
      type={type}
      disabled={disabled}
      variant="contained"
      loadingPosition="center"
      loading={loading ? loading : false}
      fullWidth
      id={id}
    >
      {label}
    </LoadingButton>
  );
};

export default Button;
