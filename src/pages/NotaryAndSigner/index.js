import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import {
  Box,
  Dialog,
  DialogActions,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { fabric } from "fabric";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.js";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { skt } from "../../App";
import Loader from "../../Assets/images/loader.gif";
import notaryLogo from "../../Assets/images/notary_logo.png";
import CloseButton from "../../Components/Button";
import { useStyles } from "../../styles";
import { baseUrl } from "../../Utils/constant";
import { notaryActionsList } from "../../Utils/utilities";
import { FaLastfmSquare } from "react-icons/fa";

const PDFJS = window.pdfjsLib;

GlobalWorkerOptions.workerSrc = workerSrc;
const NotaryAndSigner = () => {
  const [pdf, setPdf] = useState("");
  const [pdfRendering, setPdfRendering] = useState("");
  const [images, setImages] = useState([]);
  const [pageRendering, setPageRendering] = useState("");
  const [canvases, setCanvases] = useState("");
  const [canvas, setCanvas] = useState("");

  const [divScroll, setDivScroll] = useState(0);
  const [dataArray, setDataArray] = useState([]);
  const [docIds, setDocIds] = useState("");
  const [zoomValue, setZoomValue] = useState(0);
  const [pdfURLArray, setPdfURLArray] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [clientsData, setClientsData] = useState([]);
  const [notaryData, setNotaryData] = useState("");
  const [docSpecificId, setDocSpecificId] = useState("");
  const [inCompleteDocError, setInCompleteDocError] = useState(false);
  const [dataArr, setDataArr] = useState([]);
  const [dataBaseActiveDocId, setDataBaseActiveDocId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [sktResponse, setSktResponse] = useState("");
  const [docIndexArray, setDocIndexArray] = useState([]);
  const [backendJobDocId, setBackendJobDocId] = useState("");
  const [originalMeta, setOriginalMeta] = useState([]);
  const [jobSchedule, setJobSchedule] = useState([]);

  const documentContainer = useRef();
  const gridScroll = useRef(null);
  const classes = useStyles();
  const { id } = useParams();

  console.log("notaryData", notaryData);

  const syncPage = () => {
    // console.log("Page synced!");
    // Add sync logic here
  };

  const getDataByQueryParaMeter = () => {
    axios({
      method: "get",
      url: `${baseUrl}/findNotarySessionLink/${id}`,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("findnotarylink", res.data);

        setJobSchedule(res.data.jobSchedule);
        setPdfURLArray(res.data.sessionDoc);
        setClientsData(res.data.job_participant);
        setNotaryData(res.data.user[0]);
        // setNotaryData(res.data.user[0]);
        setRoomId(res.data.session[0].socket_room_id);
        setOriginalMeta(JSON.parse(res.data.session[0].metadata));
        skt.emit("joinRoom", res.data.session[0].socket_room_id);

        // // filter selected documents data
        const filterDocids = res.data.sessionDoc.map((value) => {
          return `doc${value.jobDocument.ID}`;
        });
        let selectedIndex = 0;
        let associateDataArray = [];
        let meta = JSON.parse(res.data.session[0].metadata);
        console.log("metacehck", meta);

        for (let index in filterDocids) {
          console.log("selectedIndex", selectedIndex);
          let key = filterDocids[index];
          if (key in meta) {
            let value = meta[key];
            // changing frontend doc id
            value.map((item) => {
              item.map((value) => {
                if (value.frontDocId) {
                  let updatedFrontEndDocId = value;
                  updatedFrontEndDocId.frontDocId = +index;
                } else {
                  return [];
                }
              });
            });
            // end of changing frontend doc id

            associateDataArray[key] = value;
          }

          if (selectedIndex < filterDocids.length - 1) {
            selectedIndex++;
          }
        }

        if (Object.keys(associateDataArray).length) {
          console.log("associateDataArray", associateDataArray);
          setDataArr(associateDataArray);
        }

        // end of filter selected documents data
      })
      .catch((error) => {
        console.log("error", error);
        // enqueueSnackbar(`${error.response.data.message}`, { variant: "error" });
      });
  };

  const displayDataOnCanvas = async () => {
    if (canvas && dataArr) {
      let docIndexNew = 0; // document index

      for (let keys in dataArr) {
        let docIndex = dataArr[keys]; // get all pages of one document

        // Add guard clause to ensure docIndex is an array
        if (!Array.isArray(docIndex)) {
          console.error(`docIndex is not an array for key ${keys}`, docIndex);
          continue; // Skip this iteration if docIndex is invalid
        }

        await Promise.all(
          docIndex.map(async (page, pageIndex) => {
            // Add guard clause to ensure page is an array
            if (!Array.isArray(page)) {
              console.error(
                `page is not an array for pageIndex ${pageIndex}`,
                page
              );
              return; // Skip this page if it's invalid
            }

            await Promise.all(
              page.map(async (value) => {
                if (value.hasOwnProperty("left")) {
                  if (value.elementType === "image") {
                    console.log("value.elementName", value);
                    await new Promise((resolve, reject) => {
                      const fakeImg = new Image();
                      fakeImg.onload = async () => {
                        var imageField = new fabric.Image(fakeImg, {
                          left: value.left,
                          top: value.top,
                          scaleX: value.scaleX,
                          scaleY: value.scaleY,
                          pageId: value.pageId,
                          id: value.id,
                          userType: value.userType,
                          elementType: value.elementType,
                          notaryId: value.notaryId,
                          elementName: value.elementName,
                          documentId: value.documentId,
                          frontDocId: value.frontDocId,
                          backendJobDocId: value.backendJobDocId,
                          hoverCursor: "pointer",
                        });
                        if (
                          canvas[docIndexNew] &&
                          canvas[docIndexNew][pageIndex]
                        ) {
                          canvas[docIndexNew][pageIndex].add(imageField);
                        } else {
                          console.error(
                            `Canvas not found for docIndexNew ${docIndexNew} and pageIndex ${pageIndex}`
                          );
                        }
                        resolve();
                      };
                      fakeImg.onerror = (error) => {
                        reject(error);
                      };
                      fakeImg.src =
                        value.elementName === "participantInitial"
                          ? value.imageUrl
                          : value.elementName === "sign"
                          ? value.imageUrl
                          : `data:image/png;base64,` + value.imageUrl;
                    });
                  }

                  // Handle 'indicator' and 'text' similarly, with guard checks before adding to canvas
                  // Indicator handling
                  if (value.elementType === "indicator") {
                    var elements = new fabric.IText(value.text, {
                      left: value.left,
                      top: value.top,
                      scaleX: value.scaleX,
                      scaleY: value.scaleY,
                      backgroundColor: value.backgroundColor,
                      fontSize: value.fontSize,
                      fontStyle: value.fontStyle,
                      pageId: value.pageId,
                      height: value.height,
                      fontWeight: value.fontWeight,
                      fontFamily: value.fontFamily,
                      id: value.id,
                      userType: value.userType,
                      editable: false,
                      elementType: value.elementType,
                      userID: value.userID,
                      notaryId: value.notaryId,
                      elementName: value.elementName,
                      documentId: value.documentId,
                      frontDocId: value.frontDocId,
                      backendJobDocId: value.backendJobDocId,
                      hoverCursor: "pointer",
                    });
                    elements.setControlsVisibility({
                      tr: false,
                      bl: false,
                      mt: false,
                      mb: false,
                      ml: false,
                      mr: false,
                      mtr: false,
                    });

                    if (canvas[docIndexNew] && canvas[docIndexNew][pageIndex]) {
                      canvas[docIndexNew][pageIndex].add(elements);
                    } else {
                      console.error(
                        `Canvas not found for docIndexNew ${docIndexNew} and pageIndex ${pageIndex}`
                      );
                    }
                  }

                  // Text handling
                  if (
                    value.elementType === "text" ||
                    value.elementType === "editableText"
                  ) {
                    var elements = new fabric.IText(value.text, {
                      left: value.left,
                      top: value.top,
                      scaleX: value.scaleX,
                      scaleY: value.scaleY,
                      backgroundColor: value.backgroundColor,
                      fontSize: value.fontSize,
                      fontStyle: value.fontStyle,
                      pageId: value.pageId,
                      height: value.height,
                      fontWeight: value.fontWeight,
                      fontFamily: value.fontFamily,
                      id: value.id,
                      userType: value.userType,
                      editable: value.elementName === "text" ? true : false,
                      elementType: value.elementType,
                      userID: value.userID,
                      notaryId: value.notaryId,
                      elementName: value.elementName,
                      documentId: value.documentId,
                      frontDocId: value.frontDocId,
                      backendJobDocId: value.backendJobDocId,
                      hoverCursor: "pointer",
                    });
                    elements.setControlsVisibility({
                      tr: false,
                      bl: false,
                      mt: false,
                      mb: false,
                      ml: false,
                      mr: false,
                      mtr: false,
                    });

                    if (canvas[docIndexNew] && canvas[docIndexNew][pageIndex]) {
                      canvas[docIndexNew][pageIndex].add(elements);
                    } else {
                      console.error(
                        `Canvas not found for docIndexNew ${docIndexNew} and pageIndex ${pageIndex}`
                      );
                    }
                  }

                  // End of object modified event
                }
              })
            );
          })
        );

        if (docIndexNew < Object.keys(dataArr).length - 1) {
          docIndexNew++; // document index increment
        }
      }

      updateHandler();
    }
  };

  const updateHandler = () => {
    var selectObject;
    var elementspecificId;
    let selectedObjectOnCanvas;
    // selection updated and created event
    const selectedHandler = (evt) => {
      selectObject = evt.selected[0].pageId;
      elementspecificId = evt.selected[0].id;
      selectedObjectOnCanvas = evt.selected[0];
      // let selectedObjectOnCanvas2 = evt.selected[0];
      console.log("selectedObjectOnCanvas", selectedObjectOnCanvas);
      var currentAction = "update";
      var activeElement = "";
      var actionDetail = "";

      // debugger
      // if (value.userType === "notary") {
      switch (selectedObjectOnCanvas.elementName) {
        case "name":
          if (selectedObjectOnCanvas.text) {
            selectedObjectOnCanvas.backgroundColor =
              selectedObjectOnCanvas.backgroundColor.length == 7
                ? selectedObjectOnCanvas.backgroundColor + "80"
                : selectedObjectOnCanvas.backgroundColor;

            selectedObjectOnCanvas.text = notaryData.fullname;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text =
              notaryData[selectedObjectOnCanvas.elementName];
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "text";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].backgroundColor =
              selectedObjectOnCanvas.backgroundColor;

            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} added`;
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "title":
          if (selectedObjectOnCanvas.text) {
            selectedObjectOnCanvas.backgroundColor =
              selectedObjectOnCanvas.backgroundColor.length == 7
                ? selectedObjectOnCanvas.backgroundColor + "80"
                : selectedObjectOnCanvas.backgroundColor;

            selectedObjectOnCanvas.text = notaryData.title;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text =
              notaryData[selectedObjectOnCanvas.elementName];
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "text";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].backgroundColor =
              selectedObjectOnCanvas.backgroundColor;

            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} added`;
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "commission_id":
          if (selectedObjectOnCanvas.text) {
            selectedObjectOnCanvas.backgroundColor =
              selectedObjectOnCanvas.backgroundColor.length == 7
                ? selectedObjectOnCanvas.backgroundColor + "80"
                : selectedObjectOnCanvas.backgroundColor;

            selectedObjectOnCanvas.text = notaryData.comm_id_num;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text =
              notaryData[selectedObjectOnCanvas.elementName];
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "text";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].backgroundColor =
              selectedObjectOnCanvas.backgroundColor;

            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} added`;
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "commission_exp_date":
          if (selectedObjectOnCanvas.text) {
            selectedObjectOnCanvas.backgroundColor =
              selectedObjectOnCanvas.backgroundColor.length == 7
                ? selectedObjectOnCanvas.backgroundColor + "80"
                : selectedObjectOnCanvas.backgroundColor;

            selectedObjectOnCanvas.text = notaryData.comm_expdate;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text =
              notaryData[selectedObjectOnCanvas.elementName];
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "text";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].backgroundColor =
              selectedObjectOnCanvas.backgroundColor;

            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} added`;
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "disclosure":
          if (selectedObjectOnCanvas.text === "DISCLOSURE HERE") {
            selectedObjectOnCanvas.backgroundColor =
              selectedObjectOnCanvas.backgroundColor.length == 7
                ? selectedObjectOnCanvas.backgroundColor + "80"
                : selectedObjectOnCanvas.backgroundColor;
            selectedObjectOnCanvas.text = notaryData.disclosure;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text = notaryData.disclosure;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "text";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].backgroundColor =
              selectedObjectOnCanvas.backgroundColor;
            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} added`;
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "date":
          if (selectedObjectOnCanvas.text === "DATE HERE") {
            let Date = dayjs().format("MM/DD/YYYY");

            selectedObjectOnCanvas.backgroundColor =
              selectedObjectOnCanvas.backgroundColor.length == 7
                ? selectedObjectOnCanvas.backgroundColor + "80"
                : selectedObjectOnCanvas.backgroundColor;
            selectedObjectOnCanvas.text = Date;

            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text = Date;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "text";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].backgroundColor =
              selectedObjectOnCanvas.backgroundColor;
            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} added`;
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "text":
          canvas[selectedObjectOnCanvas.frontDocId][
            selectedObjectOnCanvas.pageId
          ].on("text:changed", function (e) {
            console.log("eee", e.target.text);
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text = e.target.text;

            handleSocket(
              "update",
              `Notary updated ${e.target.text}`,
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id]
            );
          });
          if (selectedObjectOnCanvas.text === "WRITETEXT HERE") {
            canvas[selectedObjectOnCanvas.frontDocId][
              selectedObjectOnCanvas.pageId
            ].on("text:changed", function (e) {
              console.log("eee", e.target.text);
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].text = e.target.text;

              handleSocket(
                "update",
                `Notary updated ${e.target.text}`,
                dataArr[selectedObjectOnCanvas.backendJobDocId][
                  selectedObjectOnCanvas.pageId
                ][selectedObjectOnCanvas.id]
              );
            });

            selectedObjectOnCanvas.backgroundColor =
              selectedObjectOnCanvas.backgroundColor.length == 7
                ? selectedObjectOnCanvas.backgroundColor + "80"
                : selectedObjectOnCanvas.backgroundColor;
            selectedObjectOnCanvas.editable = true;
            selectedObjectOnCanvas.text = "Write Something";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text = selectedObjectOnCanvas.text;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "text";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].backgroundColor =
              selectedObjectOnCanvas.backgroundColor;
            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} added`;
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "seal":
          if (selectedObjectOnCanvas.text) {
            const sealUrl = notaryData.seal;
            fabric.Image.fromURL(sealUrl, (imageField) => {
              let scaleImg = 720 / 5 / imageField.width;

              if (imageField.width <= 720 / 5) {
                scaleImg = 1;
              }
              imageField.set({
                left: selectedObjectOnCanvas.left,
                top: selectedObjectOnCanvas.top,
                scaleX: scaleImg * 1,
                scaleY: scaleImg * 1,
                pageId: selectedObjectOnCanvas.pageId,
                id: selectedObjectOnCanvas.id,
                userType: selectedObjectOnCanvas.userType,
                elementType: "image",
                notaryId: selectedObjectOnCanvas.notaryId,
                elementName: selectedObjectOnCanvas.elementName,
                frontDocId: selectedObjectOnCanvas.frontDocId,
                backendJobDocId: selectedObjectOnCanvas.backendJobDocId,
                hoverCursor: "pointer",
              });
              imageField.setControlsVisibility({
                tr: false,
                bl: false,
                ml: false,
                mt: false,
                mr: false,
                mb: false,
                mtr: false,
              });
              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].add(imageField);

              const element =
                canvas[selectedObjectOnCanvas.frontDocId][
                  selectedObjectOnCanvas.pageId
                ].getActiveObject();
              if (element && element !== imageField) {
                canvas[selectedObjectOnCanvas.frontDocId][
                  selectedObjectOnCanvas.pageId
                ].remove(element);
              }

              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].renderAll();

              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].text;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleX = scaleImg;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleY = scaleImg;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].elementType = "image";
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].imageUrl = sealUrl;
            });

            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} seal added`;

            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "signature":
          if (selectedObjectOnCanvas.text) {
            const sealUrl = notaryData.signature_filename;
            fabric.Image.fromURL(sealUrl, (imageField) => {
              let scaleImg = 720 / 5 / imageField.width;

              if (imageField.width <= 720 / 5) {
                scaleImg = 1;
              }

              imageField.set({
                left: selectedObjectOnCanvas.left,
                top: selectedObjectOnCanvas.top,
                scaleX: scaleImg * 1,
                scaleY: scaleImg * 1,
                pageId: selectedObjectOnCanvas.pageId,
                id: selectedObjectOnCanvas.id,
                userType: selectedObjectOnCanvas.userType,
                elementType: "image",
                notaryId: selectedObjectOnCanvas.notaryId,
                elementName: selectedObjectOnCanvas.elementName,
                frontDocId: selectedObjectOnCanvas.frontDocId,
                backendJobDocId: selectedObjectOnCanvas.backendJobDocId,
                hoverCursor: "pointer",
              });

              imageField.setControlsVisibility({
                tr: false,
                bl: false,
                ml: false,
                mt: false,
                mr: false,
                mb: false,
                mtr: false,
              });

              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].add(imageField);

              const element =
                canvas[selectedObjectOnCanvas.frontDocId][
                  selectedObjectOnCanvas.pageId
                ].getActiveObject();
              if (element && element !== imageField) {
                canvas[selectedObjectOnCanvas.frontDocId][
                  selectedObjectOnCanvas.pageId
                ].remove(element);
              }

              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].renderAll();

              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].text;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleX = scaleImg;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleY = scaleImg;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].elementType = "image";
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].imageUrl = sealUrl;
            });

            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} seal added`;

            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "checkbox":
          if (selectedObjectOnCanvas.text) {
            const checkmarkWidth = 10;
            const checkmarkHeight = 10;

            const checkmark1 = new fabric.Line(
              [
                selectedObjectOnCanvas.left,
                selectedObjectOnCanvas.top + checkmarkHeight / 2,
                selectedObjectOnCanvas.left + checkmarkWidth,
                selectedObjectOnCanvas.top + checkmarkHeight,
              ],
              {
                stroke: "#000",
                strokeWidth: 2,
                selectable: FaLastfmSquare,
              }
            );

            const checkmark2 = new fabric.Line(
              [
                selectedObjectOnCanvas.left + checkmarkWidth,
                selectedObjectOnCanvas.top + checkmarkHeight,
                selectedObjectOnCanvas.left + 2 * checkmarkWidth,
                selectedObjectOnCanvas.top,
              ],
              {
                stroke: "#000",
                strokeWidth: 2,
                selectable: false,
              }
            );

            canvas[selectedObjectOnCanvas.frontDocId][
              selectedObjectOnCanvas.pageId
            ].add(checkmark1);
            canvas[selectedObjectOnCanvas.frontDocId][
              selectedObjectOnCanvas.pageId
            ].add(checkmark2);

            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "checkbox";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].isChecked = true;

            const element =
              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].getActiveObject();
            if (element) {
              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].remove(element);
            }

            canvas[selectedObjectOnCanvas.frontDocId][
              selectedObjectOnCanvas.pageId
            ].renderAll();

            actionDetail = `Checkmark for ${selectedObjectOnCanvas.elementName} added`;
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "initial notary":
        case "initial":
          if (selectedObjectOnCanvas.text) {
            const sealUrl = notaryData.initials_filename;
            fabric.Image.fromURL(sealUrl, (imageField) => {
              let scaleImg = 720 / 5 / imageField.width;

              if (imageField.width <= 720 / 5) {
                scaleImg = 1;
              }
              imageField.set({
                left: selectedObjectOnCanvas.left,
                top: selectedObjectOnCanvas.top,
                scaleX: scaleImg * 1,
                scaleY: scaleImg * 1,
                pageId: selectedObjectOnCanvas.pageId,
                id: selectedObjectOnCanvas.id,
                userType: selectedObjectOnCanvas.userType,
                elementType: "image",
                notaryId: selectedObjectOnCanvas.notaryId,
                elementName: selectedObjectOnCanvas.elementName,
                frontDocId: selectedObjectOnCanvas.frontDocId,
                backendJobDocId: selectedObjectOnCanvas.backendJobDocId,
                hoverCursor: "pointer",
              });
              imageField.setControlsVisibility({
                tr: false,
                bl: false,
                ml: false,
                mt: false,
                mr: false,
                mb: false,
                mtr: false,
              });
              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].add(imageField);

              const element =
                canvas[selectedObjectOnCanvas.frontDocId][
                  selectedObjectOnCanvas.pageId
                ].getActiveObject();
              if (element && element !== imageField) {
                canvas[selectedObjectOnCanvas.frontDocId][
                  selectedObjectOnCanvas.pageId
                ].remove(element);
              }

              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].renderAll();

              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].text;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleX = scaleImg;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleY = scaleImg;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].elementType = "image";
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].imageUrl = sealUrl;
            });

            actionDetail = `Notary ${selectedObjectOnCanvas.elementName} seal added`;

            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
      }
      setTimeout(() => {
        if (activeElement) {
          handleSocket(currentAction, actionDetail, activeElement);
        }
      }, 300);
    };

    //dragging event handler
    const objectModifiedHandler = (e) => {
      dataArr[e.target.backendJobDocId][e.target.pageId][e.target.id].left =
        e.target.left;
      dataArr[e.target.backendJobDocId][e.target.pageId][e.target.id].top =
        e.target.top;
      dataArr[e.target.backendJobDocId][e.target.pageId][e.target.id].scaleX =
        e.target.scaleX;
      dataArr[e.target.backendJobDocId][e.target.pageId][e.target.id].scaleY =
        e.target.scaleY;
      handleSocket(
        "update",
        `${e.target.userType} ${e.target.elementName} modified`,
        dataArr[e.target.backendJobDocId][e.target.pageId][e.target.id]
      );
    };
    // end of selection updated and created event
    if (canvas) {
      canvas.forEach((sigleCanvas, index) => {
        sigleCanvas.forEach((v, i) => {
          canvas[index][i].on({
            "selection:updated": selectedHandler,
            "selection:created": selectedHandler,
            "object:modified": objectModifiedHandler,
          });
        });
      });
    }
    // delete specific objects
    document.addEventListener(
      "keydown",
      (e, currentAction, actionDetail, activeElement) => {
        let element;
        const key = e.key;
        if (key === "Delete") {
          if (selectedObjectOnCanvas) {
            if (
              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ]
            ) {
              if (
                (element =
                  canvas[selectedObjectOnCanvas.frontDocId][
                    selectedObjectOnCanvas.pageId
                  ].getActiveObject())
              ) {
                currentAction = "delete";
                actionDetail = "object deleted";
                activeElement =
                  dataArr[selectedObjectOnCanvas.backendJobDocId][
                    selectedObjectOnCanvas.pageId
                  ][selectedObjectOnCanvas.id];
                setTimeout(() => {
                  if (activeElement) {
                    handleSocket(currentAction, actionDetail, activeElement);
                  }
                }, 300);
                dataArr[selectedObjectOnCanvas.backendJobDocId][selectObject][
                  elementspecificId
                ] = {};
                canvas[selectedObjectOnCanvas.frontDocId][selectObject].remove(
                  element
                );
              }
            }
          }
        }
      }
    );
    // end of specific delete objects from canvas
  };

  //convert url into pdf documents
  async function showPdf(PdfUri) {
    // console.log("PdfUri", PdfUri[0].jobDocument.status);
    var _PDF_DOC;
    let objectPdfDocs = [];
    for (let i = 0; i < PdfUri.length; i++) {
      try {
        setPdfRendering(true);

        const existingPdfBytes = await fetch(
          PdfUri[i].jobDocument.file_path
        ).then((res) => res.arrayBuffer());

        try {
          var pdfDoc = await PDFDocument.load(existingPdfBytes, {
            ignoreEncryption: true,
          });
        } catch (error) {
          console.log(error);
        }

        try {
          var pdfBytes = await pdfDoc.save();
        } catch (error) {
          console.log(error);
        }

        const bytes = new Uint8Array(pdfBytes);

        try {
          var blob = new Blob([bytes], { type: "application/pdf" });
        } catch (error) {
          console.log(error);
        }
        const docUrl = URL.createObjectURL(blob);
        if (docUrl) {
          try {
            _PDF_DOC = await PDFJS.getDocument({ url: docUrl }).promise;
            objectPdfDocs.push(_PDF_DOC);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    // console.log("objectPdfDocs", objectPdfDocs);
    setPdf(objectPdfDocs);
    setPdfRendering(false);
  }
  // making pdf pages into images
  async function renderPage() {
    setPageRendering(true);
    const imagesList = [];
    let tempArr = [];

    let docIndexArr = [];
    let data = [];
    const canv = document.createElement("canvas");
    canv.setAttribute("className", "canv");

    for (let i = 0; i < pdfURLArray.length; i++) {
      var indexName = "doc" + pdfURLArray[i].jobDocument.ID;
      tempArr[indexName] = [];
      docIndexArr.push(indexName);
    }

    setDocIndexArray(docIndexArr);
    //loop start
    for (let j = 0; j < pdf.length; j++) {
      imagesList.push([]);
      data.push([]);
      for (let i = 1; i <= pdf[j].numPages; i++) {
        var page = await pdf[j].getPage(i);
        var scale = 1;
        var viewport = page.getViewport({ scale: scale });
        scale = 680 / viewport.width;
        var viewport = page.getViewport({ scale: scale });
        canv.height = viewport.height;
        canv.width = viewport.width;
        var render_context = {
          canvasContext: canv.getContext("2d"),
          viewport: viewport,
        };

        await page.render(render_context).promise;
        // debugger;
        let img = canv.toDataURL("image/png");
        // debugger;
        imagesList[j].push(img);
        data[j].push([]);

        tempArr[docIndexArr[j]].push([]);
      }
    }

    if (Object.keys(dataArr).length === 0) {
      setDataArr(tempArr);
    }

    console.log("Images List", imagesList);

    setImages(imagesList);
    setPageRendering(false);
  }

  // show pdf on btn click

  const showDocumentPdf = (docID, dataBaseActiveDocumentId, Job_Documents) => {
    console.log("Job_Documents", Job_Documents);
    console.log("dataBaseActiveDocumentId", dataBaseActiveDocumentId);
    // updateHandler(docID);
    setDocSpecificId(Job_Documents);
    setBackendJobDocId(`doc${dataBaseActiveDocumentId}`);
    let action = "Active document";
    handleSocketDoc(action, +docID, +dataBaseActiveDocumentId);
    setDataBaseActiveDocId(dataBaseActiveDocumentId);

    setActiveIndex(docID);
    setCanvases(canvas[docID]);

    setDocIds(docID);
    gridScroll.current.scrollTo(0, 0);
  };

  const dragStart = (e) => {
    // common notary and signer set data
    e.dataTransfer.setData(
      "data-elementname",
      e.target.getAttribute("data-elementname")
    );
    e.dataTransfer.setData("data-type", e.target.getAttribute("data-type"));
    e.dataTransfer.setData(
      "data-element-type",
      e.target.getAttribute("data-element-type")
    );
    // common notary and signer set data

    // signer set data
    e.dataTransfer.setData(
      "data-elementuserid",
      e.target.getAttribute("data-elementuserid")
    );
    e.dataTransfer.setData(
      "data-elementColor",
      e.target.getAttribute("data-elementColor")
    );
    e.dataTransfer.setData(
      "data-signUrl",
      e.target.getAttribute("data-signUrl")
    );
    e.dataTransfer.setData(
      "data-initialUrl",
      e.target.getAttribute("data-initialUrl")
    );
    e.dataTransfer.setData(
      "data-signerName",
      e.target.getAttribute("data-signerName")
    );
    // end of signer set data

    // notary set data
    e.dataTransfer.setData("imagesrc", e.target.getAttribute("imagesrc"));
    e.dataTransfer.setData(
      "data-notaryname",
      e.target.getAttribute("data-notaryname")
    );
    e.dataTransfer.setData(
      "data-notarytitle",
      e.target.getAttribute("data-notarytitle")
    );
    e.dataTransfer.setData(
      "data-notaryfieldsbgcolor",
      e.target.getAttribute("data-notaryfieldsbgcolor")
    );
    e.dataTransfer.setData(
      "data-notaryid",
      e.target.getAttribute("data-notaryid")
    );
    e.dataTransfer.setData(
      "data-notarycommissionid",
      e.target.getAttribute("data-notarycommissionid")
    );
    e.dataTransfer.setData(
      "data-noratyexpirydate",
      e.target.getAttribute("data-noratyexpirydate")
    );
    e.dataTransfer.setData(
      "data-notarydisclosuretext",
      e.target.getAttribute("data-notarydisclosuretext")
    );
    //end of notary set data
  };
  const ondragOver = (e) => {
    // console.log("ondragOver");
    e.preventDefault();
  };
  const dragDropped = async (e, pageNum) => {
    e.preventDefault();
    // common getting signer and notary data
    let elementName = e.dataTransfer.getData("data-elementname");
    let type = e.dataTransfer.getData("data-type");
    let elementType = e.dataTransfer.getData("data-element-type");
    // console.log("elementTypeOfTag", elementTypeOfTag);
    // common getting signer and notary data

    // getting signer data
    let userID = e.dataTransfer.getData("data-elementuserid");
    let fieldBgColor = e.dataTransfer.getData("data-elementColor");
    let signUrl = e.dataTransfer.getData("data-signUrl");
    let initialUrl = e.dataTransfer.getData("data-initialUrl");
    let signerName = e.dataTransfer.getData("data-signerName");

    //end of getting signer data

    // getting  notray data
    let imageSoucreUrl = e.dataTransfer.getData("imagesrc");
    // let notaryId = e.dataTransfer.getData("data-notaryId");
    let notaryId = notaryData?.ID;
    // let notaryCommissionId = e.dataTransfer.getData("data-notaryCommissionId");
    // let noratyExpiryDate = e.dataTransfer.getData("data-noratyExpiryDate");
    // let notaryName = e.dataTransfer.getData("data-notaryName");
    // let notaryTitle = e.dataTransfer.getData("data-notaryTitle");
    let notaryFieldsBgColor = e.dataTransfer.getData(
      "data-notaryfieldsbgcolor"
    );
    let notaryDisclosureText = e.dataTransfer.getData(
      "data-notarydisclosuretext"
    );

    // end of getting notary data

    // canvas calculations

    let whichCanvas = pageNum;
    let sideWidth = documentContainer.current.offsetLeft;
    let topHeight = documentContainer.current.offsetTop;

    const canvasContainer = document.getElementById(
      `canvas-area-${docIds}-${pageNum}`
    ).offsetTop;
    let headingwidth = document.getElementById(
      `docPage-${docIds}-${pageNum}`
    ).offsetHeight;
    var X = e.clientX - sideWidth;
    var Y = e.clientY - topHeight + divScroll - canvasContainer + headingwidth;

    if (zoomValue) {
      X = X - (X / zoomValue) * (zoomValue - 1);
      Y = Y - (Y / zoomValue) * (zoomValue - 1);
    }
    let fieldsBgColor = fieldBgColor;
    let notaryColor = notaryFieldsBgColor;

    //start of socket data
    var currentAction = "add";
    var activeElement = "";
    var actionDetail = "";
    //end of socket data

    //end of canvas calculations
    let txt = "";
    let textBox = "";
    let imageField = "";
    const fakeImg = new Image();
    fakeImg.setAttribute("className", "imageSources");
    console.log("checkingelementname", e.dataTransfer);
    switch (elementName) {
      // signer fields
      case "writeText":
        txt = "WRITETEXT HERE";
        if (txt) {
          let lines = txt.split("\n");
          // Proceed with the rest of the code
        } else {
          console.error("Text is null or undefined.");
        }
        textBox = new fabric.IText(txt, {
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: fieldsBgColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementName: elementName,
          userID,
          userID,
          editable: false,
          elementType: elementType,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        dataArr[backendJobDocId][whichCanvas].push({
          text: txt,
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: fieldsBgColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          userID: userID,
          signerName: signerName,
          elementType: elementType,
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });

        actionDetail = `Signer ${elementName} added`;
        activeElement = dataArr[backendJobDocId][pageNum][textBox.id];
        break;
      case "participantName":
        txt = "WRITENAME HERE";
        textBox = new fabric.IText(txt, {
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: fieldsBgColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementType: elementType,
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        dataArr[backendJobDocId][whichCanvas].push({
          text: txt,
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: fieldsBgColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          userID: userID,
          signerName: signerName,
          elementType: elementType,
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        actionDetail = `Signer ${elementName} added`;
        activeElement = dataArr[backendJobDocId][pageNum][textBox.id];
        break;
      case "sign":
        txt = "WRITESIGN HERE";
        textBox = new fabric.IText(txt, {
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: fieldsBgColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementType: elementType,
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        dataArr[backendJobDocId][whichCanvas].push({
          text: txt,
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: fieldsBgColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          userID: userID,
          signerName: signerName,
          signUrl: signUrl,
          elementType: elementType,
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        actionDetail = `Signer ${elementName} added`;
        activeElement = dataArr[backendJobDocId][pageNum][textBox.id];
        break;
      case "participantInitial":
        txt = "WRITEINITIAL HERE";
        textBox = new fabric.IText(txt, {
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: fieldsBgColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementType: elementType,
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        dataArr[backendJobDocId][whichCanvas].push({
          text: txt,
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: fieldsBgColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          userID: userID,
          signerName: signerName,
          initialUrl: initialUrl,
          elementType: elementType,
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        actionDetail = `Signer ${elementName} added`;
        activeElement = dataArr[backendJobDocId][pageNum][textBox.id];
        break;

      //All notary fields below
      case "text":
        txt = "WRITETEXT HERE";
        textBox = new fabric.IText(txt, {
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: notaryColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementType: elementType,
          notaryId: notaryId,
          editable: true,
          elementName: elementName,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        dataArr[backendJobDocId][whichCanvas].push({
          text: txt,
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: notaryColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          notaryId: notaryId,
          elementType: elementType,
          notaryId: notaryId,
          editable: true,
          elementName: elementName,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        actionDetail = `Notary ${elementName} added`;
        activeElement = dataArr[backendJobDocId][pageNum][textBox.id];
        break;
      case "name":
      case "title":
      case "commission_id":
      case "commission_exp_date":
        txt = notaryData[elementName] || "Default Text";
        textBox = new fabric.IText(txt, {
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: notaryColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementType: elementType,
          notaryId: notaryId,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        dataArr[backendJobDocId][whichCanvas].push({
          text: txt,
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: notaryColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementType: elementType,
          notaryId: notaryId,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        actionDetail = `Notary ${elementName} added`;
        activeElement = dataArr[backendJobDocId][pageNum][textBox.id];
        break;
      case "signature":
      case "whitebox":
      case "checkbox":
      case "initial":
      case "seal":
        let imageUrl = "";
        if (notaryData) {
          fakeImg.src = `data:image/png;base64,` + notaryData[elementName];
          const imageUrl = notaryData[elementName];
        }
        async function embedImages() {
          return new Promise((resolve) => {
            fakeImg.onload = async () => {
              let CanvasArea = 720;
              var scaleImg = CanvasArea / 3 / fakeImg.width;
              if (fakeImg.width <= 720 / 5) {
                scaleImg = 1;
              }
              imageField = new fabric.Image(fakeImg, {
                left: X,
                top: Y,
                scaleX: scaleImg,
                scaleY: scaleImg,
                pageId: pageNum,
                id: dataArr[backendJobDocId][whichCanvas].length,
                userType: type,
                elementType: elementType,
                notaryId: notaryId,
                imageSoucreUrl,
                elementName: elementName,
                imageUrl,
                documentId: dataBaseActiveDocId,
                frontDocId: docIds,
                backendJobDocId,
                hoverCursor: "pointer",
              });
              dataArr[backendJobDocId][whichCanvas].push({
                left: X,
                top: Y,
                scaleX: scaleImg,
                scaleY: scaleImg,
                pageId: pageNum,
                id: dataArr[backendJobDocId][whichCanvas].length,
                userType: type,
                elementType: elementType,
                notaryId: notaryId,
                imageUrl: imageSoucreUrl,
                notaryId: notaryId,
                imageSoucreUrl,
                elementName: elementName,
                imageUrl,
                documentId: dataBaseActiveDocId,
                frontDocId: docIds,
                backendJobDocId,
                hoverCursor: "pointer",
              });
              if (elementName === "white out") {
                imageField.setControlsVisibility({
                  tr: true,
                  bl: true,
                  ml: true,
                  mt: true,
                  mr: true,
                  mb: true,
                  mtr: false,
                });
              } else {
                imageField.setControlsVisibility({
                  tr: false,
                  bl: false,
                  ml: false,
                  mt: false,
                  mr: false,
                  mb: false,
                  mtr: false,
                });
              }
              actionDetail = `Notary ${elementName} added`;
              activeElement = dataArr[backendJobDocId][pageNum][imageField.id];
              canvas[docIds][pageNum].add(imageField);
            };
            resolve(true);
            canvas.add(imageField);
          });
        }
        await embedImages();
        break;
      case "disclosure":
        txt = notaryData[elementName];
        textBox = new fabric.IText(txt, {
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: notaryColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          fontWeight: 700,
          fontFamily: "Arial",
          width: 500,
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementType: elementType,
          notaryId: notaryId,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        dataArr[backendJobDocId][whichCanvas].push({
          text: txt,
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: notaryColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          fontWeight: 700,
          fontFamily: "Arial",
          width: 500,
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          notaryId: notaryId,
          elementType: elementType,
          notaryId: notaryId,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        actionDetail = `Notary ${elementName} added`;
        activeElement = dataArr[backendJobDocId][pageNum][textBox.id];
        break;

      case "date":
        let Date = dayjs().format("MM/DD/YYYY");
        txt = Date;
        textBox = new fabric.IText(txt, {
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: notaryColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementType: elementType,
          notaryId: notaryId,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        dataArr[backendJobDocId][whichCanvas].push({
          text: Date,
          left: X,
          top: Y,
          scaleX: 1,
          scaleY: 1,
          backgroundColor: notaryColor,
          fontSize: 16,
          fontStyle: "italic",
          pageId: pageNum,
          lineHeight: 30,
          height: 30,
          fontWeight: 700,
          fontFamily: "Arial",
          id: dataArr[backendJobDocId][whichCanvas].length,
          userType: type,
          elementType: elementType,
          notaryId: notaryId,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        actionDetail = `Notary ${elementName} added`;
        activeElement = dataArr[backendJobDocId][pageNum][textBox.id];
        break;

      default:
        break;
    }

    if (
      elementName === "writeText" ||
      elementName === "name" ||
      elementName === "sign" ||
      elementName === "text" ||
      elementName === "title" ||
      elementName === "commission_id" ||
      elementName === "commission_exp_date" ||
      elementName === "disclosure" ||
      elementName === "date" ||
      elementName === "participantName" ||
      elementName === "notary name" ||
      elementName === "participantInitial"
    ) {
      textBox.setControlsVisibility({
        tr: false,
        bl: false,
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: false,
      });
      canvas[docIds][pageNum].add(textBox);
    }
    setTimeout(() => {
      if (activeElement) {
        handleSocket(currentAction, actionDetail, activeElement);
      }
    }, 300);
  };

  const isDocComplete = () => {
    const hasIncompleteDoc = dataArr[backendJobDocId].some((value, i) => {
      console.log("indicator", value);
      return value.some((item, index) => {
        if (item.elementType === "indicator") {
          setInCompleteDocError(true);
          return true; // Found incomplete document
        }
        return false;
      });
    });

    return !hasIncompleteDoc;
  };

  const makepdf = async (pdfData) => {
    // check if type indicator exists

    const timesRomanFont = await pdfData.embedFont(StandardFonts.Helvetica);

    // draw text on pages

    await Promise.all(
      dataArr[backendJobDocId].map(async (value, page) => {
        let elements = dataArr[backendJobDocId][page];
        const onepage = pdfData.getPages()[page];
        const { width, height } = onepage.getSize();
        const pwidth = width;
        const pheight = height;
        async function addElement() {
          await Promise.all(
            value.map(async (item, i) => {
              var fontSize = 16;
              var object = elements[i];
              console.log("object", object);
              console.log("value", value);

              if (
                object.elementType === "text" ||
                object.elementType === "editableText"
              ) {
                await onepage.drawText(object.text, {
                  x: object.left / (680 / pwidth),
                  y:
                    pheight -
                    object.top / (680 / pwidth) -
                    fontSize * object.scaleX +
                    object.scaleX * 3.5,

                  size: (16 / (680 / pwidth)) * object.scaleX,
                  font: timesRomanFont,
                  lineHeight: (21 / (680 / pwidth)) * object.scaleX,
                });
              } else if (object.elementType === "image") {
                const embedImages = async () => {
                  return new Promise((resolve, reject) => {
                    var imgURL =
                      object.elementName === "participantInitial"
                        ? object.imageUrl
                        : object.elementName === "sign"
                        ? object.imageUrl
                        : `data:image/png;base64,` + object.imageUrl;
                    // var imgURL =
                    //   "https://upload.wikimedia.org/wikipedia/commons/e/e9/Felis_silvestris_silvestris_small_gradual_decrease_of_quality.png";

                    // var imgURL =
                    //   "https://w7.pngwing.com/pngs/895/199/png-transparent-spider-man-heroes-download-with-transparent-background-free-thumbnail.png";

                    var fakeImg = new Image();

                    fakeImg.onload = async function () {
                      const objectWidth = await fakeImg.width;
                      const objectHeight = await fakeImg.height;

                      const jpgImageBytes = await fetch(imgURL).then((res) =>
                        res.arrayBuffer()
                      );

                      var jpgImage = await pdfData.embedPng(jpgImageBytes);
                      // var jpgImage = await pdfData.embedJpg(jpgImageBytes);

                      await onepage.drawImage(jpgImage, {
                        x: object.left / (680 / pwidth),

                        y:
                          -(object.top / (680 / pwidth)) +
                          pheight -
                          (objectHeight * object.scaleX) / (680 / pwidth),
                        width: (objectWidth * object.scaleX) / (680 / pwidth),
                        height: (objectHeight * object.scaleY) / (680 / pwidth),
                      });
                      resolve(true);
                    };
                    fakeImg.src = imgURL;
                  });
                };
                await embedImages();
              }
            })
          );
        }
        await addElement();
      })
    );
    return true;
  };

  const completeDocument = async () => {
    let requiredIndex;
    pdfURLArray.forEach((value) => {
      if (+value.jobDocument.ID === +dataBaseActiveDocId) {
        requiredIndex = value.jobDocument.ID;
      }
    });

    let index = pdfURLArray
      .map((value) => {
        return value.jobDocument.ID;
      })
      .indexOf(requiredIndex);

    console.log("requiredIndex", index);

    const check = isDocComplete();
    console.log("checkdoc", check);
    if (!isDocComplete()) {
      return;
    }

    const existingPdfBytes = await fetch(
      pdfURLArray[index].jobDocument.file_path
    ).then((res) => res.arrayBuffer());

    const pdfData = await PDFDocument.load(existingPdfBytes);
    const timesRomanFont = await pdfData.embedFont(StandardFonts.Helvetica);

    if (await makepdf(pdfData)) {
      const pdfBytes = await pdfData.save();

      const bytes = new Uint8Array(pdfBytes);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const pdfDataUri = await pdfData.saveAsBase64({ dataUri: true });

      const docUrl = URL.createObjectURL(blob);
      window.open(docUrl, "_blank");
      const finalUrl = pdfDataUri.split(",");
      const payload = {
        doc_base64: finalUrl[1],
        job_id: +pdfURLArray[0].jobDocument.job_id,
        // room_id: roomId,
        // front_doc_index: docIds,
        job_doc_id: +dataBaseActiveDocId,
        status: "COMPLETED",
        docId: +docSpecificId,
        // socket_event: "completedocument",
      };
      // const formdata = new FormData()
      // formdata.append("job_id",1)
      // formdata.append("doc_base64",finalUrl[1])
      // formdata.append("job_doc_id",1)
      // formdata.append("status","COMPLETED")
      // formdata.append("docId",1)
      axios({
        method: "patch",
        url: `${baseUrl}/job-documents/${Number(
          pdfURLArray[0].jobDocument.job_id
        )}`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then((res) => {
          console.log("resofcomplete", res);
          console.log("roomId", roomId);

          // const docPreviousData = [...pdfURLArray]
          // const updatedDoc = docPreviousData[docIds].map((value,index)=>{
          //   if(+docIds === index){
          //    return value.Job_Documents.status = "COMPLETED"
          //   }
          //   return value
          // })
          // setPdfURLArray(updatedDoc)
          pdfURLArray[index].jobDocument.status = "COMPLETED";

          const completeCanvasBox = document.getElementById(
            "completedPlaceholder-" + docIds
          );
          if (completeCanvasBox) {
            completeCanvasBox.style.display = "block";
          }

          const hideCompleteBtn = document.getElementById(
            "completebtn" + docIds
          );
          if (hideCompleteBtn) {
            hideCompleteBtn.style.display = "none";
          }

          skt.emit("message", {
            socketRoomId: roomId,
            front_doc_index: +docIds,
            doc_id: +dataBaseActiveDocId,
            action: "completedocument",
            jobId: Number(pdfURLArray[0].jobDocument.job_id),
          });
        })
        .catch((error) => {
          console.log("error", error);
          // enqueueSnackbar(`${error.response.data.message}`, { variant: "error" });
        });
    }
  };

  const EndSession = () => {
    skt.emit("message", {
      action: "endSession",
      socketRoomId: roomId,
      openModal: true,
    });

    localStorage.removeItem("check_Session");

    console.log("meta original ", originalMeta);
    console.log("meta extracted ", dataArr);

    //merging original and extracted data
    let originalMetaOfTagging = originalMeta;
    let extractedMeta = dataArr;
    let meta = {};
    for (let keys in originalMetaOfTagging) {
      if (keys in extractedMeta) {
        let value = extractedMeta[keys];
        let key = keys;
        meta[key] = value;
      } else {
        let value = originalMetaOfTagging[keys];
        let key = keys;
        meta[key] = value;
      }
    }
    let stringifyMeta = JSON.stringify(meta);
    //end of merging original and extracted data

    // stringify extracted meta
    let extractedMetaForSringify = {};
    for (let keys in dataArr) {
      let value = dataArr[keys];
      extractedMetaForSringify[keys] = value;
    }

    console.log("check update meta", meta);

    const payload = {
      metadata: stringifyMeta, // sending original meta
      status: "END NOTARIZATION",
      jobId: Number(pdfURLArray[0].jobDocument.job_id),
      session_meta: JSON.stringify(extractedMetaForSringify),
    };
    axios({
      method: "patch",
      url: `${baseUrl}/start-end/${Number(pdfURLArray[0].jobDocument.job_id)}`,
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("resstartEndSessionById", res);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  const zoomCanvas = (val) => {
    console.log("Test" + docIds);
    const preZoom = canvases[docIds].getZoom();
    const zoom = preZoom + val;
    if (val > 0 && preZoom >= 1.1) return;
    if (val < 0 && preZoom <= 0.8) return;
    setZoomValue(zoom);
    const width = 680;
    const height = 962;
    canvases.map((_item, i) => {
      canvases[i].setZoom(zoom);
      canvases[i].setWidth(width * zoom);
      canvases[i].setHeight(height * zoom);
    });
  };
  const minusDocumentNum = () => {
    if (docIds) {
      let ActiveDocId;
      var tempminus = docIds - 1;
      console.log("temp", tempminus, docIds);
      if (tempminus > -1) {
        ActiveDocId = docIds;
        let currentActiveDocId = ActiveDocId - 1;
        setDocIds(currentActiveDocId);
      }
    }
    gridScroll.current.scrollTo(0, 0);
  };
  const addDocumentNum = () => {
    if (typeof docIds !== "string") {
      let ActiveDocId;
      var temp = docIds + 1;
      if (temp <= images.length - 1) {
        ActiveDocId = docIds;
        let currentActiveDocId = ActiveDocId + 1;
        setDocIds(currentActiveDocId);
      }
    }
    gridScroll.current.scrollTo(0, 0);
  };

  const handleSocket = (Action, ActionDetail, activeElement) => {
    console.log("CurrentAction", Action);
    console.log("CurrentActionDetail", ActionDetail);
    console.log("CurrentActiveElement", activeElement);
    // debugger;
    console.log("dataBaseActiveDocId", dataBaseActiveDocId);
    //merging original and extracted data
    let originalMetaOfTagging = originalMeta;
    let extractedMeta = dataArr;
    let meta = {};
    for (let keys in originalMetaOfTagging) {
      if (keys in extractedMeta) {
        let value = extractedMeta[keys];
        let key = keys;
        meta[key] = value;
      } else {
        let value = originalMetaOfTagging[keys];
        let key = keys;
        meta[key] = value;
      }
    }
    let stringifyMeta = JSON.stringify(meta);
    console.log("metasocket", meta);
    //end of merging original and extracted data
    skt.emit("joinRoom", roomId);
    console.log("joinRoom", roomId);
    skt.emit(
      "message",
      {
        meta: stringifyMeta,
        sessionId: Number(pdfURLArray[0].session_id),
        jobId: Number(pdfURLArray[0].jobDocument.job_id),
        userId: notaryData?.id,
        userType: notaryData?.type,
        docId: +docIds,
        action: Action,
        actionDetail: ActionDetail,
        element: activeElement,
        pageId: +activeElement.pageId,
        elementType: activeElement.elementType,
        socketRoomId: roomId,
        dataBaseActiveDocId: +activeElement.documentId,
        logType: activeElement.userType.toUpperCase(),
      },
      (res) => {
        console.log("res", res);
      }
    );
  };
  const handleSocketDoc = (action, docID, dataBaseActiveDocumentId) => {
    console.log("roomIdin socket", roomId);
    skt.emit("joinRoom", roomId);

    skt.emit(
      "message",
      {
        docID: +docID,
        action,
        dataBaseActiveDocumentId: +dataBaseActiveDocumentId,
        jobId: Number(pdfURLArray[0].jobDocument.job_id),
        sessionId: Number(pdfURLArray[0].session_id),
        socketRoomId: roomId,
      },
      (sendData) => {
        console.log("sendData", sendData);
      }
    );
  };

  useEffect(() => {
    showPdf(pdfURLArray);
  }, [pdfURLArray]);

  // call usePdf function

  useEffect(() => {
    getDataByQueryParaMeter();
  }, []);

  useEffect(() => {
    skt.on("message", (response) => {
      console.log("notarycomponetsocket", response);
      setSktResponse(response);
    });
    return () => {
      skt.disconnect();
    };
  }, []);

  useEffect(() => {
    if (sktResponse && sktResponse.userId != notaryData.id) {
      console.log("socket response", sktResponse);
      var element = sktResponse?.element;

      // start of update
      if (sktResponse.action === "update" && element) {
        // element type image
        if (element.elementType === "image") {
          const fakeImg = new Image();
          console.log("checking element", element);
          fakeImg.src =
            element.elementName === "participantInitial"
              ? element.imageUrl
              : element.elementName === "sign"
              ? element.imageUrl
              : `data:image/png;base64,` + element.imageUrl;

          var previousElement = [];

          canvas[sktResponse.element.frontDocId][sktResponse.element.pageId]
            .getObjects()
            .forEach(function (obj) {
              if (obj.id === sktResponse.element.id) {
                previousElement = obj;
              }
            });
          fakeImg.onload = async () => {
            var scaleImg = 720 / 5 / fakeImg.width; // Canvas area constant will replace 720

            if (fakeImg.width <= 720 / 5) {
              scaleImg = 1;
            }

            var imageField = new fabric.Image(fakeImg, {
              left: sktResponse.element?.left,
              top: sktResponse.element.top,
              scaleX: sktResponse.element.scaleX,
              scaleY: sktResponse.element.scaleY,
              pageId: sktResponse.element.pageId,
              id: sktResponse.element.id,
              userType: sktResponse.element.userType,
              elementType: sktResponse.element.elementType,
              notaryId: sktResponse.element.notaryId,
              elementName: sktResponse.element.elementName,
              frontDocId: sktResponse.element.frontDocId,
              backendJobDocId: sktResponse.element.backendJobDocId,
            });

            imageField.setControlsVisibility({
              tr: false,
              bl: false,
              ml: false,
              mt: false,
              mr: false,
              mb: false,
              mtr: false,
            });

            if (canvas) {
              canvas[sktResponse.element.frontDocId][
                sktResponse.element.pageId
              ].add(imageField);
            }

            canvas[sktResponse.element.frontDocId][
              sktResponse.element.pageId
            ].remove(previousElement);

            // updating dataarray
            dataArr[sktResponse.element.backendJobDocId][
              sktResponse.element.pageId
            ][sktResponse.element.id].scaleX = sktResponse.element.scaleX;
            dataArr[sktResponse.element.backendJobDocId][
              sktResponse.element.pageId
            ][sktResponse.element.id].scaleY = sktResponse.element.scaleY;
            dataArr[sktResponse.element.backendJobDocId][
              sktResponse.element.pageId
            ][sktResponse.element.id].elementType = "image";
            dataArr[sktResponse.element.backendJobDocId][
              sktResponse.element.pageId
            ][sktResponse.element.id].imageUrl = sktResponse.element.imageUrl;
            // end updating dataarray

            canvas[sktResponse.element.frontDocId][
              sktResponse.element.pageId
            ].renderAll();
          };
        } else if (
          element.elementType === "text" ||
          element.elementType === "editableText"
        ) {
          console.log("elementUpdated", sktResponse.element);

          var previousElement = [];
          if (canvas) {
            canvas[sktResponse.element.frontDocId][sktResponse.element.pageId]
              .getObjects()
              .forEach(function (obj) {
                if (obj.id === sktResponse.element.id) {
                  previousElement = obj;
                }
              });
          }
          var elements = new fabric.IText(sktResponse.element.text, {
            left: sktResponse.element.left,
            top: sktResponse.element.top,
            scaleX: sktResponse.element.scaleX,
            scaleY: sktResponse.element.scaleY,
            backgroundColor: sktResponse.element.backgroundColor,
            fontSize: sktResponse.element.fontSize,
            fontStyle: sktResponse.element.fontStyle,
            pageId: sktResponse.element.pageId,
            height: sktResponse.element.height,
            fontWeight: sktResponse.element.fontWeight,
            fontFamily: sktResponse.element.fontFamily,
            id: sktResponse.element.id,
            frontDocId: sktResponse.element.frontDocId,
            userType: sktResponse.element.userType,
            editable: false,
            elementType: sktResponse.element.elementType,
            userID: sktResponse.element.userID, // this participants id
            notaryId: sktResponse.element.notaryId,
            elementName: sktResponse.element.elementName,
            selectable: true,
            documentId: sktResponse.element.dataBaseActiveDocId,
            backendJobDocId: sktResponse.element.backendJobDocId,
          });
          elements.setControlsVisibility({
            tr: false,
            bl: false,
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            mtr: false,
          });
          canvas[sktResponse.element.frontDocId][
            sktResponse.element.pageId
          ].remove(previousElement);

          // start updating dataarray

          dataArr[sktResponse.element.backendJobDocId][
            sktResponse.element.pageId
          ][sktResponse.element.id].text = sktResponse.element.text;
          dataArr[sktResponse.element.backendJobDocId][
            sktResponse.element.pageId
          ][sktResponse.element.id].elementType =
            sktResponse.element.elementName === "text"
              ? "editableText"
              : sktResponse.element.elementName === "writeText"
              ? "editableText"
              : "text";
          dataArr[sktResponse.element.backendJobDocId][
            sktResponse.element.pageId
          ][sktResponse.element.id].backgroundColor =
            sktResponse.element.backgroundColor;
          // end updating dataarray

          canvas[sktResponse.element.frontDocId][
            sktResponse.element.pageId
          ].add(elements);

          canvas[sktResponse.element.frontDocId][
            sktResponse.element.pageId
          ].renderAll();
        } else if (element.elementType === "indicator") {
          console.log("indicatorchecking", sktResponse.element);
        }
        // end of text
      } else if (sktResponse.action === "add" && element) {
        console.log("socket add response", sktResponse);
        // element type image
        if (element.elementType === "image") {
          const fakeImg = new Image();
          console.log("checking element", element);
          fakeImg.src =
            element.elementName === "participantInitial"
              ? element.imageUrl
              : element.elementName === "sign"
              ? element.imageUrl
              : `data:image/png;base64,` + element.imageUrl;
          var previousElement = [];

          canvas[sktResponse.element.frontDocId][sktResponse.element.pageId]
            .getObjects()
            .forEach(function (obj) {
              if (obj.id === sktResponse.element.id) {
                previousElement = obj;
              }
            });
          fakeImg.onload = async () => {
            var scaleImg = 720 / 6 / fakeImg.width; // Canvas area constant will replace 720

            if (fakeImg.width <= 720 / 5) {
              scaleImg = 1;
            }

            var imageField = new fabric.Image(fakeImg, {
              left: sktResponse.element?.left,
              top: sktResponse.element.top,
              scaleX: sktResponse.element.scaleX,
              scaleY: sktResponse.element.scaleY,
              pageId: sktResponse.element.pageId,
              id: sktResponse.element.id,
              userType: sktResponse.element.userType,
              elementType: sktResponse.element.elementType,
              notaryId: sktResponse.element.notaryId,
              elementName: sktResponse.element.elementName,
              frontDocId: sktResponse.element.frontDocId,
            });

            imageField.setControlsVisibility({
              tr: false,
              bl: false,
              ml: false,
              mt: false,
              mr: false,
              mb: false,
              mtr: false,
            });
            canvas[sktResponse.element.frontDocId][
              sktResponse.element.pageId
            ].remove(previousElement);

            dataArr[sktResponse.element.backendJobDocId][
              sktResponse.element.pageId
            ].push({
              left: sktResponse.element.left,
              top: sktResponse.element.top,
              scaleX: sktResponse.element.scaleX,
              scaleY: sktResponse.element.scaleY,
              pageId: sktResponse.element.pageId,
              id: sktResponse.element.id,
              userType: sktResponse.element.userType,
              elementType: sktResponse.element.elementType,
              notaryId: sktResponse.element.notaryId,
              elementName: sktResponse.element.elementName,
              frontDocId: sktResponse.element.frontDocId,
            });
            if (canvas) {
              canvas[sktResponse.element.frontDocId][
                sktResponse.element.pageId
              ].add(imageField);
            }
          };
        }
        //end of element type image

        // start of text
        else if (
          element.elementType === "text" ||
          element.elementType === "editableText"
        ) {
          canvas[sktResponse.element.frontDocId][sktResponse.element.pageId]
            .getObjects()
            .forEach(function (obj) {
              if (obj.id === sktResponse.element.id) {
                previousElement = obj;
              }
            });
          var elements = new fabric.IText(sktResponse.element.text, {
            left: sktResponse.element.left,
            top: sktResponse.element.top,
            scaleX: sktResponse.element.scaleX,
            scaleY: sktResponse.element.scaleY,
            backgroundColor: sktResponse.element.backgroundColor,
            fontSize: sktResponse.element.fontSize,
            fontStyle: sktResponse.element.fontStyle,
            pageId: sktResponse.element.pageId,
            height: sktResponse.element.height,
            fontWeight: sktResponse.element.fontWeight,
            fontFamily: sktResponse.element.fontFamily,
            id: sktResponse.element.id,
            frontDocId: sktResponse.element.frontDocId,
            userType: sktResponse.element.userType,
            editable: false,
            elementType: sktResponse.element.elementType,
            userID: sktResponse.element.userID, // this participants id
            notaryId: sktResponse.element.notaryId,
            elementName: sktResponse.element.elementName,
            selectable: true,
            documentId: sktResponse.element.dataBaseActiveDocId,
          });
          elements.setControlsVisibility({
            tr: false,
            bl: false,
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            mtr: false,
          });
          canvas[sktResponse.element.frontDocId][
            sktResponse.element.pageId
          ].remove(previousElement);

          // start updating dataarray
          console.log(sktResponse.element.frontDocId);
          console.log(sktResponse.element.pageId);
          console.log(sktResponse.element.id);
          console.log(sktResponse.element.text);

          dataArr[sktResponse.element.backendJobDocId][
            sktResponse.element.pageId
          ].push({
            left: sktResponse.element.left,
            top: sktResponse.element.top,
            scaleX: sktResponse.element.scaleX,
            scaleY: sktResponse.element.scaleY,
            backgroundColor: sktResponse.element.backgroundColor,
            fontSize: sktResponse.element.fontSize,
            fontStyle: sktResponse.element.fontStyle,
            pageId: sktResponse.element.pageId,
            height: sktResponse.element.height,
            fontWeight: sktResponse.element.fontWeight,
            fontFamily: sktResponse.element.fontFamily,
            id: sktResponse.element.id,
            frontDocId: sktResponse.element.frontDocId,
            userType: sktResponse.element.userType,
            editable: false,
            elementType: sktResponse.element.elementType,
            userID: sktResponse.element.userID, // this participants id
            notaryId: sktResponse.element.notaryId,
            elementName: sktResponse.element.elementName,
            selectable: true,
            documentId: sktResponse.element.dataBaseActiveDocId,
          });

          canvas[sktResponse.element.frontDocId][
            sktResponse.element.pageId
          ].add(elements);
        }
        // end of text
      } else if (sktResponse.action === "delete" && element) {
        var previousElement = [];
        canvas[sktResponse.element.frontDocId][sktResponse.element.pageId]
          .getObjects()
          .forEach(function (obj) {
            if (obj.id === sktResponse.element.id) {
              previousElement = obj;
            }
          });
        dataArr[sktResponse.element.backendJobDocId][
          sktResponse.element.pageId
        ][sktResponse.element.id] = {};
        canvas[sktResponse.element.frontDocId][
          sktResponse.element.pageId
        ].remove(previousElement);
      }
      // end of delete
    }
  }, [sktResponse]);

  useEffect(() => {
    console.log("updated dataArray", dataArray);
  }, [dataArray]);

  useEffect(() => {
    pdf && renderPage();
  }, [pdf]);
  // setting canvas background images

  useEffect(() => {
    const allDocCanvas = images?.map((value, index) => {
      // console.log("doc loop", index);
      const newCanvasArray = value?.map((_value, ind) => {
        const newCanvas = new fabric.Canvas(`canvas${index + "-" + ind}`, {
          height: 962,
          width: 680,
          backgroundImage: _value,
        });

        return newCanvas;
      });

      return newCanvasArray;
    });

    // console.log("allDocCanvas", allDocCanvas);
    setCanvases(allDocCanvas[docIds]);
    setCanvas(allDocCanvas);

    // hide multiple canvas
    Array.from(document.getElementsByClassName("canvas-box")).forEach(
      (container) => (container.style.display = "none")
    );
    // show active canvas only
    const activeCanvas = document.getElementById("canvas-box-" + docIds);
    if (activeCanvas) {
      activeCanvas.style.display = "block";
    }
  }, [images]);
  // Active only selected document

  useEffect(() => {
    // setCanvases(canvas[docIds]);

    // hide multiple canvas
    Array.from(document.getElementsByClassName("canvas-box")).forEach(
      (container) => (container.style.display = "none")
    );
    // show active canvas only
    const activeCanvas = document.getElementById("canvas-box-" + docIds);
    if (activeCanvas) {
      activeCanvas.style.display = "block";
    }
  }, [docIds]);

  useEffect(() => {
    displayDataOnCanvas();
  }, [canvas]);

  useEffect(() => {
    console.log("dataArr", dataArr);
  }, [dataArr]);

  useEffect(() => {
    if (pdfURLArray) {
      console.log("docids", docIds);
      if (pdfURLArray[docIds]?.jobDocument?.status === "COMPLETED") {
        const completeCanvasBox = document.getElementById(
          "completedPlaceholder-" + docIds
        );

        if (completeCanvasBox) {
          completeCanvasBox.style.display = "block";
        }

        const hideCompleteBtn = document.getElementById("completebtn" + docIds);
        if (hideCompleteBtn) {
          hideCompleteBtn.style.display = "none";
        }
      } else if (pdfURLArray[docIds]?.jobDocument?.status !== "COMPLETED") {
        const hideCompleteBtn = document.getElementById("completebtn" + docIds);
        if (hideCompleteBtn) {
          hideCompleteBtn.style.display = "block";
        }
      }
    }
  }, [docIds]);

  useEffect(() => {
    console.log("dataArr", dataArr);
  }, [dataArr]);
  const socket = () => {
    skt.emit("message", "ahmed");
    console.log("clicked");
  };

  console.log("PDF URLS", pdfURLArray);

  return (
    <>
      <Grid container style={{ height: "100vh" }}>
        <Grid
          style={{ height: "inherit" }}
          item
          xs={2.5}
          className={classes.sideMainContainer}
        >
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
        </Grid>
        <Grid
          style={{ height: "inherit" }}
          item
          xs={7}
          sx={{ backgroundColor: "#ebebeb" }}
        >
          <Grid
            container
            style={{ height: "inherit" }}
            className={classes.mainPagesHeader}
          >
            <Grid item xs={12} className={classes.headerGrid12}>
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
              xs={12}
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
        </Grid>
        <Grid
          item
          xs={2.5}
          sx={{ overflowY: "auto", height: "inherit" }}
          className={classes.ActionsMainContainer}
        >
          <Grid container>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <Typography className={classes.ActionText}>Actions</Typography>
            </Grid>

            <Grid item xs={12}>
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
              <Box
                className={classes.nameWithBox}
                style={{ marginBottom: "20px" }}
              >
                <span
                  style={{ background: "rgb(220,38,38)" }}
                  className={classes.smallBox2}
                ></span>
                <span className={classes.personName}>
                  {notaryData?.fullname}
                </span>
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
        </Grid>
      </Grid>
      <Dialog open={inCompleteDocError}>
        <Box sx={{ padding: "3rem" }}>
          <h2 style={{ textAlign: "center" }}>Document is incomplete</h2>
          <DialogActions>
            <CloseButton
              label={"ok"}
              onClick={() => setInCompleteDocError(false)}
            />
          </DialogActions>
          546
        </Box>
      </Dialog>

      <button onClick={socket}>check</button>
    </>
  );
};

export default NotaryAndSigner;
