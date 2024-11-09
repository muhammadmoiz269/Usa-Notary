import React from "react";
import Grid from "@mui/material/Grid2";
import { Box, Divider, Typography } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const RightSection = ({
  classes,
  zoomCanvas,
  clientsData,
  dragStart,
  notaryData,
  notaryActionsList,
}) => {
  return (
    <div>
      <Grid container>
        <Grid item size={12}>
          <Box>
            <button
              className={classes.zoomIconsContainer}
              onClick={() => zoomCanvas(0.1)}
            >
              <ZoomInIcon className={classes.zoomIcons} />
            </button>
            <button
              className={classes.zoomIconsContainer2}
              onClick={() => zoomCanvas(-0.1)}
            >
              <ZoomOutIcon className={classes.zoomIcons} />
            </button>
          </Box>
        </Grid>
        <Grid item size={12}>
          <Typography className={classes.ActionText}>Actions</Typography>
        </Grid>

        <Grid item size={12}>
          {/* start of users box */}
          {clientsData.map((participant, i) => {
            console.log(participant);
            return (
              <Box key={i}>
                <p>
                  <b style={{ color: "#5d5d5d" }}>Participants</b>
                </p>
                <Box className={classes.nameWithBox}>
                  <span
                    style={{ backgroundColor: participant?.tag_color }}
                    className={classes.smallBox2}
                  ></span>
                  <span className={classes.personName}>
                    {participant.fullname}
                  </span>
                </Box>
                <Box className={classes.dragDropBoxContainer}>
                  <span
                    className={classes.dragDropBox}
                    draggable="true"
                    onDragStart={(e) => dragStart(e)}
                    data-elementname="writeText"
                    data-type={participant.type}
                    data-elementuserid={participant?.id ?? null}
                    data-elementcolor={participant?.tag_color}
                    data-signername={
                      participant.fullname
                      // participant.first_name +
                      // participant.middle_name +
                      // participant.last_name
                    }
                    data-element-type={"indicator"}
                  >
                    {" "}
                    text
                  </span>
                  <span
                    className={classes.dragDropBox2}
                    draggable="true"
                    onDragStart={(e) => dragStart(e)}
                    data-elementname="participantName"
                    data-type={participant.type}
                    data-elementuserid={participant?.id}
                    data-elementcolor={participant?.tag_color}
                    data-signername={participant.fullname}
                    data-element-type={"indicator"}
                  >
                    {" "}
                    Name
                  </span>
                  <span
                    className={classes.dragDropBox2}
                    draggable="true"
                    onDragStart={(e) => dragStart(e)}
                    data-elementname="sign"
                    data-type={participant.type}
                    data-elementuserid={participant?.id}
                    data-elementcolor={participant?.tag_color}
                    data-signername={
                      participant.fullname
                      // participant.first_name +
                      // participant.middle_name +
                      // participant.last_name
                    }
                    data-element-type={"indicator"}
                  >
                    {" "}
                    Sign
                  </span>
                  <span
                    className={classes.dragDropBox2}
                    draggable="true"
                    onDragStart={(e) => dragStart(e)}
                    data-elementname="participantInitial"
                    data-type={participant.type}
                    data-elementuserid={participant?.id}
                    data-elementcolor={participant?.tag_color}
                    data-signername={participant.fullname}
                    data-element-type={"indicator"}
                  >
                    {" "}
                    Initial
                  </span>
                </Box>
                <Divider sx={{ margin: "20px 0px" }} />
              </Box>
            );
          })}
          {/* end of user div  */}
          <p>
            <b style={{ color: "#5d5d5d" }}>Notary</b>
          </p>
          <Box className={classes.nameWithBox} style={{ marginBottom: "20px" }}>
            <span
              style={{ background: "rgb(220,38,38)" }}
              className={classes.smallBox2}
            ></span>
            <span className={classes.personName}>{notaryData?.fullname}</span>
          </Box>
          <Box>
            {notaryActionsList.map((item, i) => (
              <span
                key={i}
                draggable="true"
                onDragStart={(e) => dragStart(e)}
                className={classes.actionsListContainer}
                data-elementname={item.elementName}
                data-type="notary"
                imagesrc={item.imagePath}
                data-notaryid={notaryData?.ID}
                data-notarycommissionid={item.commissionId}
                data-noratyexpirydate={item.expDate}
                data-notarydisclosuretext={item.disclosureText}
                data-notaryfieldsbgcolor={"#FF1E1E"}
                data-notaryname={item.notaryName}
                data-notarytitle={item.notaryTitle}
                data-element-type={item.elementType}
              >
                <item.actionIcon />
                <Typography className={classes.ActionTextt}>
                  {item.actionName}
                </Typography>
              </span>
            ))}
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default RightSection;
