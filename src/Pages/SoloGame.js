import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import "../style.scss";
import Draft from "../Components/Draft";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  saveGameData,
  compareAndSaveGameData,
  fetchGameData,
  updateGameStatus,
} from "../firebase/storage";
import { useAuth } from "../Contexts/AuthContexts";
import QuitDialogBox from "../Components/QuitDialogBox";
import WinDialogBox from "../Components/WinDialogBox";
import {
  generateSecretCode,
  calculateCowsAndBulls,
} from "../Components/CommonFunctions";

const allowedInputFieldValues = [3, 4, 5, 6];

const createInputValueRefs = (numberOfInputFields) => {
  return Array.from({ length: numberOfInputFields }, () => useRef());
};

function SoloGame() {
  const navigate = useNavigate();
  const { digits, gameId } = useParams();
  let numberOfInputFields = parseInt(digits, 10) || 4;

  if (!allowedInputFieldValues.includes(numberOfInputFields)) {
    // Reset to default value if an invalid input is provided
    numberOfInputFields = 4;
  }
  const inputValueRefs = createInputValueRefs(numberOfInputFields);
  const [inputValue, setInputValue] = useState(
    Array(numberOfInputFields).fill("")
  );
  const [guesses, setGuesses] = useState([]);
  const scrollableContainer = useRef(null);
  const [secretCode, setSecretCode] = useState();
  const [hintUsed, setHintUsed] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [isDraftExpanded, setIsDraftExpanded] = useState(true);
  const { userLoggedIn, currentUser } = useAuth();
  const [quits, setQuits] = useState(false);
  const [isWinning, setIsWinning] = useState(false);

  useEffect(() => {
    if (scrollableContainer.current) {
      // Scroll to the bottom when the component mounts or when the content changes
      scrollableContainer.current.scrollTop =
        scrollableContainer.current.scrollHeight;
    }
  }, [guesses]);

  useEffect(() => {
    compareAndSaveGameData(
      currentUser?.uid,
      currentUser?.displayName ? currentUser?.displayName : currentUser?.email,
      digits,
      gameId
    );
  }, [currentUser, digits, gameId]);

  useEffect(() => {
    // Check if the latest guess has bulls equal to digits
    const latestGuess = guesses[guesses.length - 1];
    if (latestGuess && latestGuess.bulls === numberOfInputFields) {
      // Set the winning state after a delay
      setTimeout(() => {
        setIsWinning(true);
      }, 2000); // 1 second delay as an example, adjust as needed
    }
  }, [guesses, numberOfInputFields]);

  useEffect(() => {
    // Generate the secret code only once when the component mounts
    setSecretCode(generateSecretCode(numberOfInputFields));
    fetchGameData(
      gameId,
      setGuesses,
      setSecretCode,
      numberOfInputFields,
      generateSecretCode
    );
  }, []);

  ///////////////////////////////////////////////// Fucntions ///////////////////////////////////////////////

  const handleInputValueChange = (index, value) => {
    if (isNaN(value) || inputValue.includes(value)) return; // Only allow numeric input and no repeat input

    const newInputValue = [...inputValue];
    newInputValue[index] = value;

    setInputValue(newInputValue);

    // Move focus to the next input box
    if (index < numberOfInputFields - 1 && value !== "") {
      inputValueRefs[index + 1].current.focus();
    }
  };

  const handleQuit = async () => {
    try {
      // Update the isCompleted status for the current game
      await updateGameStatus(currentUser.uid, gameId);
    } catch (error) {
      console.error("Error quitting game:", error);
    }
  };

  const handleDraftButtonClick = () => {
    setIsDraftExpanded(!isDraftExpanded);
  };

  const handleBackspace = (index) => {
    // Handle backspace key

    if (index === 0 && hintUsed) {
      // If the hint is used, prevent deleting the value in the first input box
      return;
    }

    if (index > 0 && inputValue[index] === "") {
      // If the current box is empty, delete the value from the previous box
      if (index === 1 && hintUsed) {
        return;
      }

      const newInputValue = [...inputValue];
      newInputValue[index - 1] = "";
      setInputValue(newInputValue);

      // Move focus to the previous input box
      inputValueRefs[index - 1].current.focus();
    } else if (index >= 0) {
      // If the current box is not empty, simply clear the value
      const newInputValue = [...inputValue];
      newInputValue[index] = "";
      setInputValue(newInputValue);

      // Move focus to the current input box
      inputValueRefs[index].current.focus();
    }
  };

  const handleHint = () => {
    if (!hintUsed) {
      const hintValue = secretCode[0];
      const newInputValue = [...inputValue];
      newInputValue[0] = hintValue;
      setInputValue(newInputValue);
      setHintUsed(true);
    } else {
      // Alert for hint already used
      setHintMessage("Hint can be used once per session.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any input field is empty
    if (inputValue.some((digit) => digit === "")) {
      return;
    }

    // Calculate cows and bulls
    const { cows, bulls } = calculateCowsAndBulls(inputValue, secretCode);

    // Store the current guess and result in the guesses array
    const newGuesses = [
      ...guesses,
      { guess: inputValue.join(""), cows: cows, bulls: bulls },
    ];
    setGuesses(newGuesses);

    // Clear the input values
    if (!hintUsed) {
      setInputValue(Array(numberOfInputFields).fill(""));
    } else {
      const newInputValue = inputValue.map((digit, index) =>
        index === 0 ? digit : ""
      );
      setInputValue(newInputValue);
    }

    // Move focus to the first input box
    inputValueRefs[0].current.focus();

    // Save the game data to Firestore
    try {
      await saveGameData(gameId, inputValue.join(""), cows, bulls, secretCode);
    } catch (error) {
      console.error("Error saving game data:", error);
    }

    console.log(secretCode);
  };

  const handleWinDialogClose = () => {
    handleQuit();
    setIsWinning(false);
    navigate("/home");
  };

  return (
    <div className="flex flex-col h-screen primary-white-bg">
      <Navbar />
      <QuitDialogBox
        open={quits}
        onClose={() => setQuits(false)}
        handleQuit={handleQuit}
      />
      <WinDialogBox
        open={isWinning}
        onClose={handleWinDialogClose}
        chance={guesses.length}
        currentPlayer={currentUser}
      />
      <div className="flex-1 overflow-hidden mx-12 sm:mx-16 py-20 lg:py-24">
        <div className="mx-auto flex flex-col-reverse lg:flex-row gap-x-4 h-full">
          <div className="flex flex-col items-center w-full justify-center">
            <div className="w-fit lg:w-full p-4 lg:py-20 px-12 lg:px-0 border-4 border-yellow-800 rounded-2xl primary-beige-bg">
              <div className="w-full flex justify-center text-sm lg:text-2xl font-bold primary-light-brown-text">
                Number of Guesses = {guesses.length}{" "}
              </div>
              <form
                className="flex justify-center my-2 lg:my-8"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">
                  <div>
                    {inputValue.map((digit, index) => (
                      <input
                        key={index}
                        ref={inputValueRefs[index]}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) =>
                          handleInputValueChange(index, e.target.value)
                        }
                        onKeyDown={(e) =>
                          e.key === "Backspace" && handleBackspace(index)
                        }
                        readOnly={index === 0 && hintUsed}
                        className="mx-1 lg:mx-2 w-5 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 text-center border-2 border-yellow-800 rounded"
                      />
                    ))}
                  </div>
                  <button
                    className="button rounded-md px-2 py-1.5 lg:px-3.5 lg:py-2.5 text-xs sm:text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </form>
              <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-x-8 lg:m-4 justify-center">
                <button
                  onClick={handleHint}
                  disabled={hintUsed}
                  className={`button rounded-md px-2 py-1.5 lg:px-3.5 lg:py-2.5 text-xs md:text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  ${
                    hintUsed
                      ? "bg-indigo-400 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white"
                  }`}
                  title={hintUsed ? hintMessage : ""}
                >
                  Hint
                </button>
                <button
                  onClick={() => navigate("/rules")}
                  className="button rounded-md px-2 py-1.5 lg:px-3.5 lg:py-2.5 text-xs sm:text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Rules
                </button>
                <button
                  onClick={() => setQuits(true)}
                  className="button rounded-md px-2 py-1.5 lg:px-3.5 lg:py-2.5 text-xs sm:text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Quit
                </button>
                <button
                  onClick={handleDraftButtonClick}
                  className="button rounded-md px-2 py-1.5 lg:px-3.5 lg:py-2.5 text-xs sm:text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Draft
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 lg:flex-auto w-full">
            {guesses.length === 0 ? (
              <div className="mb-2 lg:mb-0 border-dashed border-4 rounded-sm border-yellow-800 divide-y-2 w-full h-full">
                <div className="flex justify-center items-center px-6 py-4- w-full h-full font-bold primary-dark-text">
                  A {digits} digit Secret Code has been genrated. Make your
                  guess to figure out the code....
                </div>
              </div>
            ) : (
              <div className="rounded overflow-hidden shadow-md mb-4 primary-white-text font-bold primary-brown-bg">
                <div className="flex justify-between px-2 sm:px-6 py-4">
                  <p className="pl-2 text-xs sm:text-base">Number</p>
                  <div className="flex">
                    <p className="mx-3 sm:mx-6 text-xs sm:text-base">Cows</p>
                    <p className="mx-3 sm:mx-6 text-xs sm:text-base">Bulls</p>
                  </div>
                </div>
              </div>
            )}
            {guesses.length > 0 && (
              <div className="scrollable-container" ref={scrollableContainer}>
                {guesses.map((guess, index) => (
                  <div
                    key={index}
                    className={`rounded overflow-hidden shadow mb-2 primary-dark-text primary-beige-bg ${
                      guess.bulls === numberOfInputFields
                        ? "winning-animation"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between px-2 sm:px-6 py-4">
                      <p className="border-l-4 border-yellow-800 pl-2 text-xs sm:text-base">
                        {guess.guess}
                      </p>
                      <div className="flex">
                        <p className="mx-4 sm:mx-8 text-xs sm:text-base">
                          {guess.cows}C
                        </p>
                        <p className="mx-4 sm:mx-8 text-xs sm:text-base">
                          {guess.bulls}B
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Draft isDraftExpanded={isDraftExpanded} />
    </div>
  );
}

export default SoloGame;
