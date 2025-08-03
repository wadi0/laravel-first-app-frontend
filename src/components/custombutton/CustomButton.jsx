import React from 'react';
import "./custombutton.scss";

const CustomSubmitButton = (props) => {
  const handleClick = (e) => {
    if (props.type !== "submit" && props.onClick) {
      e.preventDefault(); // submit নয় এমন বাটনে prevent
      props.onClick(e);
    }
  };

    const isDefault = !props.btnClassName || props.btnClassName.includes('default-submit');

  return (
    <button
      type={props.type || "button"}
      onClick={handleClick}
      disabled={props.isLoading}
            className={`${isDefault ? "default-submit-btn" : ""} ${props.btnClassName || ''}`}
      // className={`default-submit-btn ${props.btnClassName || ''}`}
    >
      <div className="btn-content">
        {props.isLoading && <div className="spinner" />}
        {props.icon ? props.icon : null}
        <span>{props.label}</span>
      </div>
    </button>
  );
};

export default CustomSubmitButton;


// 🧪 উদাহরণ ১: Formik সহ
// <Formik initialValues={...} onSubmit={handleSubmit}>
//   <Form>
//     <CustomSubmitButton
//       isLoading={loading}
//       type="submit"
//       label="Login"
//     />
//   </Form>
// </Formik>


// 🧪 উদাহরণ ২: Formik ছাড়া
// <CustomSubmitButton
//   isLoading={loading}
//   type="button"
//   label="Delete"
//   onClick={() => {
//     console.log("Delete button clicked!");
//     // custom delete logic
//   }}
// />
