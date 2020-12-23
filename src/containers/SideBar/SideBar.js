import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { resizeResults } from "face-api.js";
import "./Side.css";

const SideBar = () => {
  const [init, setInit] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      setInit(true);
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(startVideo);
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.getUserMedia(
      {
        video: {},
      },
      (stream) => (videoRef.current.srcObject = stream),
      (err) => console.log(err)
    );
  };

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (init) {
        setInit(false);
      }

      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
        videoRef.current
      );
      const displaySize = {
        width: 550,
        height: 400,
      };

      faceapi.matchDimensions(canvasRef.current, displaySize);
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvasRef.current.getContext("2d").clearRect(0, 0, 900, 600);
      faceapi.draw.drawDetections(canvasRef.current, detections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, detections);
      faceapi.draw.drawFaceExpressions(canvasRef.current, detections);
      console.log(detections);
    }, 100);
  };

  return (
    <div>
      <h1>How is your mood today?😊😊</h1>
      {/* <span>{init ? "Initializing" : "Ready"}</span> */}
      <div className="display-flex justify-content-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          height={520}
          width={700}
          onPlay={handleVideoOnPlay}
        />
        <canvas ref={canvasRef} className="position-absolute" />
      </div>
    </div>
  );
};

export default SideBar;
