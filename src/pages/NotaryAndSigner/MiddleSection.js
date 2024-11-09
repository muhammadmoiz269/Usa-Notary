import React from "react";
import Grid from "@mui/material/Grid2";

const MiddleSection = ({
  classes,
  completeDocument,
  docIds,
  EndSession,
  setDivScroll,
  gridScroll,
  images,
  Loader,
  documentContainer,
  ondragOver,
  dragDropped,
}) => {
  return (
    <div>
      <Grid
        container
        style={{ height: "inherit" }}
        className={classes.mainPagesHeader}
      >
        <Grid item size={12} className={classes.headerGrid12}>
          <button className={classes.EndSessionBtn} onClick={EndSession}>
            End Session
          </button>
          {/* <Box className={classes.pageBtnConatiner}>
                <Typography className={classes.btnPages}>
                  <KeyboardArrowLeftIcon onClick={minusDocumentNum} />
                  {docIds === "" ? 0 : docIds + 1} of {images.length}
                  <KeyboardArrowRightIcon onClick={addDocumentNum} />
                </Typography>
              </Box> */}
          {typeof docIds === "number" ? (
            <button
              className={classes.CompleteBtn}
              onClick={completeDocument}
              id={`completebtn${docIds}`}
            >
              Complete
            </button>
          ) : (
            ""
          )}
          {/* <button
                className={classes.CompleteBtn}
                onClick={completeDocument}
                id="completebtn"
              >
                Complete
              </button> */}
        </Grid>

        <Grid
          style={{ height: "calc(100vh - 58px)", overflowY: "auto" }}
          item
          size={12}
          className={classes.canvasDrapDRopMainContainer}
          onScroll={(e) => setDivScroll(e.target.scrollTop)}
          ref={gridScroll}
        >
          {!images.length ? (
            <div
              style={{
                position: "absolute",
                top: "0px",
                // left: "0px",
                bottom: "0px",
                // backgroundColor: "#ffffff82",
                display: "grid",
                placeContent: "center",
                zIndex: "1000",
              }}
            >
              <img src={Loader} alt="image" width={"100"} />
            </div>
          ) : (
            <div ref={documentContainer} id="documentContainer">
              {images?.map((value, index) => (
                <div
                  id={"canvas-box-" + index}
                  key={index}
                  className="canvas-box"
                >
                  <div
                    id={"completedPlaceholder-" + index}
                    key={index}
                    className={classes.completedPlaceholder}
                  >
                    <div></div>
                  </div>
                  {value?.map((val, ind) => (
                    <div
                      id={"canvas-area-" + index + "-" + ind}
                      key={ind}
                      onDragOver={(e) => ondragOver(e)}
                      onDrop={(e) => dragDropped(e, ind)}
                    >
                      <p id={"docPage-" + index + "-" + ind}>{ind + 1}</p>
                      <canvas
                        width={"720"}
                        height={"932"}
                        id={"canvas" + index + "-" + ind}
                      ></canvas>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default MiddleSection;
