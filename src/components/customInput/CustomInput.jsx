import {useField} from 'formik';
import "./customInput.scss";
import {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";

const CustomInput = ({...props}) => {
    const [field, meta] = useField(props);
    const error = meta.touched && meta.error;
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        field.onChange(e);
        if (props.inputOnChange) {
            props.inputOnChange(e);
        }
    };

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const isPassword = props.type === 'password';

    return (
        <div className={`custom-input ${error ? 'error' : ''}`}>
            {props.label &&
                <label
                    className={props.labelClassName ? props.labelClassName : ''}
                    htmlFor={props.id || props.name}
                >
                    {props.label}
                </label>}

            <div className="input-wrapper">
                <input
                    {...field}
                    {...props}
                    type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
                    onChange={handleChange}
                    className={`input-box ${field.value ? 'filled' : ''} ${props.inputClassName}`}
                />

                {isPassword && (
                    <span className="eye-toggle" onClick={togglePassword}>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye}/>
                    </span>
                )}
            </div>

            {error && <small className="error-text">{meta.error}</small>}
        </div>
    );
};

export default CustomInput;
