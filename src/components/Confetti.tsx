"use client";
import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";

const ConfettiComponent = () => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  if (!width || !height) return null;
  return (
    <>
      <Confetti
        width={width}
        height={height}
        recycle
        numberOfPieces={300}
        gravity={0.1}
      />
    </>
  );
};

export default ConfettiComponent;
