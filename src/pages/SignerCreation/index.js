import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PersonIcon from "@mui/icons-material/Person";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Typography
} from "@mui/material";
import axios from "axios";
import { fabric } from "fabric";
import { PDFDocument } from "pdf-lib";
import { GlobalWorkerOptions } from 'pdfjs-dist';
import React, { useEffect, useRef, useState } from "react";
import {
  FaSignature,
  FaTextWidth
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { skt } from "../../App";
import Loader from "../../Assets/images/loader.gif";
import notaryLogo from "../../Assets/images/notary_logo.png";
import CloseButton from "../../Components/Button";
import { useStyles } from "../../styles";
import { baseUrl } from "../../Utils/constant";

const PDFJS = window["pdfjs-dist/build/pdf"];
GlobalWorkerOptions.workerSrc =
  "//mozilla.github.io/pdf.js/build/pdf.worker.js";
const SignerCreation = () => {
  const [pdf, setPdf] = useState("");
  const [pdfRendering, setPdfRendering] = useState("");
  const [images, setImages] = useState([]);
  const [pageRendering, setPageRendering] = useState("");
  const [canvases, setCanvases] = useState("");
  const [canvas, setCanvas] = useState("");
  const [divScroll, setDivScroll] = useState(0);
  const [dataArray, setDataArray] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [dataBaseActiveDocId, setDataBaseActiveDocId] = useState("");

  const [docIds, setDocIds] = useState("");
  const [zoomValue, setZoomValue] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [participantsDetails, setParticipantsDetails] = useState("");
  const [sktResponse, setSktResponse] = useState("");

  const [pdfURLArray, setPdfURLArray] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [open, setOpen] = useState(false);
  const [dataArr, setDataArr] = useState([]);
  const [docIndexArray, setDocIndexArray] = useState([]);
  const [backendJobDocId, setBackendJobDocId] = useState("");
  const [originalMeta, setOriginalMeta] = useState([]);

  const documentContainer = useRef();
  const gridScroll = useRef(null);
  const classes = useStyles();
  const { id } = useParams();

  const getDataByQueryParaMeter = () => {
    axios({
      method: "get",
      url: `${baseUrl}/findSessionLink/${id}`,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("resOfSigner", res.data.jobParticipants);
        setParticipants(res.data.jobParticipants);
        setParticipantsDetails(res.data.jobParticipants[0]);
        setPdfURLArray(res.data.sessionDocs);
        setRoomId(res.data.sessions[0].socket_room_id);
        setOriginalMeta(JSON.parse(res.data.sessions[0].metadata));
        skt.emit("joinRoom", res?.data.sessions[0]?.socket_room_id);

        // filter selected documents data

        const filterDocids = res.data.sessionDocs?.map((value) => {
          return `doc${value.jobDocument.ID}`;
        });

        let selectedIndex = 0;
        let associateDataArray = [];
        let meta = JSON.parse(res.data.sessions[0].metadata);

        for (let index in filterDocids) {
          console.log("selectedIndex", selectedIndex);
          let key = filterDocids[index];
          if (key in meta) {
            let value = meta[key];
            // changing frontend doc id
            value?.map((item) => {
              item?.map((value) => {
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
        // end of filter selected documents data
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
  useEffect(() => {
    console.log("dataArr", dataArr);
  }, [dataArr]);
  useEffect(() => {
    skt.on("message", (response) => {
      console.log("responsetestingonsigner", response);
      setSktResponse(response);
    });

    return () => {
      skt.disconnect();
    };
  }, []);

  useEffect(() => {
    if (sktResponse && sktResponse.userId != participantsDetails.id) {
      var element = sktResponse?.element;

      // start of update
      if (sktResponse.action === "update" && element) {
        if (element.elementType === "image") {
          console.log("left", sktResponse);
          console.log("top", sktResponse.element.top);
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
            var permission;
            if (sktResponse.element.userType === "notary") {
              permission = false;
            } else if (
              +sktResponse.element.userID === +participantsDetails.id
            ) {
              permission = true;
            } else {
              permission = false;
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
              selectable: permission,
              backendJobDocId: sktResponse.element.backendJobDocId,

              hoverCursor:
                sktResponse.element.userType === "notary"
                  ? "not-allowed"
                  : +sktResponse.element.userID !== +participantsDetails.id
                  ? "not-allowed"
                  : "pointer",
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

            // dataArr[sktResponse.element.backendJobDocId][
            //   sktResponse.element.pageId
            // ][sktResponse.element.id].left = sktResponse.element.left;
            // dataArr[sktResponse.element.backendJobDocId][
            //   sktResponse.element.pageId
            // ][sktResponse.element.id].top = sktResponse.element.top;
            // end updating dataarray

            // canvas[sktResponse.element.frontDocId][
            //   sktResponse.element.pageId
            // ].renderAll();
          };
        } else if (
          element.elementType === "text" ||
          element.elementType === "editableText"
        ) {
          console.log("checkleft", sktResponse.element.left);

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
          var permission;
          if (sktResponse.element.userType === "notary") {
            permission = false;
          } else if (+sktResponse.element.userID === +participantsDetails.id) {
            permission = true;
          } else {
            permission = false;
          }
          console.log("permission check", permission);
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
            editable: permission,
            elementType: sktResponse.element.elementType,
            userID: sktResponse.element.userID, // this participants id
            notaryId: sktResponse.element.notaryId,
            elementName: sktResponse.element.elementName,
            selectable: permission,
            documentId: sktResponse.element.dataBaseActiveDocId,
            backendJobDocId: sktResponse.element.backendJobDocId,
            hoverCursor:
              sktResponse.element.userType === "notary"
                ? "not-allowed"
                : +sktResponse.element.userID !== +participantsDetails.id
                ? "not-allowed"
                : "pointer",
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
          // canvas[sktResponse.element.frontDocId][
          //   sktResponse.element.pageId
          // ].renderAll();
        } else if (element.elementType === "indicator") {
          var previousElement = [];
          console.log("checkleft", sktResponse.element.left);
          dataArr[sktResponse.element.backendJobDocId][
            sktResponse.element.pageId
          ][sktResponse.element.id].left = sktResponse.element.left;
          dataArr[sktResponse.element.backendJobDocId][
            sktResponse.element.pageId
          ][sktResponse.element.id].top = sktResponse.element.top;

          if (canvas) {
            canvas[sktResponse.element.frontDocId][sktResponse.element.pageId]
              .getObjects()
              .forEach(function (obj) {
                if (obj.id === sktResponse.element.id) {
                  previousElement = obj;
                }
              });
          }

          var permission;
          if (sktResponse.element.userType === "notary") {
            permission = false;
          } else if (+sktResponse.element.userID === +participantsDetails.id) {
            permission = true;
          } else {
            permission = false;
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
            editable: permission,
            elementType: sktResponse.element.elementType,
            userID: sktResponse.element.userID, // this participants id
            notaryId: sktResponse.element.notaryId,
            elementName: sktResponse.element.elementName,
            selectable: permission,
            documentId: sktResponse.element.dataBaseActiveDocId,
            backendJobDocId: sktResponse.element.backendJobDocId,
            hoverCursor:
              sktResponse.element.userType === "notary"
                ? "not-allowed"
                : +sktResponse.element.userID !== +participantsDetails.id
                ? "not-allowed"
                : "pointer",
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
          // canvas[sktResponse.element.frontDocId][
          //   sktResponse.element.pageId
          // ].renderAll();
        }
      }

      // end of update

      // start of add
      else if (sktResponse.action === "add" && element) {
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
            var permission;
            if (sktResponse.element.userType === "notary") {
              permission = false;
            } else if (
              +sktResponse.element.userID === +participantsDetails.id
            ) {
              permission = true;
            } else {
              permission = false;
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
              selectable: permission,
              backendJobDocId: sktResponse.element.backendJobDocId,
              hoverCursor:
                sktResponse.element.userType === "notary"
                  ? "not-allowed"
                  : +sktResponse.element.userID !== +participantsDetails.id
                  ? "not-allowed"
                  : "pointer",
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
              selectable: false,
              backendJobDocId: sktResponse.element.backendJobDocId,
              hoverCursor:
                sktResponse.element.userType === "notary"
                  ? "not-allowed"
                  : +sktResponse.element.userID !== +participantsDetails.id
                  ? "not-allowed"
                  : "pointer",
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
          var permission;
          if (sktResponse.element.userType === "notary") {
            permission = false;
          } else if (+sktResponse.element.userID === +participantsDetails.id) {
            permission = true;
          } else {
            permission = false;
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
            editable: permission,

            elementType: sktResponse.element.elementType,
            userID: sktResponse.element.userID, // this participants id
            notaryId: sktResponse.element.notaryId,
            elementName: sktResponse.element.elementName,
            selectable: permission,
            documentId: sktResponse.element.dataBaseActiveDocId,
            backendJobDocId: sktResponse.element.backendJobDocId,
            hoverCursor:
              sktResponse.element.userType === "notary"
                ? "not-allowed"
                : +sktResponse.element.userID !== +participantsDetails.id
                ? "not-allowed"
                : "pointer",
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
            editable: permission,
            elementType: sktResponse.element.elementType,
            userID: sktResponse.element.userID, // this participants id
            notaryId: sktResponse.element.notaryId,
            elementName: sktResponse.element.elementName,
            selectable: permission,
            documentId: sktResponse.element.dataBaseActiveDocId,
            backendJobDocId: sktResponse.element.backendJobDocId,
            hoverCursor:
              sktResponse.element.userType === "notary"
                ? "not-allowed"
                : +sktResponse.element.userID !== +participantsDetails.id
                ? "not-allowed"
                : "pointer",
          });
          canvas[sktResponse.element.frontDocId][
            sktResponse.element.pageId
          ].add(elements);
        }
        // end of text

        //start of indicator
        else if (element.elementType === "indicator") {
          canvas[sktResponse.element.frontDocId][sktResponse.element.pageId]
            .getObjects()
            .forEach(function (obj) {
              if (obj.id === sktResponse.element.id) {
                previousElement = obj;
              }
            });
          var permission;
          if (sktResponse.element.userType === "notary") {
            permission = false;
          } else if (+sktResponse.element.userID === +participantsDetails.id) {
            permission = true;
          } else {
            permission = false;
          }
          console.log("permission", permission);
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
            editable:
              sktResponse.element.elementName === "participantName"
                ? false
                : permission,
            elementType: sktResponse.element.elementType,
            userID: sktResponse.element.userID, // this participants id
            notaryId: sktResponse.element.notaryId,
            elementName: sktResponse.element.elementName,
            selectable: permission,
            documentId: sktResponse.element.dataBaseActiveDocId,
            backendJobDocId: sktResponse.element.backendJobDocId,
            hoverCursor:
              sktResponse.element.userType === "notary"
                ? "not-allowed"
                : +sktResponse.element.userID !== +participantsDetails.id
                ? "not-allowed"
                : "pointer",
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
            editable: permission,
            elementType: sktResponse.element.elementType,
            userID: sktResponse.element.userID, // this participants id
            notaryId: sktResponse.element.notaryId,
            elementName: sktResponse.element.elementName,
            selectable: permission,
            documentId: sktResponse.element.dataBaseActiveDocId,
            backendJobDocId: sktResponse.element.backendJobDocId,
            hoverCursor:
              sktResponse.element.userType === "notary"
                ? "not-allowed"
                : +sktResponse.element.userID !== +participantsDetails.id
                ? "not-allowed"
                : "pointer",
          });
          canvas[sktResponse.element.frontDocId][
            sktResponse.element.pageId
          ].add(elements);
        }
        //end of indicator
      }
      // end of add

      // start of delete
      else if (sktResponse.action === "delete" && element) {
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
    console.log("socketdocid", sktResponse);
    if (sktResponse && sktResponse.action === "Active document") {
      showDocumentPdf(sktResponse.docID, sktResponse.dataBaseActiveDocumentId);
    }
    if (sktResponse && sktResponse.action === "completedocument") {
      console.log("res of complete", sktResponse);
      const completeCanvasBox = document.getElementById(
        "completedPlaceholder-" + sktResponse.front_doc_index
      );
      if (completeCanvasBox) {
        completeCanvasBox.style.display = "block";
      }
    }
    if (sktResponse && sktResponse.action === "endSession") {
      setOpen(sktResponse.openModal);
    }
    console.log("sktResponse5656", sktResponse);
  }, [sktResponse]);
  // call usePdf function

  useEffect(() => {
    getDataByQueryParaMeter();
  }, []);
  useEffect(() => {
    showPdf(pdfURLArray);
  }, [pdfURLArray]);

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
    // hide multiple canvas
    Array.from(document.getElementsByClassName("canvas-box")).forEach(
      (container) => (container.style.display = "none")
    );
    // show active canvas only
    const activeCanvas = document.getElementById("canvas-box-" + docIds);
    if (activeCanvas) {
      activeCanvas.style.display = "block";
    }
    if (pdfURLArray) {
      if (pdfURLArray[docIds]?.jobDocument?.status === "COMPLETED") {
        const completeCanvasBox = document.getElementById(
          "completedPlaceholder-" + docIds
        );

        if (completeCanvasBox) {
          completeCanvasBox.style.display = "block";
        }
      }
    }
  }, [docIds]);

  useEffect(() => {
    displayDataOnCanvas();
  }, [canvas]);

  const displayDataOnCanvas = async () => {
    if (canvas && dataArr) {
      let docIndexNew = 0; // document index
      for (let keys in dataArr) {
        let docIndex = dataArr[keys];
        await Promise.all(
          docIndex?.map(async (page, pageIndex) => {
            await Promise.all(
              page?.map(async (value) => {
                if (value.hasOwnProperty("left")) {
                  if (value.elementType === "image") {
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
                          frontDocId: value.frontDocId,
                          userType: value.userType,
                          elementType: value.elementType,
                          notaryId: value.notaryId,
                          elementName: value.elementName,
                          selectable:
                            value.userType === "notary"
                              ? false
                              : +value.userID !== +participantsDetails.id
                              ? false
                              : true,
                          documentId: value.dataBaseActiveDocId,
                          backendJobDocId: value.backendJobDocId,
                          hoverCursor:
                            value.userType === "notary"
                              ? "not-allowed"
                              : +value.userID !== +participantsDetails.id
                              ? "not-allowed"
                              : "pointer",
                        });
                        canvas[docIndexNew][pageIndex].add(imageField);
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
                      frontDocId: value.frontDocId,
                      userType: value.userType,
                      editable: false,
                      elementType: value.elementType,
                      userID: value.userID, // this participants id
                      notaryId: value.notaryId,
                      elementName: value.elementName,
                      selectable:
                        value.userType === "notary"
                          ? false
                          : +value.userID !== +participantsDetails.id
                          ? false
                          : true,
                      documentId: value.dataBaseActiveDocId,
                      backendJobDocId: value.backendJobDocId,
                      hoverCursor:
                        value.userType === "notary"
                          ? "not-allowed"
                          : +value.userID !== +participantsDetails.id
                          ? "not-allowed"
                          : "pointer",
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
                    canvas[docIndexNew][pageIndex].add(elements);
                  }
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
                      frontDocId: value.frontDocId,
                      userType: value.userType,
                      editable: false,
                      elementType: value.elementType,
                      userID: value.userID, // this participants id
                      notaryId: value.notaryId,
                      elementName: value.elementName,
                      selectable:
                        value.userType === "notary"
                          ? false
                          : +value.userID !== +participantsDetails.id
                          ? false
                          : true,
                      documentId: value.dataBaseActiveDocId,
                      backendJobDocId: value.backendJobDocId,
                      hoverCursor:
                        value.userType === "notary"
                          ? "not-allowed"
                          : +value.userID !== +participantsDetails.id
                          ? "not-allowed"
                          : "pointer",
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
                    canvas[docIndexNew][pageIndex].add(elements);
                  }

                  // object modified event

                  // end of object modified event
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

      var currentAction = "update";
      var activeElement = "";
      var actionDetail = "";

      switch (selectedObjectOnCanvas.elementName) {
        case "writeText":
          canvas[selectedObjectOnCanvas.frontDocId][
            selectedObjectOnCanvas.pageId
          ].on("text:changed", function (e) {
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text = e.target.text;

            handleSocket(
              "update",
              `Signer updated ${e.target.elementName}`,
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id]
            );
          });
          if (selectedObjectOnCanvas.text === "WRITETEXT HERE") {
            canvas[selectedObjectOnCanvas.frontDocId][
              selectedObjectOnCanvas.pageId
            ].on("text:changed", function (e) {
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].text = e.target.text;

              handleSocket(
                "update",
                `Signer updated ${e.target.elementName}`,
                dataArr[selectedObjectOnCanvas.backendJobDocId][
                  selectedObjectOnCanvas.pageId
                ][selectedObjectOnCanvas.id]
              );
            });
            selectedObjectOnCanvas.backgroundColor =
              selectedObjectOnCanvas.backgroundColor.length == 7
                ? selectedObjectOnCanvas.backgroundColor + "80"
                : selectedObjectOnCanvas.backgroundColor;
            selectedObjectOnCanvas.text = "Write Something";
            selectedObjectOnCanvas.editable = true;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "editableText";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].backgroundColor =
              selectedObjectOnCanvas.backgroundColor;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text = selectedObjectOnCanvas.text;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].selectable = true;

            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].editable = true;

            actionDetail = "Text Updated";
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          activeElement =
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id];
          break;
        case "participantName":
          if (selectedObjectOnCanvas.text) {
            selectedObjectOnCanvas.backgroundColor =
              selectedObjectOnCanvas.backgroundColor.length == 7
                ? selectedObjectOnCanvas.backgroundColor + "80"
                : selectedObjectOnCanvas.backgroundColor;
            selectedObjectOnCanvas.text =
              participantsDetails.first_name +
              participantsDetails.middle_name +
              participantsDetails.last_name;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].elementType = "text";
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].backgroundColor =
              selectedObjectOnCanvas.backgroundColor;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].text = selectedObjectOnCanvas.text;
            dataArr[selectedObjectOnCanvas.backendJobDocId][
              selectedObjectOnCanvas.pageId
            ][selectedObjectOnCanvas.id].selectable = false;

            actionDetail = "Signer Name added";
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "sign":
          if (selectedObjectOnCanvas.text) {
            const fakeImg = new Image();
            fakeImg.src = participantsDetails.signer_signature;
            fakeImg.onload = async () => {
              var scaleImg = 720 / 5 / fakeImg.width; // Canvas area constant will replace 720

              if (fakeImg.width <= 720 / 5) {
                scaleImg = 1;
              }

              // const scaleImg =
              //   (18.08 * selectedObjectOnCanvas.scaleX) /
              //   (fakeImg.height * 1);

              var imageField = new fabric.Image(fakeImg, {
                left: selectedObjectOnCanvas.left,
                top: selectedObjectOnCanvas.top,
                scaleX: scaleImg * 1,
                scaleY: scaleImg * 1,
                frontDocId: selectedObjectOnCanvas.frontDocId,
                pageId: selectedObjectOnCanvas.pageId,
                id: selectedObjectOnCanvas.id,
                userType: selectedObjectOnCanvas.userType,
                elementType: selectedObjectOnCanvas.elementType,
                notaryId: selectedObjectOnCanvas.notaryId,
                elementName: selectedObjectOnCanvas.elementName,
                backendJobDocId: selectedObjectOnCanvas.backendJobDocId,
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

              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].text;
              // delete dataArray[docIds][selectedObjectOnCanvas.pageId][
              //   selectedObjectOnCanvas.id
              // ].elementType;
              // delete dataArray[docIds][selectedObjectOnCanvas.pageId][selectedObjectOnCanvas.id].elementUserId;

              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].fontStyle;
              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].fontWeight;

              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].hoverCursor;

              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleX = scaleImg;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleY = scaleImg;

              // dataArray[docIds][selectedObjectOnCanvas.pageId][selectedObjectOnCanvas.id].userId = userId;
              // dataArray[docIds][selectedObjectOnCanvas.pageId][selectedObjectOnCanvas.id].userType = user_type;

              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].elementType = "image";
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].imageUrl =
                participantsDetails.signer_signature;

              let element =
                canvas[selectedObjectOnCanvas.frontDocId][
                  selectedObjectOnCanvas.pageId
                ].getActiveObject();
              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].remove(element);

              console.log(
                "modified to image",
                dataArr[selectedObjectOnCanvas.backendJobDocId][
                  selectedObjectOnCanvas.pageId
                ][selectedObjectOnCanvas.id]
              );
            };
            actionDetail = "Signer Sign added";

            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
        case "participantInitial":
          if (selectedObjectOnCanvas.text) {
            const fakeImg = new Image();
            fakeImg.src = participantsDetails.signer_initial;
            fakeImg.onload = async () => {
              var scaleImg = 720 / 5 / fakeImg.width; // Canvas area constant will replace 720

              if (fakeImg.width <= 720 / 5) {
                scaleImg = 1;
              }

              // const scaleImg =
              //   (18.08 * selectedObjectOnCanvas.scaleX) /
              //   (fakeImg.height * 1);
              console.log("scaleImg", scaleImg);
              var imageField = new fabric.Image(fakeImg, {
                left: selectedObjectOnCanvas.left,
                top: selectedObjectOnCanvas.top,
                scaleX: scaleImg * 1,
                scaleY: scaleImg * 1,
                frontDocId: selectedObjectOnCanvas.frontDocId,
                pageId: selectedObjectOnCanvas.pageId,
                id: selectedObjectOnCanvas.id,
                userType: selectedObjectOnCanvas.userType,
                elementType: selectedObjectOnCanvas.elementType,
                notaryId: selectedObjectOnCanvas.notaryId,
                elementName: selectedObjectOnCanvas.elementName,
                backendJobDocId: selectedObjectOnCanvas.backendJobDocId,
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

              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].text;
              // delete dataArray[docIds][selectedObjectOnCanvas.pageId][
              //   selectedObjectOnCanvas.id
              // ].elementType;
              // delete dataArray[docIds][selectedObjectOnCanvas.pageId][selectedObjectOnCanvas.id].elementUserId;

              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].fontStyle;
              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].fontWeight;

              delete dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].hoverCursor;

              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleX = scaleImg;
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].scaleY = scaleImg;

              // dataArray[docIds][selectedObjectOnCanvas.pageId][selectedObjectOnCanvas.id].userId = userId;
              // dataArray[docIds][selectedObjectOnCanvas.pageId][selectedObjectOnCanvas.id].userType = user_type;

              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].elementType = "image";
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id].imageUrl =
                participantsDetails.signer_initial;

              let element =
                canvas[selectedObjectOnCanvas.frontDocId][
                  selectedObjectOnCanvas.pageId
                ].getActiveObject();
              canvas[selectedObjectOnCanvas.frontDocId][
                selectedObjectOnCanvas.pageId
              ].remove(element);

              console.log(
                "modified to image",
                dataArr[selectedObjectOnCanvas.backendJobDocId][
                  selectedObjectOnCanvas.pageId
                ][selectedObjectOnCanvas.id]
              );
            };
            actionDetail = "Signer Initial added";
            activeElement =
              dataArr[selectedObjectOnCanvas.backendJobDocId][
                selectedObjectOnCanvas.pageId
              ][selectedObjectOnCanvas.id];
          }
          break;
      }

      setTimeout(() => {
        console.log("databasewale", dataBaseActiveDocId);
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
        `Signer ${e.target.elementName} modified`,
        dataArr[e.target.backendJobDocId][e.target.pageId][e.target.id]
      );
    };
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

    // end of selection updated and created event

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
                console.log("Action", currentAction);
                console.log("ActionDetail", actionDetail);
                console.log("activeElement", activeElement);
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
    console.log("PdfUri", PdfUri);
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
        let img = canv.toDataURL("image/png");
        imagesList[j].push(img);
        data[j].push([]);

        tempArr[docIndexArr[j]].push([]);
      }
    }

    if (Object.keys(dataArr).length === 0) {
      setDataArr(tempArr);
    }

    setImages(imagesList);
    setPageRendering(false);
  }

  // show pdf on btn click

  const showDocumentPdf = (docID, dataBaseActiveDocumentId) => {
    setDataBaseActiveDocId(dataBaseActiveDocumentId);
    setBackendJobDocId(`doc${dataBaseActiveDocumentId}`);
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
      "data-elementcolor",
      e.target.getAttribute("data-elementcolor")
    );
    e.dataTransfer.setData(
      "data-signurl",
      e.target.getAttribute("data-signurl")
    );
    e.dataTransfer.setData(
      "data-initialurl",
      e.target.getAttribute("data-initialurl")
    );
    e.dataTransfer.setData(
      "data-signername",
      e.target.getAttribute("data-signername")
    );
    // end of signer set data

    // notary set data
    e.dataTransfer.setData("imageSrc", e.target.getAttribute("imageSrc"));
    e.dataTransfer.setData(
      "data-notaryName",
      e.target.getAttribute("data-notaryName")
    );
    e.dataTransfer.setData(
      "data-notaryTitle",
      e.target.getAttribute("data-notaryTitle")
    );
    e.dataTransfer.setData(
      "data-notaryFieldsBgColor",
      e.target.getAttribute("data-notaryFieldsBgColor")
    );
    e.dataTransfer.setData(
      "data-notaryId",
      e.target.getAttribute("data-notaryId")
    );
    e.dataTransfer.setData(
      "data-notaryCommissionId",
      e.target.getAttribute("data-notaryCommissionId")
    );
    e.dataTransfer.setData(
      "data-noratyExpiryDate",
      e.target.getAttribute("data-noratyExpiryDate")
    );
    e.dataTransfer.setData(
      "data-notaryDisclosureText",
      e.target.getAttribute("data-notaryDisclosureText")
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
    let elementType = e.dataTransfer.getData("data-element-type");
    let elementName = e.dataTransfer.getData("data-elementname");
    console.log("elementName", elementName);
    let type = e.dataTransfer.getData("data-type");
    // common getting signer and notary data

    // getting signer data
    let userID = e.dataTransfer.getData("data-elementuserid");
    let fieldBgColor = e.dataTransfer.getData("data-elementcolor");
    let signUrl = e.dataTransfer.getData("data-signurl");
    let initialUrl = e.dataTransfer.getData("data-initialurl");
    let signerName = e.dataTransfer.getData("data-signername");

    //end of getting signer data

    // getting  notray data
    let imageSoucreUrl = e.dataTransfer.getData("imageSrc");
    let notaryId = e.dataTransfer.getData("data-notaryId");
    let notaryCommissionId = e.dataTransfer.getData("data-notaryCommissionId");
    let noratyExpiryDate = e.dataTransfer.getData("data-noratyExpiryDate");
    let notaryName = e.dataTransfer.getData("data-notaryName");
    let notaryTitle = e.dataTransfer.getData("data-notaryTitle");
    let notaryFieldsBgColor = e.dataTransfer.getData(
      "data-notaryFieldsBgColor"
    );
    let notaryDisclosureText = e.dataTransfer.getData(
      "data-notaryDisclosureText"
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

    //end of canvas calculations

    //start of socket data
    var currentAction = "add";
    var activeElement = "";
    var actionDetail = "";
    //end of socket data
    let txt = "";
    let textBox = "";
    let imageField = "";
    const fakeImg = new Image();
    fakeImg.setAttribute("className", "imageSources");
    switch (elementName) {
      case "participantName":
        txt =
          participantsDetails.first_name +
          participantsDetails.middle_name +
          participantsDetails.last_name;
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
          id: dataArray[docIds][whichCanvas].length,
          userType: type,
          elementType: elementType,
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
        });
        dataArray[docIds][whichCanvas].push({
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
          id: dataArray[docIds][whichCanvas].length,
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
        });
        actionDetail = "Signer Name added";
        activeElement = dataArray[docIds][pageNum][textBox.id];
        break;
      case "participantInitial":
        fakeImg.src = participantsDetails.signer_inital;
        const imageUrl = participantsDetails.signer_inital;
        async function SignerImages() {
          return new Promise((resolve) => {
            console.log("Sign clicked");
            fakeImg.onload = async () => {
              let CanvasArea = 720;
              var scaleImg = CanvasArea / 6 / fakeImg.width;
              imageField = new fabric.Image(fakeImg, {
                left: X,
                top: Y,
                scaleX: scaleImg,
                scaleY: scaleImg,
                pageId: pageNum,
                id: dataArray[docIds][whichCanvas].length,
                userType: type,
                elementType: elementType,
                userID: userID,
                signUrl: signUrl,
                initialUrl: initialUrl,
                elementName: elementName,
                imageUrl,
                documentId: dataBaseActiveDocId,
                frontDocId: docIds,
              });
              dataArray[docIds][whichCanvas].push({
                left: X,
                top: Y,
                scaleX: scaleImg,
                scaleY: scaleImg,
                pageId: pageNum,
                id: dataArray[docIds][whichCanvas].length,
                userType: type,
                elementType: elementType,
                imageUrl: imageSoucreUrl,
                elementType: elementType,
                userID: userID,
                signUrl: signUrl,
                initialUrl: initialUrl,
                elementName: elementName,
                imageUrl,
                documentId: dataBaseActiveDocId,
                frontDocId: docIds,
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
              canvas[docIds][pageNum].add(imageField);
              actionDetail = "Signer Initial added";
              activeElement = dataArray[docIds][pageNum][imageField.id];
            };
            resolve(true);
          });
        }
        await SignerImages();

        break;
      case "sign":
        fakeImg.src = participantsDetails.signer_signature;
        const imagesrc = participantsDetails.signer_signature;

        async function SignerembedImages() {
          return new Promise((resolve) => {
            console.log("Sign clicked");
            fakeImg.onload = async () => {
              let CanvasArea = 720;
              var scaleImg = CanvasArea / 6 / fakeImg.width;
              imageField = new fabric.Image(fakeImg, {
                left: X,
                top: Y,
                scaleX: scaleImg,
                scaleY: scaleImg,
                pageId: pageNum,
                id: dataArray[docIds][whichCanvas].length,
                userType: type,
                elementType: elementType,
                userID: userID,
                signUrl: signUrl,
                initialUrl: initialUrl,
                elementName: elementName,
                imageUrl: imagesrc,
                documentId: dataBaseActiveDocId,
                frontDocId: docIds,
              });
              dataArray[docIds][whichCanvas].push({
                left: X,
                top: Y,
                scaleX: scaleImg,
                scaleY: scaleImg,
                pageId: pageNum,
                id: dataArray[docIds][whichCanvas].length,
                userType: type,
                elementType: elementType,
                imageUrl: imageSoucreUrl,
                elementType: elementType,
                userID: userID,
                signUrl: signUrl,
                initialUrl: initialUrl,
                elementName: elementName,
                imageUrl: imagesrc,
                documentId: dataBaseActiveDocId,
                frontDocId: docIds,
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
              actionDetail = "Signer Sign added";
              activeElement = dataArray[docIds][pageNum][imageField.id];
              canvas[docIds][pageNum].add(imageField);
            };
            resolve(true);
          });
        }
        await SignerembedImages();
        break;

      default:
        break;
    }

    if (elementName === "participantName") {
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

    // object modified event
    canvas[docIds][pageNum].on("object:modified", (e) => {
      dataArray[docIds][e.target.pageId][e.target.id].left = e.target.left;
      dataArray[docIds][e.target.pageId][e.target.id].top = e.target.top;
      dataArray[docIds][e.target.pageId][e.target.id].scaleX = e.target.scaleX;
      dataArray[docIds][e.target.pageId][e.target.id].scaleY = e.target.scaleY;
      handleSocket(
        "update",
        `Signer ${e.target.elementName} modified`,
        dataArray[docIds][e.target.pageId][e.target.id]
      );
    });
    // end of object modified event

    // delete specific objects
    // document.addEventListener("keydown", (e) => {
    //   let element;
    //   const key = e.key;
    //   if (key === "Delete") {
    //     if (canvases[selectObject]) {
    //       if ((element = canvases[selectObject].getActiveObject())) {
    //         dataArray[docIds][selectObject][elementspecificId] = {};
    //         canvases[selectObject].remove(element);
    //       }
    //     }
    //   }
    // });
    // end of specific delete objects from canvas
    // console.log("dataArray", dataArray[docIds]);
    // updateHandler()
  };
  const completeSession = () => {};
  const EndSession = () => {};
  const zoomCanvas = (val) => {
    console.log('Test' + docIds);
    const preZoom = canvases[docIds].getZoom();
    const zoom = preZoom + val;
    if (val > 0 && preZoom >= 1.1) return;
    if (val < 0 && preZoom <= 0.8) return;
    setZoomValue(zoom);
    const width = 680;
    const height = 962;
    canvases?.map((_item, i) => {
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
      console.log("temp", temp, docIds);
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
    console.log("dataBaseActiveDocId", dataBaseActiveDocId);

    //merging original and extracted data
    let originalMetaOfTagging = originalMeta;
    let extractedMeta = dataArr;
    let meta = {};
    console.log("metaofsocketsending", meta);

    for (let keys in originalMetaOfTagging) {
      if (keys in extractedMeta) {
        let value = extractedMeta[keys];
        let key = keys;
        meta[keys] = value;
      } else {
        let value = originalMetaOfTagging[keys];
        let key = keys;
        meta[keys] = value;
      }
    }
    let stringifyMeta = JSON.stringify(meta);
    console.log("metaofsocketsending", meta);
    console.log("metaofsocketsending", originalMeta);
    console.log("metaofsocketsending", dataArr);
    console.log("metaofsocketsending", stringifyMeta);
    // end of merging original and extracted data
    // skt.emit("joinRoom",roomId);
    skt.emit(
      "message",
      {
        meta: stringifyMeta,
        sessionId: Number(pdfURLArray[0].session_id),
        sessionDocId: activeElement.documentId,
        jobId: Number(pdfURLArray[0].jobDocument.job_id),
        userId: +participantsDetails.id,
        userType: participantsDetails.type,
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
  const closeSignerTab = () => {
    window.open("about:blank", "_self");
    window.close();
  };
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

              {images.length
                ? pdfURLArray?.map((value, index) => (
                    <List key={index}>
                      <ListItemButton
                        selected={activeIndex === index}
                        // onClick={() => showDocumentPdf(index, +value.ID)} // signer not allow use this btn
                      >
                        <ListItemText primary={value.jobDocument.doc_name} />
                      </ListItemButton>
                    </List>
                  ))
                : "loading..."}
            </Grid>
            {/* <button onClick={handleSocket}>socket</button> */}
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
            <Grid
              item
              xs={12}
              style={{ justifyContent: "center" }}
              className={classes.headerGrid12}
            >
              {/* <button className={classes.EndSessionBtn} onClick={EndSession}>
                End Session
              </button> */}
              <Box className={classes.pageBtnConatiner}>
                <Typography className={classes.btnPages}>
                  <KeyboardArrowLeftIcon onClick={minusDocumentNum} />
                  {docIds === "" ? 0 : docIds + 1} of {images.length}
                  <KeyboardArrowRightIcon onClick={addDocumentNum} />
                </Typography>
              </Box>
              {/* <button className={classes.CompleteBtn} onClick={completeSession}>
                Complete
              </button> */}
            </Grid>

            <Grid
              style={{
                height: "calc(100vh - 58px)",
                overflowY: "auto",
                position: "relative",
              }}
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
                        className={classes.completedPlaceholderSigner}
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
              <Typography className={classes.ActionText}></Typography>
            </Grid>
            <Grid item xs={12}>
              {/* start of users box */}
              {participants?.map((value, i) => (
                <Box key={i}>
                  <Box className={classes.nameWithBox}>
                    <span
                      style={{ backgroundColor: value?.tag_color }}
                      className={classes.smallBox2}
                    ></span>
                    <span className={classes.personName}>
                      {value.first_name} {value.middle_name} {value.last_name}
                    </span>
                  </Box>
                  <Box
                    className={classes.dragDropBoxContainer}
                    sx={{ flexDirection: "column", alignItems: "flex-start" }}
                  >
                    <Button
                      className={classes.dragDropBox3}
                      fullWidth
                      startIcon={<PersonIcon className={classes.signerIcons} />}
                      draggable="false"
                      onDragStart={(e) => dragStart(e)}
                      data-elementname="participantName"
                      data-type="Signer"
                      data-elementuserid={value.id}
                      data-elementcolor={value?.tag_color}
                      data-signername={""}
                      data-element-type={"text"}
                    >
                      {" "}
                      Name
                    </Button>
                    <Button
                      className={classes.dragDropBox3}
                      fullWidth
                      startIcon={
                        <FaSignature className={classes.signerIcons} />
                      }
                      draggable="false"
                      onDragStart={(e) => dragStart(e)}
                      data-elementname="sign"
                      data-type="Signer"
                      data-elementuserid={value.id}
                      data-elementcolor={value?.tag_color}
                      data-signurl={""}
                      data-signername={""}
                      data-element-type={"image"}
                    >
                      {" "}
                      Sign
                    </Button>
                    <Button
                      className={classes.dragDropBox3}
                      fullWidth
                      startIcon={
                        <FaTextWidth className={classes.signerIcons} />
                      }
                      draggable="false"
                      onDragStart={(e) => dragStart(e)}
                      data-elementname="participantInitial"
                      data-type="Signer"
                      data-elementuserid={value.id}
                      data-elementcolor={value?.tag_color}
                      data-initialurl={""}
                      data-signername={""}
                      data-element-type={"image"}
                    >
                      {" "}
                      Initial
                    </Button>
                  </Box>
                  <Divider />
                </Box>
              ))}
              {/* end of user div  */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Dialog open={open}>
        <Box sx={{ padding: "1rem 3rem" }}>
          {/* <DialogTitle> */}
          <h2 style={{ textAlign: "center" }}>Thank You</h2>
          {/* </DialogTitle> */}
          {/* <DialogContentText> */}
          <h4>Session has expired</h4>
          {/* </DialogContentText> */}
          <DialogActions>
            <CloseButton label={"ok"} onClick={closeSignerTab} />
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default SignerCreation;
