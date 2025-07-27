import React, {useState, useCallback} from "react";
import {ErrorMessage, useField, useFormikContext} from "formik";
import Cropper from "react-easy-crop";
import {Button, Slider} from "@mui/material";
import "./customFileUpload.scss";
import getCroppedImg from "./CropImage.jsx";
import {FaCloudUploadAlt} from "react-icons/fa"; // your cropping util function

function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result));
        reader.readAsDataURL(file);
    });
}

const CustomFileUploadWithPreview = ({
                                         label,
                                         labelClassName = "",
                                         uploadText = "Upload File",
                                         accept = "*/*",
                                         previewWidth = 200,
                                         previewHeight = 200,
                                         cropperWidth = 400,
                                         cropperHeight = 300,
                                         icon: IconComponent = null,
                                         className = "",
                                         multiple = false,
                                         enableCrop = false,
                                         aspect = 1,
                                         ...props
                                     }) => {
    const [field, meta] = useField(props);
    const {setFieldValue} = useFormikContext();
    const error = meta.touched && meta.error;

    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [previewFiles, setPreviewFiles] = useState([]); // for multiple or single preview

    const onCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Handle file input change
    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (multiple) {
            // For multiple files, read all and set previews
            const allFiles = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const preview = await readFile(file);
                allFiles.push({file, preview});
            }
            setPreviewFiles(allFiles);
            // For formik field value, set array of files
            setFieldValue(field.name, Array.from(files));
            setImageSrc(null); // no crop UI for multiple
        } else {
            // Single file
            const file = files[0];
            if (enableCrop && file.type.startsWith("image/")) {
                const imageDataUrl = await readFile(file);
                setImageSrc(imageDataUrl);
            } else {
                const preview = await readFile(file);
                setPreviewFiles([{file, preview}]);
                setImageSrc(null);
            }
            setFieldValue(field.name, file);
        }
    };

    // Show cropped image & update formik field with cropped blob
    const showCroppedImage = async () => {
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            setFieldValue(field.name, croppedBlob);

            // Update preview with cropped image URL
            const croppedPreviewUrl = URL.createObjectURL(croppedBlob);
            setPreviewFiles([{file: croppedBlob, preview: croppedPreviewUrl}]);

            setImageSrc(null); // hide crop UI
        } catch (e) {
            console.error(e);
        }
    };

    // Remove preview & reset
    const handleRemovePreview = () => {
        setPreviewFiles([]);
        setImageSrc(null);
        setFieldValue(field.name, multiple ? [] : null);
    };

    return (
        <div className={`custom-file-upload-wrapper ${className}`} style={{marginBottom: "1rem"}}>
            {label && (
                <label
                    htmlFor={props.id || props.name}
                    className={labelClassName}
                    style={{display: "block", marginBottom: "6px", fontWeight: "bold", textAlign: "left"}}
                >
                    {label}
                </label>
            )}

            {/* If preview exists, show preview */}
            {previewFiles.length > 0 && (
                <div
                    className="preview-container"
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "8px",
                        justifyContent: "center",
                    }}
                >
                    {previewFiles.map(({preview}, idx) => (
                        <div
                            key={idx}
                            style={{
                                position: "relative",
                                width: previewWidth,
                                height: previewHeight,
                                borderRadius: "6px",
                                overflow: "hidden",
                                border: "1px solid #ccc",
                                backgroundColor: "#fafafa",
                            }}
                        >
                            {/* Only show img preview for images */}
                            {preview && (
                                <img
                                    src={preview}
                                    alt={`preview-${idx}`}
                                    style={{width: "100%", height: "100%", objectFit: "cover"}}
                                />
                            )}
                            <button
                                type="button"
                                onClick={handleRemovePreview}
                                style={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    background: "rgba(255,255,255,0.7)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: 24,
                                    height: 24,
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                                aria-label="Remove preview"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Show upload icon + text only if no preview or crop UI active */}
            {!imageSrc && previewFiles.length === 0 && (
                <label
                    htmlFor={props.id || props.name}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none",
                        gap: 6,
                        border: "2px dashed #007bff",
                        padding: "12px 24px",
                        borderRadius: "6px",
                        width: previewWidth,
                        height: previewHeight,
                        justifyContent: "center",
                        color: "#007bff",
                    }}
                >
                    {IconComponent && <IconComponent size={32}/>}
                    <span>{uploadText}</span>
                </label>
            )}

            <input
                id={props.id || props.name}
                type="file"
                accept={accept}
                style={{display: "none"}}
                multiple={multiple}
                onChange={handleFileChange}
                {...props}
            />

            {/* Crop UI */}
            {imageSrc && enableCrop && (
                <div
                    className="crop-container"
                    style={{
                        position: "relative",
                        width: cropperWidth,
                        height: cropperHeight,
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "#333",
                        borderRadius: "8px",
                        overflow: "hidden",
                    }}
                >
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        style={{
                            containerStyle: {width: "100%", height: "100%"},
                            mediaStyle: {borderRadius: "8px"},
                        }}
                    />
                    <Slider
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e, z) => setZoom(z)}
                        style={{marginTop: 12}}
                    />
                    <Button
                        onClick={showCroppedImage}
                        variant="contained"
                        color="primary"
                        style={{marginTop: 12}}
                    >
                        Crop & Upload
                    </Button>
                    <Button
                        onClick={() => {
                            setImageSrc(null);
                        }}
                        variant="outlined"
                        color="secondary"
                        style={{marginTop: 12, marginLeft: 8}}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {error && (
                <small
                    className="error-text"
                    style={{color: "red", display: "block", marginTop: "6px"}}
                >
                    {meta.error}
                </small>
            )}
        </div>
    );
};

export default CustomFileUploadWithPreview;


// <div className=" mb-3 mt-3">
//    <CustomFileUploadWithPreview
//       name="productImage"
//       label="Product Image"
//       labelClassName="my-label-class"
//       className="my-custom-upload"
//       uploadText="Click to Upload"
//       accept="image/*,video/*,.pdf,.doc,.docx"
//       previewWidth={250}
//       previewHeight={250}
//       cropperWidth={250}
//       cropperHeight={250}
//       icon={FaCloudUploadAlt}
//       multiple={false}
//       enableCrop={false}
//       aspect={1}
//     />
//     <ErrorMessage name="image" component="div" className="error-message"/>
// </div>