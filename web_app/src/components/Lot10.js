import React from "react";
import { useState, useEffect } from "react";
import { auth, db, realtimeDb } from "../firebase-config";
import mapv3 from "../assets/mapv3.jpg";
import { MapInteractionCSS, MapInteraction } from 'react-map-interaction';

import {
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import Button from "@mui/material/Button";
import CircleIcon from "@mui/icons-material/Circle";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { makeStyles } from "@mui/styles";

import "react-medium-image-zoom/dist/styles.css";

var firebaseui = require("firebaseui");

const useStyles = makeStyles({
  mapContainer: {
    position: "relative",
    gridColumn: "1 / 4",
    gridRow: 2,
    width: "100%"
  },
  map: {
    position: "absolute",
    width: 700,
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  mapWrapper: {
    width: "50vw",
    height: "50vh",
    backgroundColor: "#e6dae6",
  },
  wrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    gridAutoRows: "minmax(100px, auto)",
  },
  spotIcon: {
    cursor:"pointer"
  },
  infoWrapper: {
    gridRow: 6,
  },
  reserveButton: {
    marginTop: "30px !important",
  },
});

const Lot10 = (props) => {
  const [spots, setSpots] = useState([]);
  const [curSpot, setCurSpot] = useState({
    id: 0,
    status: 0,
    reservation: { reserved: false },
  });
  
  const [openModal, setOpenModal] = useState(false);
  const spotsRef = realtimeDb.ref().child("spots");
  const classes = useStyles();

  useEffect(() => {
    spotsRef.on("value", (snap) => {
      const arr = Object.values(snap.val()).map((val) => val);
      setSpots(arr);
    });
  }, []);

  const updateStatus = async (id, stat) => {
    const spotDoc = doc(db, "lot1", id);
    await updateDoc(spotDoc, { status: stat });
  };

  const reserveSpot = (id) => {
    spotsRef.child(id).child("reservation").update({ reserved: true });
    // updateStatus(id, stat);

    // const spotDoc = doc(db, "lot1", id);
    // await updateDoc(spotDoc, { reserver: props.user.uid });
  };

  const unreserveSpot = (id) => {
    spotsRef.child(id).child("reservation").update({ reserved: false });
  };

  const statusText = (spot) => {
    if (!spot) return "";
    return spot.status === 1
      ? "Occupied"
      : spot.reservation.reserved === true
      ? "Reserved"
      : "Available";
  };

  const generateMapIndicator = (spot) => {
    const reserved = spot.reservation.reserved;
    const status = spot.status;
    
    const color = status === 1 ? "#ff6961" : reserved ? "#BEBEBE" : "#C1E1C1";

    return (
      <Tooltip
        title={`Spot ${spot.id}`}
       className={classes.spotIcon}
        style={{ transform: "scale(4)",position:"absolute", left: `calc(${-(100 - spot.id*35) * 4.75 + 845}px)` , top: '200px'}}
        
      >
        <IconButton className={classes.spotIcon}
        onMouseDown={() => {
          setCurSpot(spot);
          setOpenModal(true);
          console.log(openModal);
        }}>
          <CircleIcon htmlColor={color} />
        </IconButton>
      </Tooltip>
    );
  };

  const renderModal = () => {
    const status = statusText(curSpot);
    return (
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {`Spot ${curSpot.id}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Current status: ${status}`}
          </Typography>
          {status === "Available" && (
            <Button
              onClick={() => {
                reserveSpot(curSpot.id);
                setOpenModal(false);
              }}
              variant="contained"
              color="primary"
              className={classes.reserveButton}
            >
              Reserve
            </Button>
          )}
          {status === "Reserved" && (
            <Button
              onClick={() => {
                unreserveSpot(curSpot.id);
                setOpenModal(false);
              }}
              variant="contained"
              color="secondary"
              className={classes.reserveButton}
            >
              Cancel Reservation
            </Button>
          )}
        </Box>
      </Modal>
    );
  };

  const colorMap = new Map();

  colorMap.set(1, "disabled");
  colorMap.set(0, "success");
  // colorMap.set("RESERVED", "secondary");

  const Demo = styled("div")(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
  }));
 
  return (
      <MapInteractionCSS >
      <div className={classes.mapContainer}>
        <img src={mapv3}/>
        {console.log(spots)}
        {spots.map((spot) => generateMapIndicator(spot))}
      </div>
      <div className={classes.infoWrapper}></div>
      {renderModal()}
  
    </MapInteractionCSS>
  );
};

export default Lot10;