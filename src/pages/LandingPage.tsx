
import React from "react";
import { Button, Container, Typography, Box, Paper } from "@mui/material";
import { ArrowForward, CheckCircle, Schedule, DragIndicator } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { RainbowButton } from "../components/magicui/rainbow-button";
import { RetroGrid } from "../components/magicui/retro-grid";
import { AuroraText } from "../components/magicui/aurora-text";
// import { TypingAnimation } from "../components/magicui/typing-animation";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/taskmanager");
  };

  const features = [
    {
      title: "Organize Tasks",
      description: "Easily categorize your tasks into Not Started, In Progress, and Completed.",
      icon: <CheckCircle className="text-green-600 text-4xl" />,
    },
    {
      title: "Track Progress",
      description: "Monitor your productivity with visual task boards.",
      icon: <Schedule className="text-yellow-600 text-4xl" />,
    },
    {
      title: "Drag & Drop",
      description: "Intuitively move tasks between different stages with drag-and-drop functionality.",
      icon: <DragIndicator className="text-blue-600 text-4xl" />,
    },
  ];

  return (
    <div className="relative flex items-center justify-center">

      <div className="absolute inset-0 z-10 bg-slate-950">
        <RetroGrid />
      </div>

      <Container maxWidth="lg" className="relative z-10">

        <Box className="pt-16 pb-20 text-center">
          <h1 className="text-4xl tracking-tighter md:text-5xl font-bold lg:text-7xl text-white">
            Streamline Your <AuroraText>Workflow</AuroraText>
          </h1>
          <h3 className="text-green-100 mb-8 mx-auto mt-8 text-sm italic md:text-lg lg:text-xl">
            Plan, Track, and Accomplish with Ease.

          </h3>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={handleGetStarted}
            sx={{
              backgroundColor: "rgb(0,0,0)",
              "&:hover": { backgroundColor: "rgb(0, 0, 0)" },
              marginTop: "16px",
              paddingX: "32px",
              paddingY: "12px",
              fontSize: "1.125rem",
              borderRadius: "8px",
              border: "2px solid rgb(22, 163, 74)",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            Try It Out
          </Button>
        </Box>


        <Box className="pb-20">
          <div className="flex justify-center my-6 font-mono">
            <RainbowButton className="bg-black">Why Todoska ?</RainbowButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-5">
            {features.map((feature, index) => (
              <Paper key={index} elevation={4} className="p-6 transition-transform duration-300 hover:scale-105 border-black border-4 rounded-lg">
                <Box className="flex flex-col items-center text-center">
                  <Box className="mb-4">{feature.icon}</Box>
                  <Typography variant="h5" className="mb-2 font-bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </div>
        </Box>


        <Box className="py-16 text-center">
          <Paper elevation={6}
            sx={{
              backgroundColor: "rgb(171, 235, 183)",
              border: "4px solid black",
              borderRadius: "0.75rem",
              padding: "2.5rem",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h4" className="text-black font-bold mb-4 ">
              Ready to boost your productivity?
            </Typography>
            <Typography
              variant="body1"
              className="text-green-900 font-mono mx-auto"
              sx={{ marginBottom: "24px" }}
            >
              Start organizing your tasks today and experience the difference a well-structured workflow can make.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                backgroundColor: "black",
                "&:hover": { backgroundColor: "rgb(3, 74, 16)" },
                color: "white",
                paddingX: "32px",
                paddingY: "12px",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              Launch Task Manager
            </Button>
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default LandingPage;
