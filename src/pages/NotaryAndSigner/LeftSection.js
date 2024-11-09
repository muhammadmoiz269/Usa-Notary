import {
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import React from "react";

const LeftSection = ({
  notaryLogo,
  images,
  activeIndex,
  pdfURLArray,
  showDocumentPdf,
  syncPage,
  jobSchedule,
  classes,
}) => {
  return (
    <div>
      <Grid container className={classes.sideBarContainer}>
        <Grid item xs={12}>
          <img
            src={notaryLogo}
            alt="image"
            width="150"
            height="32"
            className={classes.usaNotary}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ marginTop: "14px" }} />
          <h3>Documents</h3>

          {images.length ? (
            <FormControl fullWidth>
              <InputLabel id="document-select-label">
                Select a Document
              </InputLabel>
              <Select
                labelId="document-select-label"
                value={activeIndex === null ? "" : activeIndex}
                onChange={(e) => {
                  const selectedIndex = e.target.value;
                  if (selectedIndex === "") return; // Ignore the placeholder
                  const selectedDocument = pdfURLArray[selectedIndex];
                  showDocumentPdf(
                    selectedIndex,
                    +selectedDocument.jobDocument.ID,
                    +selectedDocument.jobDocument.document_id
                  );
                }}
                label="Select a Document"
              >
                <MenuItem value="" disabled>
                  Select a Document
                </MenuItem>
                {pdfURLArray.map((value, index) => (
                  <MenuItem key={index} value={index}>
                    {value.jobDocument.doc_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            "loading..."
          )}

          <Button
            variant="contained"
            onClick={syncPage} // This function handles syncing when clicked
            sx={{
              backgroundColor: "#efefef",
              color: "#5d5d5d",
              marginTop: "20px",
              "&:hover": { backgroundColor: "#bfbfbf" },
            }}
            fullWidth
          >
            Sync Page
          </Button>

          {jobSchedule.length ? (
            jobSchedule.map((schedule, index) => (
              <div key={index}>
                <iframe
                  src={schedule.whereby_host_link}
                  title="Whereby Session"
                  width="100%"
                  height="600px" // Adjust this according to your sidebar height
                  style={{
                    border: "none",
                    borderRadius: "8px",
                    marginTop: "50px",
                  }}
                  allow="camera; microphone; fullscreen"
                />
              </div>
            ))
          ) : (
            <p>Loading video...</p>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default LeftSection;
