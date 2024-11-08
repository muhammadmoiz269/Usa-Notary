import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
  date_container: {
    display: "flex",
    backgroundColor: "lightblue",
    borderRadius: "5px",
    marginTop: "5px",
  },
  cardContainer: {
    backgroundColor: "#F9FAFB",
    padding: "20px 60px",
    borderRadius: "5px",
    marginBottom: "25px",
    marginTop: "5px",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
  },
  clientText: {
    marginBottom: "15px",
    fontWeight: "700",
    fontSize: "20px",
  },
  drapDRopContainer: {
    display: "flex",
    backgroundColor: "#E9EEFB",
    marginBottom: "10px",
    borderRadius: "5px",
    padding: "5px 0px",
  },
  drapDRopContainer2: {
    display: "flex",
    backgroundColor: "#E9EEFB",
    marginBottom: "10px",
    borderRadius: "5px",
    padding: "5px 0px",
    backgroundColor: "#E9FBE9",
  },
  IconName: {
    alignSelf: "center",
    backgroundColor: "#c7eac7",
  },
  IconName2: {
    alignSelf: "center",
    backgroundColor: "#d4dcf2",
  },
  commonText: {
    fontWeight: "600",
    marginLeft: "5px",
    fontSize: "15px",
    alignSelf: "center",
  },
  commonTextDisable: {
    fontWeight: "600",
    marginLeft: "5px",
    fontSize: "15px",
    alignSelf: "center",
    cursor: "not-allowed",
  },
  scroll_conatiner: {
    height: "100vh !important",
    overFlowY: "auto !important",
  },
  btnContainer: {
    display: "flex ",
    justifyContent: "end",
    margin: "10px",
  },
  btnSave: {
    padding: "10px 20px !important",
    fontSize: "15px !important",
    fontWeight: "700 !important",
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  imageWrapper: {
    borderRadius: "3px",
    boxShadow: "0 2px 5px 0 rgba(0,0,0,0.25)",
    padding: "0",
    margin: "0px 5px",
    backgroundColor: "white",
  },
  imageWrapper2: {
    border: "1px solid #1e2a96",
    borderRadius: "3px",
    boxShadow: "0 2px 5px 0 rgba(0,0,0,0.25)",
    padding: "0",
    margin: "0px 5px",
    backgroundColor: "white",
  },
  cardsMainContainer: {
    padding: "0px 23px",
  },
  pageNo: {
    margin: "5px 0px 0px 5px",
  },
  pageNoBg: {
    margin: "5px 0px 0px 5px",
    backgroundColor: "blue",
    width: "7%",
    borderRadius: "13px",
    textAlign: "center",
    color: "#fff",
  },
  imageCanvasCol: {
    padding: "10px 5px",
    backgroundColor: "#DEE6F1",
  },

  // new component   NewCreateTemplate2
  sideBarContainer: {
    padding: "1rem 1rem",
  },
  documentUl: {
    margin: "0px 0px",
    padding: "0px 0px",
    paddingTop: "1rem",
    listStyle: "none",
    borderTopWidth: "1px",
    marginTop: "1rem",
  },
  targetLi: {
    margin: "0px 0px 10px 0px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  Documents: {
    fontWeight: "500",
    marginLeft: "0.75rem",
  },
  AddIconAnchor: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(243,244,246)",
    borderRadius: "21px",
    marginLeft: "0.5rem",
  },
  Documents2: {
    fontWeight: "400",
    marginLeft: "0.75rem",
    fontSize: "1rem",
    lineHeight: "1.5rem",
    padding: "0.5rem",
    cursor: "context-menu",
  },
  targetLi2: {
    margin: "0px 0px 10px 0px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbf8f8",
    "&:hover": {
      background: "#e5d9d9",
    },
    borderRadius: "0.5rem",
  },
  headerGrid12: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.75rem",
    backgroundColor: "#fff",
    minHeight: "58px",
  },
  btnPages: {
    display: "flex ",
    justifyContent: "center ",
    alignItems: "center ",
  },
  pageBtnConatiner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomIcons: {
    fontSize: "30px !important",
    color: "#000",
  },

  zoomIconsContainer: {
    borderRadius: "0.25rem",
    padding: "0.25rem 0.75rem",
    backgroundColor: "#e5d9d9 !important",
    border: "1px solid #fff",
  },
  zoomIconsContainer2: {
    borderRadius: "0.25rem",
    padding: "0.25rem 0.75rem",
    backgroundColor: "#e5d9d9 !important",
    marginLeft: "20px",
    border: "1px solid #fff",
  },
  ActionsMainContainer: {
    padding: "1rem 1rem",
    height: "100vh",
    boxShadow:
      "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
  },

  ActionText: {
    fontWeight: "500 !important",
    marginLeft: "0.75rem !important",
    marginBottom: "15px !important",
    marginTop: "10px !important",
  },
  smallBox: {
    height: "0.75rem !important",
    width: "0.75rem !important",
    marginRight: "0.5rem !important",
    backgroundColor: "#78FF1E80",
  },
  smallBox2: {
    height: "0.75rem !important",
    width: "0.75rem !important",
    marginRight: "0.5rem !important",
    // backgroundColor: "#1EFFD980",
  },
  nameWithBox: {
    display: "flex",
    alignItems: "center",
  },
  personName: {
    fontSize: "15px",
  },
  dragDropBox: {
    fontWeight: "500",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    textAlign: "center",
    padding: "0.25rem 0.5rem",
    border: "2px solid #e5d9d9",
    borderRadius: "0.275rem",
    "&:hover": {
      background: "#e5d9d9",
    },
  },
  dragDropBox2: {
    fontWeight: "500",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    textAlign: "center",
    padding: "0.25rem 0.5rem",
    border: "2px solid #e5d9d9",
    borderRadius: "0.275rem",
    marginLeft: "5px",
    "&:hover": {
      background: "#e5d9d9",
    },
  },
  dragDropBoxContainer: {
    margin: "10px 0px",
    color: "#786666",
    cursor: "pointer",
    display: "flex",
    flexWrap: "warp",
  },
  actionsListContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    padding: "0.5rem",
    color: "#786666",
    cursor: "pointer",
    "&:hover": {
      background: "#e5d9d9",
      borderRadius: "0.5rem",
    },
  },
  ActionTextt: {
    marginLeft: "0.75rem !important",
  },
  sideMainContainer: {
    boxShadow: " rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
  },
  mainPagesHeader: {
    boxShadow:
      "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
  },
  EndSessionBtn: {
    padding: "7px 0.75rem",
    backgroundColor: "rgb(220,38,38)",
    border: "1px solid #e5e7eb",
    borderRadius: "0.25rem",
    color: "#EBEBEB",
    fontSize: "16px",
    fontWeight: 400,
    cursor:"pointer"
  },
  CompleteBtn: {
    padding: "7px 0.75rem",
    backgroundColor: "rgb(34,197,94)",
    border: "1px solid #e5e7eb",
    borderRadius: "0.25rem",
    color: "#EBEBEB",
    fontSize: "16px",
    fontWeight: 400,
    cursor:"pointer"
  },
  usaNotary: {
    marginLeft: "7px",
  },
  canvasDrapDRopMainContainer: {
    display: "flex",
    justifyContent: "center",
    height: "100vh",
    overflowY: "auto",
    // margin: "35px 0px 0px 0px !imporatnt",
  },
  dragDropBox3: {
    color: "#6B7280 !important",
    marginBottom: "10px !important",
    display: "flex",
    justifyContent: "flex-start !important",
    "&:hover": {
      backgroundColor: "#F3F4F6 !important",
    },
  },
  signerIcons: {
    marginRight: "10px",
  },
  completedPlaceholder: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "sticky",
    width: "100%",
    minHeight: "100%",
    left: "0px",
    right: "0px",
    bottom: "0px",
    top: "0px",
    transform: "translate(0px, 0px)",
    backdropFilter: "blur(6px) !important",
    position: "sticky",
    zIndex: "999",
    display: "none",
    "&::before": {
      content: `""`,
      position: "absolute",
      right: "-20px",
      left: "-20px",
      top: "-20px",
      bottom: "-100%",
      // background: "#e7fff13d",
      background: "#e7fff1c4",
      minHeight: "100%",
      height: "100vh",
      // backdropFilter: "blur(6px) !important",
      Filter: "blur(6px) !important",
    },
    "& div": {
      background: `url(../assets/img/completed-sign.png)`,
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      width: "150px",
      height: "150px",
      position: "absolute",
      top: "30vh",
      left: "40%",
      // backdropFilter: "blur(6px) !important",
    },
  },
  completedPlaceholderSigner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "sticky",
    width: "100%",
    minHeight: "100%",
    left: "0px",
    right: "0px",
    bottom: "0px",
    top: "0px",
    transform: "translate(0px, 0px)",
    backdropFilter: "blur(6px) !important",
    position: "sticky",
    zIndex: "999",
    display: "none",
    "&::before": {
      content: `""`,
      position: "absolute",
      right: "-20px",
      left: "-20px",
      top: "-20px",
      bottom: "-100%",
      // background: "#e7fff13d",
      background: "#e7fff1c4",
      minHeight: "100%",
      height: "100vh",
      // backdropFilter: "blur(6px) !important",
      Filter: "blur(6px) !important",
    },
    "& div": {
      background: `url(../assets/img/completed-sign.png)`,
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      width: "150px",
      height: "150px",
      position: "absolute",
      top: "30vh",
      left: "40%",
      // backdropFilter: "blur(6px) !important",
    },
  },
  // completedCanvasArea: {
  //   // "& .completedPlaceholder": {
  //   //   display: "flex",
  //   //   justifyContent: "center",
  //   //   alignItems: "center",

  //   //   position: "sticky",
  //   //   width: "100%",
  //   //   minHeight: "100%",
  //   //   left: "0px",
  //   //   right: "0px",
  //   //   bottom: "0px",
  //   //   top: "0px",

  //   //   transform: "translate(-40px, -20px)",

  //   //   backdropFilter: "blur(1.2px)",

  //   //   zIndex: "9999",
  //   // },

  // },
  // =====================
  //      sign modal
  // =====================

  modalRoot: {
    "& .sigPad__penColors": {
      marginBottom: "10px",

      "& .pen_color_text": {
        display: "inline-block",
        marginRight: "5px",
      },

      "& .color_pen": {
        padding: "0px 9px ",
        borderRadius: "100% ",
      },
    },
    "& .generated_image_container": {
      width: "100px",
      margin: "1rem 0",
      backgroundColor: "#D3D3D3",
      height: "100px",
      padding: "1rem",
    },
    "& .clear_btn": {
      backgroundColor: "#1976D2",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      color: "#fff",
      marginLeft: "1rem",
    },
    "& .create_btn": {
      backgroundColor: "#3f5b78",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      color: "#fff",
    },
    "& .cross_btn_container": {
      position: "absolute",
      top: "0",
      right: "0",
    },
    // =====================
    //     end of sign modal
    // =====================
  },
  // =====================
  //     login form
  // =====================
  commonButton: {
    backgroundColor: "#185984 !important",
  },

  formMainContainer: {
    height: "calc(100vh - 87px)",
    display: "flex",
    alignItems: "center",
    "& p": {
      margin: "0",
    },
    "& .form_heading": {
      textAlign: "center",
    },
    "& .fields_container": {
      marginBottom: "1rem",
    },
    "& .forgot_password_container": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      "& .forgot_password_text": {
        fontSize: "12px",
      },
      "& .check_box": {
        "& .MuiTypography-root": {
          fontSize: "12px",
        },
      },
    },
  },

  // =======================
  // ParticipantsForm
  // =======================

  participantsMainContainer: {},
  // =========================
  // signer form
  // =========================
  signerFormContainer: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
  },
}));
