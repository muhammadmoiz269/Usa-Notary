import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import {
    Box,
    Divider,
    Grid,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { fabric } from 'fabric';
import { PDFDocument } from "pdf-lib";
import { GlobalWorkerOptions } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.js';

import React, { useEffect, useRef, useState } from "react";
import { BsFillPersonBadgeFill } from "react-icons/bs";
import {
    FaAlignLeft,
    FaBriefcase,
    FaCalendar,
    FaCertificate,
    FaCheckSquare,
    FaEraser,
    FaSignature,
    FaTextWidth,
    FaUser,
} from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../../Assets/images/loader.gif";
import notaryLogo from "../../Assets/images/notary_logo.png";

import { baseUrl } from "../../Utils/constant";
import { useStyles } from "../../styles";

const PDFJS = window.pdfjsLib;

GlobalWorkerOptions.workerSrc = workerSrc;
const TemplateCreation = () => {
  const [pdf, setPdf] = useState("");
  const [pdfRendering, setPdfRendering] = useState("");
  const [images, setImages] = useState([]);
  const [pageRendering, setPageRendering] = useState("");
  const [canvases, setCanvases] = useState("");
  const [canvas, setCanvas] = useState("");
  const [divScroll, setDivScroll] = useState(0);
  const [dataArr, setDataArr] = useState([]);
  const [docIds, setDocIds] = useState("");
  const [zoomValue, setZoomValue] = useState(0);
  const [pdfURLArray, setPdfURLArray] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [notaryId, setNotaryId] = useState("");
  const [dataBaseActiveDocId, setDataBaseActiveDocId] = useState("");
  const [backendJobDocId, setBackendJobDocId] = useState("");
  const [docIndexArray, setDocIndexArray] = useState([]);
  const [whiteBoxurl, setWhiteBoxurl] = useState("");
  const { id } = useParams()

  const documentContainer = useRef();
  const GridScroll = useRef(null);
  const navigate = useNavigate();
  const classes = useStyles();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const jid = queryParams.get("jid");
  useEffect(() => {
    if (pdfURLArray) {
      console.log("pdfURLArray", pdfURLArray);
    }
  }, [pdfURLArray]);
  const actionsList = [
    {
      actionName: "Text",
      actionIcon: FaTextWidth,
      elementName: "text",
      imagePath: "",
    },
    {
      actionName: "Name",
      actionIcon: FaUser,
      elementName: "name",
      imagePath: "",
    },
    {
      actionName: "Title",
      actionIcon: FaBriefcase,
      elementName: "title",
      imagePath: "",
    },
    {
      actionName: "Commission ID",
      actionIcon: BsFillPersonBadgeFill,
      elementName: "commission_id",
      imagePath: "",
    },
    {
      actionName: "Commission Exp Date",
      actionIcon: FaCalendar,
      elementName: "commission_exp_date",
      imagePath: "",
    },
    {
      actionName: "Seal",
      actionIcon: FaCertificate,
      elementName: "seal",
    },
    {
      actionName: "Disclosure",
      actionIcon: FaAlignLeft,
      elementName: "disclosure",
    },
    {
      actionName: "Signature",
      actionIcon: FaSignature,
      elementName: "signature",
    },
    {
      actionName: "Initial",
      actionIcon: FaTextWidth,
      elementName: "initial",
    },
    {
      actionName: "Date",
      actionIcon: FaCalendar,
      elementName: "date",
    },
    {
      actionName: "Checkbox",
      actionIcon: FaCheckSquare,
      elementName: "checkbox",
    },
    {
      actionName: "White Out",
      actionIcon: FaEraser,
      elementName: "whitebox",
    },
  ];
  const documentDetails = () => {
    axios({
      method: "get",

      url: `${baseUrl}/job-participants-docs/${id}`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => {
        console.log("resjobparticipantdocs", res.data.notary);

        setPdfURLArray(res.data.job_docs);
        console.log('clientsData: ', res.data.job_participants.map(p => ({ ...p, id: p.ID })));
        setClientsData(res.data.job_participants.map(p => ({ ...p, id: p.ID })));
        setNotaryId(+res.data.notary[0].ID);
        setWhiteBoxurl(
          "iVBORw0KGgoAAAANSUhEUgAAAbYAAABzCAMAAADDhdfxAAAAA1BMVEX///+nxBvIAAAASElEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIArA8U1AAFN/rc6AAAAAElFTkSuQmCC"
        );
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  useEffect(() => {
    documentDetails();
    fetchData();
  }, []);
  useEffect(() => {
    console.log("dataArr", dataArr);
  }, [dataArr]);

  // call usePdf function

  useEffect(() => {
    showPdf(pdfURLArray);
  }, [pdfURLArray]);

  useEffect(() => {
    pdf && renderPage();
  }, [pdf]);

  // setting canvas background images
  useEffect(() => {
    const allDocCanvas = images?.map((value, index) => {
      const newCanvasArray = value?.map((_value, ind) => {
        const newCanvas = new fabric.Canvas(
          `canvas${docIndexArray[index] + "-" + ind}`,
          {
            height: 962,
            width: 680,
            backgroundImage: _value,
          }
        );

        return newCanvas;
      });

      return newCanvasArray;
    });

    setCanvases(allDocCanvas[docIds]);
    setCanvas(allDocCanvas);

    // hide multiple canvas
    Array.from(document.getElementsByClassName("canvas-box")).forEach(
      (container) => (container.style.display = "none")
    );
    // show active canvas only
    const activeCanvas = document.getElementById(
      "canvas-box-" + backendJobDocId
    );
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
    const activeCanvas = document.getElementById(
      "canvas-box-" + backendJobDocId
    );
    if (activeCanvas) {
      activeCanvas.style.display = "block";
    }
    // displayDataOnCanvas();
  }, [docIds]);
  useEffect(() => {
    displayDataOnCanvas();
  }, [canvas]);
  // draw objects on canvas when come from api

  const displayDataOnCanvas = async () => {
    if (canvas && dataArr) {
      let docIndexNew = 0; // document index
      for (let keys in dataArr) {
        let docIndex = dataArr[keys]; // get all pages of one document
        await Promise.all(
          docIndex.map(async (page, pageIndex) => {
            // loop on all pages
            await Promise.all(
              page.map(async (value) => {
                // loop on all page meta
                if (value.hasOwnProperty("left")) {
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
                      userID: value.userID, // this participant's id
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

                    if (canvas.length !== 0) {
                      canvas[docIndexNew][pageIndex].add(elements);
                    }

                  } else if (
                    value.elementType === "image" &&
                    value.elementName === "whitebox"
                  ) {
                    await new Promise((resolve, reject) => {
                      var fakeImg = new Image();
                      fakeImg.onload = () => {
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
                          imageUrl: value.imageUrl,
                          elementType: value.elementType,
                        });

                        canvas[docIndexNew][pageIndex].add(imageField);
                        resolve();
                      };
                      fakeImg.onerror = (error) => {
                        reject(error);
                      };
                      fakeImg.src = `data:image/png;base64,` + value.imageUrl;
                    });
                  }
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
    };
    // end of selection updated and created event

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
    };
    //end of dragging event handler

    // call events on each page of canvas
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
    // end call events on each page of canvas

    // delete specific objects
    document.addEventListener("keydown", (e) => {
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
    });
    // end of specific delete objects from canvas
  };

  async function showPdf(PdfUri) {
    console.log("PdfUri", PdfUri);

    var _PDF_DOC;
    let objectPdfDocs = [];

    for (let i = 0; i < PdfUri?.length; i++) {
      try {
        setPdfRendering(true);
        const existingPdfBytes = await fetch(PdfUri[i].file_path)
          .then((res) => res.arrayBuffer())
          .catch((error) => {
            console.log("file error", error);
          });

        console.log("Existing bytes", existingPdfBytes);
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
          console.log("docUrl", docUrl);
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
      var indexName = "doc" + pdfURLArray[i].ID;
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

    GridScroll.current.scrollTo(0, 0);
  };

  const dragStart = (e) => {
    // common notary and signer set data
    e.dataTransfer.setData(
      "data-elementname",
      e.target.getAttribute("data-elementname")
    );
    e.dataTransfer.setData("data-type", e.target.getAttribute("data-type"));
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
      "data-signUrl",
      e.target.getAttribute("data-signUrl")
    );
    e.dataTransfer.setData(
      "data-initialUrl",
      e.target.getAttribute("data-initialUrl")
    );
    e.dataTransfer.setData(
      "data-signername",
      e.target.getAttribute("data-signername")
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
    e.preventDefault();
  };
  const dragDropped = async (e, pageNum) => {
    e.preventDefault();

    // common getting signer and notary data
    let elementName = e.dataTransfer.getData("data-elementname");
    let type = e.dataTransfer.getData("data-type");
    // common getting signer and notary data

    // getting signer data
    let userID = e.dataTransfer.getData("data-elementuserid");
    let fieldBgColor = e.dataTransfer.getData("data-elementcolor");
    let signUrl = e.dataTransfer.getData("data-signUrl");
    let initialUrl = e.dataTransfer.getData("data-initialUrl");
    // let signerName = e.dataTransfer.getData("data-signerName");

    //end of getting signer data

    // getting  notray data
    let imageSoucreUrl = e.dataTransfer.getData("imagesrc");
    let notaryId = e.dataTransfer.getData("data-notaryid");
    let notaryCommissionId = e.dataTransfer.getData("data-notarycommissionid");
    let noratyExpiryDate = e.dataTransfer.getData("data-noratyexpirydate");
    let notaryName = e.dataTransfer.getData("data-notaryname");
    let notaryTitle = e.dataTransfer.getData("data-notarytitle");
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
      `canvas-area-${backendJobDocId}-${pageNum}`
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
    let txt = "";
    let textBox = "";
    let imageField = "";
    const fakeImg = new Image();
    fakeImg.setAttribute("className", "imageSources");
    switch (elementName) {
      // signer fields
      case "writeText":
        txt = "WRITETEXT HERE";
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
          elementType: "indicator",
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          userID: userID,
          // signerName: signerName,
          elementType: "indicator",
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
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
          elementType: "indicator",
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
          // signerName: signerName,
          elementType: "indicator",
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          userID: userID,
          // signerName: signerName,
          signUrl: signUrl,
          elementType: "indicator",
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          userID: userID,
          // signerName: signerName,
          initialUrl: initialUrl,
          elementType: "indicator",
          userID,
          userID,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          notaryId: notaryId,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "name":
        txt = "NAME HERE";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          notaryName: notaryName,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          notaryId: notaryId,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          notaryName: notaryName,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "title":
        txt = "TITLE HERE";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          notaryTitle: notaryTitle,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          notaryId: notaryId,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          notaryTitle: notaryTitle,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "commission_id":
        txt = "COMMISSION_ID HERE";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          notaryCommissionId: notaryCommissionId,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          notaryId: notaryId,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          notaryCommissionId: notaryCommissionId,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "commission_exp_date":
        txt = "COMMISION_EXP_DATE HERE";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          noratyExpiryDate: noratyExpiryDate,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          noratyExpiryDate: noratyExpiryDate,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "signature":
        txt = "SIGN HERE";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          imageUrl: imageSoucreUrl,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          notaryId: notaryId,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          imageUrl: imageSoucreUrl,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "whitebox":
        // const path = window.location.origin;
        // fakeImg.src = `${path}/assets/img/whitebox.png`;
        fakeImg.src = `data:image/png;base64,${whiteBoxurl}`;
        let imageUrl = `${whiteBoxurl}`;
        async function embedImages() {
          return new Promise((resolve) => {
            fakeImg.onload = async () => {
              let CanvasArea = 720;
              var scaleImg = CanvasArea / 4 / fakeImg.width;
              imageField = new fabric.Image(fakeImg, {
                left: X,
                top: Y,
                scaleX: scaleImg,
                scaleY: scaleImg,
                pageId: pageNum,
                id: dataArr[backendJobDocId][pageNum].length,
                userType: type,
                elementType: "white out",
                notaryId: notaryId,
                elementName: elementName,
                documentId: dataBaseActiveDocId,
                frontDocId: docIds,
                backendJobDocId,
                hoverCursor: "pointer",
                imageUrl,
                elementType: "image",
                hoverCursor: "pointer",
              });
              dataArr[backendJobDocId][whichCanvas].push({
                left: X,
                top: Y,
                scaleX: scaleImg,
                scaleY: scaleImg,
                pageId: pageNum,
                id: dataArr[backendJobDocId][pageNum].length,
                userType: type,
                // elementType: "white out",
                notaryId: notaryId,
                imageUrl: imageSoucreUrl,
                notaryId: notaryId,
                elementName: elementName,
                documentId: dataBaseActiveDocId,
                frontDocId: docIds,
                backendJobDocId,
                hoverCursor: "pointer",
                imageUrl,
                elementType: "image",
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
              canvas[docIds][pageNum].add(imageField);
            };
            resolve(true);
          });
        }
        await embedImages();
        break;
      case "checkbox":
        txt = "Check here";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          imageUrl: imageSoucreUrl,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          notaryId: notaryId,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          imageUrl: imageSoucreUrl,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "initial":
        txt = "INITIAL HERE";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          imageUrl: imageSoucreUrl,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          notaryId: notaryId,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          imageUrl: imageSoucreUrl,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "seal":
        txt = "SEAL HERE";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          imageUrl: imageSoucreUrl,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          notaryId: notaryId,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          imageUrl: imageSoucreUrl,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "disclosure":
        txt = "DISCLOSURE HERE";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          notaryDisclosureText: notaryDisclosureText,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          notaryId: notaryId,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          notaryDisclosureText: notaryDisclosureText,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;
      case "date":
        let Date = dayjs().format("MM/DD/YYYY");
        txt = "DATE HERE";
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          Date: Date,
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
          id: dataArr[backendJobDocId][pageNum].length,
          userType: type,
          elementType: "indicator",
          notaryId: notaryId,
          editable: false,
          Date: Date,
          elementName: elementName,
          documentId: dataBaseActiveDocId,
          frontDocId: docIds,
          backendJobDocId,
          hoverCursor: "pointer",
        });
        break;

      default:
        break;
    }

    if (
      elementName === "writeText" ||
      elementName === "name" ||
      elementName === "sign" ||
      elementName === "initial" ||
      elementName === "text" ||
      elementName === "title" ||
      elementName === "commission_id" ||
      elementName === "commission_exp_date" ||
      elementName === "disclosure" ||
      elementName === "date" ||
      elementName === "notary name" ||
      elementName === "signature" ||
      elementName === "checkbox" ||
      elementName === "participantName" ||
      elementName === "seal" ||
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
  };
  const completeSession = (successCallback) => {
    let meta = {};
    for (let keys in dataArr) {
      let value = dataArr[keys];
      let key = keys;
      meta[key] = value;
    }
    let stringifyMeta = JSON.stringify(meta);
    const payload = {
      name: "Document Name",
      jobId: 1,
      participant: [],
      documents: [],
      status: "END NOTARIZATION",
      metadata: stringifyMeta,
    };
    axios({
      method: "patch",

      url: `${baseUrl}/session/${id}`,
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        // bas yahan navigation karna ha
        successCallback && successCallback.call(successCallback)
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  const EndSession = () => {
    localStorage.setItem("hideAddDocBtn", JSON.stringify({ isShow: false }));

    completeSession(() => sessionEnd());
  };
  const zoomCanvas = (val) => {
    console.log('Test' + docIds);
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
      if (tempminus > -1) {
        ActiveDocId = docIds;
        let currentActiveDocId = ActiveDocId - 1;
        setDocIds(currentActiveDocId);
      }
    }
    GridScroll.current.scrollTo(0, 0);
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
    GridScroll.current.scrollTo(0, 0);
  };

  const fetchData = () => {
    axios({
      method: "get",
      url: `${baseUrl}/session/${id}`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => {
        console.log("resofmeta", res);
        let associateDataArray = [];
        let meta = JSON.parse(res.data[0].metadata);
        for (let keys in meta) {
          let value = meta[keys];
          associateDataArray[keys] = value;
        }
        if (Object.keys(associateDataArray).length) {
          setDataArr(associateDataArray);
          console.log('associateDataArray', associateDataArray);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const sessionEnd = () => {
    console.log("End Session Call");
    let meta = {};
    for (let keys in dataArr) {
      let value = dataArr[keys];
      let key = keys;
      meta[key] = value;
    }
    let stringifyMeta = JSON.stringify(meta);
    const payload = {
      status: "END TAGGING",
      metadata: stringifyMeta,
      jobId: 1,
    };

    axios({
      method: "patch",
      url: `${baseUrl}/start-end/${id}`,
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("End Session Sucess", res);
        if (res.status === 200) {
          window.location.href = `http://localhost:8080/usa-notary/job-view.php?jid=${encodeURIComponent(jid)}`;
        }
      })
      .catch((error) => {
        console.log("End Session error", error);
      });
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

              {images.length ? (
                <FormControl fullWidth>
                  <InputLabel id="document-select-label">Select a Document</InputLabel>
                  <Select
                    labelId="document-select-label"
                    value={activeIndex}
                    onChange={(e) => {
                      const selectedIndex = e.target.value;
                      showDocumentPdf(selectedIndex, +pdfURLArray[selectedIndex].ID);
                    }}
                    label="Select a Document"
                  >
                    {pdfURLArray.map((value, index) => (
                      <MenuItem key={index} value={index}>
                        {value.doc_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                ""
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
              <Box className={classes.pageBtnConatiner}>
                <Typography className={classes.btnPages}>
                  <KeyboardArrowLeftIcon onClick={minusDocumentNum} />
                  {docIds === "" ? 0 : docIds + 1} of {images.length}
                  <KeyboardArrowRightIcon onClick={addDocumentNum} />
                </Typography>
              </Box>
              <div></div>
            </Grid>

            <Grid
              style={{ height: "calc(100vh - 58px)", overflowY: "auto" }}
              item
              xs={12}
              className={classes.canvasDrapDRopMainContainer}
              onScroll={(e) => setDivScroll(e.target.scrollTop)}
              ref={GridScroll}
            >
              {!images.length ? (
                <div
                  style={{
                    position: "absolute",
                    top: "0px",
                    // left: "0px",
                    bottom: "0px",
                    // backgroundColor: "#",
                    display: "Grid",
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
                      id={"canvas-box-" + docIndexArray[index]}
                      key={docIndexArray[index]}
                      className="canvas-box"
                    >
                      {value?.map((val, ind) => (
                        <div
                          id={"canvas-area-" + docIndexArray[index] + "-" + ind}
                          key={ind}
                          onDragOver={(e) => ondragOver(e)}
                          onDrop={(e) => dragDropped(e, ind)}
                        >
                          <p id={"docPage-" + index + "-" + ind}>{ind + 1}</p>
                          <canvas
                            width={"720"}
                            height={"932"}
                            id={"canvas" + docIndexArray[index] + "-" + ind}
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
              {clientsData.map((participant, i) => (
                <Box key={i}>
                  <Box className={classes.nameWithBox}>
                    <span
                      style={{ backgroundColor: participant.tag_color }}
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
                      data-elementuserid={participant.id}
                      data-elementcolor={participant.tag_color}
                      data-signername={
                        participant.fullname
                      }
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
                      data-elementuserid={+participant.id}
                      data-elementcolor={participant.tag_color}
                      data-signername={
                        participant.fullname
                      }
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
                      data-elementuserid={+participant.id}
                      data-elementcolor={participant.tag_color}
                      data-signername={
                        participant.fullname
                      }
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
                      data-elementuserid={+participant.id}
                      data-elementcolor={participant.tag_color}
                      data-signername={
                        participant.fullname
                      }
                    >
                      {" "}
                      Initial
                    </span>
                  </Box>
                  <Divider sx={{ margin: "20px 0px" }} />
                </Box>
              ))}
              {/* end of user div  */}
              <Box>
                {actionsList.map((item, i) => (
                  <span
                    key={i}
                    draggable="true"
                    onDragStart={(e) => dragStart(e)}
                    className={classes.actionsListContainer}
                    data-elementname={item.elementName}
                    data-type="notary"
                    imagesrc={item.imagePath}
                    data-notaryid={+notaryId}
                    data-notarycommissionid={item.commissionId}
                    data-noratyexpirydate={item.expDate}
                    data-notarydisclosuretext={item.disclosureText}
                    data-notaryfieldsbgcolor={"#FF1E1E"}
                    data-notaryname={item.notaryName}
                    data-notarytitle={item.notaryTitle}
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
    </>
  );
};

export default TemplateCreation;
