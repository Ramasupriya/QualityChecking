import React, { useState, useEffect } from "react";
import axios from "axios";
import { AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Grid } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";
import PropTypes from "prop-types";
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';



const drawerWidth = 240;
const navItems = ["Home", "About", "Contact"];

const Home = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [predictions, setPredictions] = useState([]);


  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setProjectName(""); // Clear input when closing
  };


  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5037/api/customvision/get-projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Handle project creation
  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }
    try {
      await axios.post("http://localhost:5037/api/customvision/create-project", 
      { name: projectName }, 
      { headers: { "Content-Type": "application/json" } }
    );
      alert("Project created successfully!");
      setOpen(false);
      setProjectName("");
      fetchProjects(); // Refresh projects after creation
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project.");
    }
  };


  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MUI
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;





    // useEffect(() => {
    //   fetchProjects();
    // }, []);
  
    // const fetchProjects = async () => {
    //   try {
    //     const response = await axios.get("http://localhost:5037/api/customvision/get-projects");
    //     setProjects(response.data);
    //   } catch (error) {
    //     console.error("Error fetching projects:", error);
    //   }
    // };
  
    const handleProjectClick = async (project) => {
      setSelectedProject(project);
      try {
        await Promise.all([
          fetchTags(project.id),
          fetchImages(project.id),
          fetchPerformance(project.id),
          fetchPredictions(project.id)
        ]);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    
  
    const fetchTags = async (projectId) => {
      try {
        const response = await axios.get(`http://localhost:5037/api/customvision/get-tags/${projectId}`);
        setTags(response.data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    
  
    const fetchImages = async (projectId) => {
      try {
        const response = await axios.get(`http://localhost:5037/api/customvision/get-images?projectId=${projectId}`);
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
  
    const fetchPerformance = async (projectId) => {
      try {
        const response = await axios.get(`http://localhost:5037/api/customvision/get-performance?projectId=${projectId}`);
        setPerformance(response.data);
      } catch (error) {
        console.error("Error fetching performance:", error);
      }
    };
  
    const fetchPredictions = async (projectId) => {
      try {
        const response = await axios.get(`http://localhost:5037/api/customvision/get-predictions?projectId=${projectId}`);
        setPredictions(response.data);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    };

  return (

    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <FontAwesomeIcon
              icon={faEye}
              style={{ color: "#ffffff", marginRight: "15px" }}
            />
            <Typography variant="h6" component="div">
              Custom Vision
            </Typography>
          </Box>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: "#fff" }}>
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <Box sx={{ p: 4 , mt:'40px'}}>
        <Typography variant="h4" gutterBottom>
          My Projects
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 3 }}>
          {/* Create New Project Button */}
          <Paper
            sx={{
              height: "200px",
              width: "200px",
              display: "flex",
              flexDirection: "column", // Stack items vertically
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => setOpen(true)}
          >
            <CreateNewFolderIcon style={{ color: "#578FCA", fontSize: "120px" }} />
            <Typography sx={{ marginTop: "10px", fontWeight: "bold" }}>New Project</Typography>
          </Paper>

          {/* Display Projects */}
          {projects.map((project) => (
  <Paper
    key={project.id}
    sx={{
      height: "200px",
      width: "200px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      p: 2,
      cursor: "pointer", // Makes it clear that it's clickable
    }}
    onClick={() => handleProjectClick(project)}
  >
    <Typography variant="h6">{project.name}</Typography>
  </Paper>
))}
        </Box>



 {/* Show details of selected project */}
 {selectedProject && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">{selectedProject.name} - Details</Typography>

          {/* Tags Section */}
          <Typography variant="h6">Tags:</Typography>
          <Grid container spacing={2}>
            {tags.map((tag) => (
              <Grid item key={tag.id}>
                <Paper sx={{ padding: 2 }}>{tag.name}</Paper>
              </Grid>
            ))}
          </Grid>

          {/* Images Section */}
          <Typography variant="h6" sx={{ mt: 4 }}>Training Images:</Typography>
          <Grid container spacing={2}>
            {images.map((img) => (
              <Grid item key={img.id}>
                <img src={img.url} alt={img.name} width="150" height="150" />
              </Grid>
            ))}
          </Grid>

          {/* Performance Section */}
          {performance && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Performance:</Typography>
              <Typography>Precision: {performance.precision}%</Typography>
              <Typography>Recall: {performance.recall}%</Typography>
            </Box>
          )}

          {/* Predictions Section */}
          <Typography variant="h6" sx={{ mt: 4 }}>Predictions:</Typography>
          <Grid container spacing={2}>
            {predictions.map((pred) => (
              <Grid item key={pred.id}>
                <Paper sx={{ padding: 2 }}>
                  <Typography>Tag: {pred.tagName}</Typography>
                  <Typography>Probability: {pred.probability * 100}%</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
         )}









        {/* Create Project Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Project Name"
              fullWidth
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};


Home.propTypes = {
  window: PropTypes.func,
};

export default Home;
