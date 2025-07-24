import React, { useState, useCallback } from "react";
import { useField, useFormikContext } from "formik";
import Cropper from "react-easy-crop";
import "./customFileUpload.scss";
import getCroppedImg from "./CropImage.jsx";
import {Button, Slider} from "@mui/material";

const CustomFileUploadWithPreview = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const { setFieldValue } = useFormikContext();
  const error = meta.touched && meta.error;

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageDataUrl = await readFile(file);
    setImageSrc(imageDataUrl);
  };

  const showCroppedImage = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFieldValue(field.name, croppedBlob);
      setImageSrc(null); // remove crop UI
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`custom-input ${error ? "error" : ""}`}>
      {label && <label htmlFor={props.id || props.name}>{label}</label>}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {imageSrc && (
        <div className="crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e, zoom) => setZoom(zoom)}
          />
          <Button onClick={showCroppedImage} variant="contained">
            Crop Image
          </Button>
        </div>
      )}
      {error && <small className="error-text">{meta.error}</small>}
    </div>
  );
};

export default CustomFileUploadWithPreview;

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.readAsDataURL(file);
  });
}