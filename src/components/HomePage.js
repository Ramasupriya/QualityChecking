import React, { useRef, useState } from "react";
import axios from "axios";
import { AppBar, Box, CssBaseline, Paper, Toolbar, Typography, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Webcam from "react-webcam";
import { PieChart } from '@mui/x-charts';


const HomePage = () => {
    const webcamRef = useRef(null);
    const [selectMethod, setSelectMethod] = useState(null);
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [predictions, setPredictions] = useState([]);

    //Triggered when a user uploads an image
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setImage(selectedFile);
            setPreviewImage(URL.createObjectURL(selectedFile));
        }
    };
//Capture Image from Webcam
    //webcamRef.current.getScreenshot() captures a still image from the webcam in Base64 format (i.e., a data URL starting with "data:image/jpeg;base64,...").
   // Convert Base64 Image to a Blob (Binary Data)
    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
                setImage(file);
                setPreviewImage(imageSrc);
            });
    };

    const handleDetect = async () => {
        if (!image) {
            alert("Please upload or capture an image first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", image);

        try {
            const response = await axios.post("http://localhost:5037/api/customvision/detect-defect", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
         //Store the Predictions from the API Response
            if (response.data && response.data.predictions) {
                setPredictions(response.data.predictions);
            } else {
                setPredictions([]);
            }
        } catch (error) {
            console.error("Error detecting defects:", error);
            alert("Error detecting defects. Please try again.");
        }
    };

    return (
        <Box sx={{ display: "flex", height: '100vh' }}>
            <CssBaseline />
            <AppBar sx={{ backgroundColor: "#0F4C5C" }}>
                <Toolbar>
                    <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                        <FontAwesomeIcon icon={faEye} style={{ color: "#ffffff", marginRight: "15px" }} />
                        <Typography variant="h6">Custom Vision</Typography>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 2, position: 'relative' }}>
                {selectMethod && (
                    <Button startIcon={<ArrowBackIcon />} sx={{
                        position: 'absolute', backgroundColor: '#6A9C89', color: 'white', fontWeight: 'bold', top: '80px', left: 5,
                        zIndex: 99,
                    }} onClick={() => {
                        setSelectMethod(null);
                        setImage(null);
                        URL.revokeObjectURL(previewImage);
                        setPreviewImage(null);
                    }}>
                        Back
                    </Button>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '15%' }}>
                    <Paper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, width: '250px', height: '220px', mt: "20px" }}>
                        {selectMethod ? (previewImage ? (
                            <img src={previewImage} alt={"Preview"} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <p>Preview image</p>
                        )) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1, width: '100%', height: '100%' }} onClick={() => setSelectMethod('cam')}>
                                <CameraAltIcon style={{ fontSize: 50, color: "#54473F" }} />
                                <Typography>Take a picture</Typography>
                            </Box>
                        )}
                    </Paper>
                    <Paper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, width: '250px', height: '220px', mt: "20px" }}>
                        {selectMethod === 'cam' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
                                <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" style={{ width: "100%", height: "100%" }} />
                                <Button sx={{ backgroundColor: '#605678', color: 'white' }} onClick={capture}>Capture Image</Button>
                            </Box>
                        ) : (
                            <label htmlFor="upload-input" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1, cursor: 'pointer', width: '100%', height: '100%' }} onClick={() => setSelectMethod('upload')}>
                                <CloudUploadIcon style={{ fontSize: 50, color: "#4C4B16" }} />
                                <Typography>{previewImage ? ('Change an image') : ('Upload an image')}</Typography>
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="upload-input" />
                            </label>
                        )}
                    </Paper>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Button sx={{
                        backgroundColor: '#690B22', fontWeight: "bold", color: 'white', '&:hover': { backgroundColor: '#4E0818' }
                    }} onClick={handleDetect}>Detect</Button>

                    {predictions.length > 0 && (
                        <Paper sx={{ p: 2, width: '600px', textAlign: 'center', mt: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Detection Result</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, ml: "-70px" }}>
                                <PieChart
                                    series={[
                                        {
                                            data: predictions.map((prediction, index) => ({
                                                id: index,
                                                value: prediction.probability * 100, // Convert to percentage
                                                label: `${prediction.tagName} (${(prediction.probability * 100).toFixed(2)}%)`,
                                                color: ["#606c38", "#5fa8d3", "#614661", "#7f5539", "#415a77", "#bc4b51"][index % 6], // Cycle through colors
                                            })),
                                            highlightScope: { fade: "global", highlight: "item" },
                                            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
                                        },
                                    ]}
                                    height={200}
                                    sx={{ mt: 2, }}
                                />

                            </Box>
                        </Paper>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default HomePage;
