import React, { useState } from "react";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import axios from "axios";

const ProjectPage = ({ projectId }) => {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      alert("Select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      await axios.post(`http://localhost:5037/api/customvision/upload/${projectId}`, formData);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const trainModel = async () => {
    try {
      await axios.post(`http://localhost:5037/api/customvision/train/${projectId}`);
      alert("Model training started!");
    } catch (error) {
      console.error("Training failed:", error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Project Details</Typography>

      <Grid container spacing={3} mt={3}>
        {/* Upload Images Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Upload Images</Typography>
            <input type="file" onChange={handleFileChange} />
            <Button variant="contained" onClick={uploadImage}>
              Upload
            </Button>
          </Paper>
        </Grid>

        {/* Train Model Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Train Model</Typography>
            <Button variant="contained" color="primary" onClick={trainModel}>
              Train Now
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectPage;
