import React, { useState, useEffect } from "react";
import "../style.scss";

const DraftComponent = ({ isDraftExpanded }) => {
  const [selectedNumbers, setSelectedNumbers] = useState(Array(10).fill(null));

  const handleNumberClick = (index) => {
    const updatedNumbers = [...selectedNumbers];

    if (updatedNumbers[index] === null) {
      updatedNumbers[index] = "cross";
    } else if (updatedNumbers[index] === "cross") {
      updatedNumbers[index] = "circle";
    } else {
      updatedNumbers[index] = null;
    }

    setSelectedNumbers(updatedNumbers);
  };

  const handleClearButtonClick = () => {
    setSelectedNumbers(Array(10).fill(null));
  };

  useEffect(() => {
    // Add or remove a class for the animation based on isDraftExpanded
    document.body.classList.toggle("draft-expanded", isDraftExpanded);

    // Clean up the class when the component is unmounted
    return () => {
      document.body.classList.remove("draft-expanded");
    };
  }, [isDraftExpanded]);

  return (
    <div
      className={`draft-container ${
        isDraftExpanded ? "isvisible" : "ishidden"
      }`}
    >
      <div className="fixed bottom-0 left-0 w-full primary-beige-bg">
        <div className="flex justify-between items-center p-2">
          <div className="flex gap-0.5 w-full">
            {selectedNumbers.map((status, index) => (
              <button
                key={index}
                className={`flex-1 p-1.5 border-2 border-yellow-800 rounded-md ${
                  status === "cross"
                    ? "bg-red-800 primary-white-text"
                    : status === "circle"
                    ? "bg-green-400 primary-white-text"
                    : "primary-light-brown-bg primary-white-text"
                }`}
                onClick={() => handleNumberClick(index)}
              >
                {index}
              </button>
            ))}
          </div>
          <button
            className="p-1.5 bg-red-600 primary-white-text ml-1 rounded-md"
            onClick={handleClearButtonClick}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftComponent;
