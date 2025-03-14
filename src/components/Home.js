import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AppBar, Box, CssBaseline, List, ListItem, ListItemText, Toolbar, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Grid } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { PieChart } from '@mui/x-charts/PieChart';
import Webcam from "react-webcam";
import CameraAltIcon from '@mui/icons-material/CameraAlt';


const Home = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [predictions, setPredictions] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploaded, setUploaded] = useState(false);
    const webcamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);

    // useEffect(() => {
    //     axios.get("http://localhost:5037/api/customvision/detect-defect")
    //         .then((response) => {
    //             if (response.data && response.data.predictions) {
    //                 const formattedPredictions = response.data.predictions.map(prediction => ({
    //                     name: prediction.tagName,
    //                     probability: (prediction.probability * 100).toFixed(2) + "%" // Convert to percentage
    //                 }));
    //                 setPredictions(formattedPredictions);
    //             }
    //         })
    //         .catch((error) => console.error("Error fetching predictions:", error));
    // }, []);


    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
            setImagePreview(URL.revokeObjectURL(imagePreview));
            setError("");
            setSuccessMessage("");
            setUploaded(false);
        } else {
            setFile(null);
            setImagePreview(null);
            setError("Please upload a valid image file.");
            setSuccessMessage("");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("No file selected.");
            setSuccessMessage("");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await fetch("http://localhost:5037/api/customvision/detect-defect", {
                method: "POST",
                body: formData,
                headers: { "Accept": "application/json" },
            });
            const result = await response.json();
            if (response.ok) {
                setSuccessMessage("Image uploaded successfully");
                setError("");
                setUploaded(true);
                setImagePreview(URL.createObjectURL(file));

                const sortedPredictions = result.predictions
                    .map(prediction => ({
                        name: prediction.tagName,
                        probability: (prediction.probability * 100) // Keep as number for Pie Chart
                    }))
                    .sort((a, b) => b.probability - a.probability);
                setPredictions(sortedPredictions);
            } else {
                setError(result.message || "Upload failed. Please try again.");
                setSuccessMessage("");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setError("Upload failed. Please try again.");
            setSuccessMessage("");
        }
    };

    const handleCancel = () => {
        setFile(null);
        setImagePreview(null);
        setUploaded(false);
        setSuccessMessage("");
        setPredictions([]);
    };





    // Capture and process images automatically
    useEffect(() => {
        const interval = setInterval(() => {
            if (isCapturing) captureImage();
        }, 90000); // Capture every 3 seconds

        return () => clearInterval(interval);
    }, [isCapturing]);

    const captureImage = async () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImagePreview(imageSrc);

            try {
                const formData = new FormData();
                formData.append("file", dataURLtoBlob(imageSrc)); // Convert to Blob

                const response = await axios.post(
                    "http://localhost:5037/api/customvision/detect-defect",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                if (response.data.predictions) {
                    const sortedPredictions = response.data.predictions
                        .map(prediction => ({
                            name: prediction.tagName,
                            probability: prediction.probability * 100, // Keep as a number
                        }))
                        .sort((a, b) => b.probability - a.probability);

                    setPredictions(sortedPredictions);
                }
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    };

    // Convert Base64 to Blob
    const dataURLtoBlob = (dataURL) => {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };


    return (

        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar sx={{ backgroundColor: "#0F4C5C" }}>

                <Toolbar>
                    <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                        <FontAwesomeIcon
                            icon={faEye}
                            style={{ color: "#ffffff", marginRight: "15px" }}
                        />
                        <Typography variant="h6" component="div">
                            Custom Vision
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    width: "100%",
                    flexGrow: -1,
                    padding: 3,
                    border: "2px solid #ccc",
                    borderRadius: "10px",
                    boxShadow: 3,
                    backgroundColor: "#f9f9f9",
                    overflow: "hidden",
                    // backgroundImage: "url('/home1.png')", // Path to the image in the public folder
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed",
                }}
            >
                <Paper
                    sx={{
                        height: "200px",
                        width: "300px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        p: 2,
                        cursor: "pointer",
                        mb: 2,
                        ml: "-450px"
                    }} >


                    {/* <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%"
                        height="100%"
                        videoConstraints={{ facingMode: "environment" }}
                    /> */}
                    <CameraAltIcon style={{ fontSize: 50, color: "#283618", marginTop: "10px" }} />

                </Paper>

                {/* Start & Stop Buttons */}
                {/* <Box sx={{ display: "flex", gap: 3, ml: "-30px" }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#5E0B15",
                            ml: "-350px",
                            fontWeight: "bold",
                            width: "130px",  // Button width
                            height: "40px",   // Button height
                            fontSize: "10px"  // Font size
                        }}
                        onClick={() => setIsCapturing(true)}
                    >
                        Start Detection
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{ color: "#1B4332", fontWeight: "bold", fontSize: "10px", mr: "10px", height: "40px", width: "130px", }}
                        onClick={() => setIsCapturing(false)}
                    >
                        Stop Detection
                    </Button>
                </Box> */}



                {/* File Upload Section */}
                <Paper
                    sx={{
                        height: "200px",
                        width: "300px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        p: 2,
                        cursor: "pointer",
                        mb: 2,
                        mr: "-380px",
                        mt: "-260px"
                    }}
                >

                    {!uploaded ? (
                        <label htmlFor="upload-input" style={{ cursor: "pointer", textAlign: "center" }}>
                            <CloudUploadIcon style={{ fontSize: 50, color: "#283618", marginBottom: "10px" }} />
                            <Typography>Upload Image</Typography>
                        </label>
                    ) : (
                        <img src={imagePreview} alt="Uploaded preview" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="upload-input" />
                </Paper>

                {/* Success Message */}
                {successMessage && (
                    <Typography variant="body1" color="green" sx={{ mb: 1 }}>
                        {successMessage}
                    </Typography>
                )}

                {/* Upload & Cancel Buttons */}
                {file && (
                    <Box sx={{ display: "flex", gap: 3, ml: "350px" }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#5E0B15",
                                fontWeight: "bold",

                            }}
                            onClick={handleUpload}
                        >
                            Upload
                        </Button>

                        <Button
                            variant="outlined"
                            sx={{
                                color: "#1B4332",
                                fontWeight: "bold",
                                "&:hover": { color: "#1B4332" }
                            }}
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </Box>
                )}

                {/* Display Predictions */}
                {predictions.length > 0 && (
                    <Paper sx={{ p: 2, mt: 3, width: "600px", height: "270px", borderRadius: "10px", boxShadow: 3, backgroundColor: "#f9f9f9", overflow: "hidden" }}>
                        <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
                            Predictions
                        </Typography>
                        <PieChart
                            series={[
                                {
                                    data: predictions.map((prediction, index) => ({
                                        id: index,
                                        value: prediction.probability,
                                        label: prediction.name,
                                        color: ["#606c38", "#5fa8d3", "#614661", "#7f5539", "#415a77", "#bc4b51"][index % 6], // Cycle through colors
                                    })),
                                    highlightScope: { fade: "global", highlight: "item" },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
                                },
                            ]}
                            height={200} sx={{ mt: "-13px" }}
                        />
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default Home;