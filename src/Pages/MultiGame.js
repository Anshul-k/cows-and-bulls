import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Components/Navbar";
import "../style.scss";
import {
  multiPlayerCompareAndSaveID,
  initialMultiPlayerGameDataSave,
  getPlayerData,
  updatePlayerReadyStatus,
  fetchIsSceretCodeSubmitted,
  retrievePlayerData,
  assignPlay,
  saveMultiGameData,
  fetchMultiGuesses,
  updatePlayerCompleteStatus,
  updatePlayerQuitStatus,
  updatePlayerWinStatus,
} from "../firebase/multiplayer";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContexts";
import PlayerWaitingDialogBox from "../Components/PlayerWaitingDialogBox";
import { calculateCowsAndBulls } from "../Components/CommonFunctions";
import { onSnapshot } from "firebase/firestore";
import Draft from "../Components/Draft";
import TurnCompleteDialogBox from "../Components/TurnCompleteDialogBox";
import WinDialogBox from "../Components/WinDialogBox";
import QuitDialogBox from "../Components/QuitDialogBox";
import ChatComponent from "../Components/ChatComponent";
import { useMedia } from "react-use";

const allowedInputFieldValues = [3, 4, 5, 6];

const createInputValueRefs = (numberOfInputFields) => {
  return Array.from({ length: numberOfInputFields }, () => useRef());
};

const getRandomColor = () => {
  const predefinedColors = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "indigo",
    "pink",
  ];
  const randomIndex = Math.floor(Math.random() * predefinedColors.length);
  return predefinedColors[randomIndex];
};

function MultiGame() {
  const navigate = useNavigate();
  const [navbarHeight, setNavbarHeight] = useState(0);
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
  const [secretValue, setSecretValue] = useState(
    Array(numberOfInputFields).fill("")
  );
  const [secretNumberErrors] = useState(Array(numberOfInputFields).fill(false));
  const [isSecretCodeReady, setIsSecretCodeReady] = useState(false);
  const [isSecretCodeSubmitted, setIsSecretCodeSubmitted] = useState(false);
  const { currentUser } = useAuth();
  const [playerWaiting, setPlayerWaiting] = useState(true);
  const [player1Data, setPlayer1Data] = useState("");
  const [player2Data, setPlayer2Data] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [avatarBGColor, setAvatarBGColor] = useState("");
  const [playerAvatarUrl, setPlayerAvatarUrl] = useState({
    player1Url: "",
    player2Url: "",
  });
  const [hintUsed, setHintUsed] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [secretCode, setSecretCode] = useState();
  const scrollableContainer = useRef(null);
  const [isDraftExpanded, setIsDraftExpanded] = useState(true);
  const [hintMessage, setHintMessage] = useState("");
  const [turnComplete, setTurnComplete] = useState(false);
  const [bothPlayersCompleted, setBothPlayersCompleted] = useState(false);
  const [quits, setQuits] = useState(false);
  const [otherPlayerQuits, setOtherPlayerQuits] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const isDesktop = useMedia("(min-width: 768px)");

  // Function to get the height of the navbar
  const getNavbarHeight = () => {
    const navbar = document.getElementById("navbar"); // Replace with your actual navbar ID
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight / 16); // Convert to rem units
    }
  };

  // Function to check secretcode readiness
  const checkSecretCodeReadiness = useCallback(() => {
    const isReady = !secretValue.some((digit) => digit === "");
    setIsSecretCodeReady(isReady);
  }, [secretValue]);

  const setAvatarUrlBasedOnDisplayName = (playerData, currentUser) => {
    if (
      (playerData.displayName === currentUser?.displayName &&
        playerData.displayName !== currentUser?.email) ||
      playerData.displayName === currentUser?.email
    ) {
      // Set avatar based on displayName or email
      if (playerData.displayName === currentUser?.displayName) {
        return `https://robohash.org/${currentUser.email.substring(0, 2)}`;
      } else {
        return `https://robohash.org/${playerData.displayName.substring(0, 2)}`;
      }
    } else {
      return `https://robohash.org/${playerData.displayName
        .substring(0, 2)
        .toLowerCase()}`;
    }
  };

  const handleDraftButtonClick = () => {
    setIsDraftExpanded(!isDraftExpanded);
  };

  ///////////////////////////////////////////////// UseEffcts ///////////////////////////////////////////////////

  useEffect(() => {
    // Check if both players are ready, then show the chat icon
    if (player1Data.isReady && player2Data.isReady) {
      setShowChat(true);
    } else {
      setShowChat(false);
    }
  }, [player1Data.isReady, player2Data.isReady]);

  useEffect(() => {
    if (player1Data.quit || player2Data.quit) {
      setOtherPlayerQuits(true);
      setTimeout(() => {
        if (player1Data.quit) {
          updatePlayerQuitStatus(gameId, "player2");
        } else if (player2Data.quit) {
          updatePlayerQuitStatus(gameId, "player1");
        }
        navigate("/home");
      }, 5000);
    }
  }, [player1Data.quit, player2Data.quit, gameId, navigate]);

  useEffect(() => {
    const fetchGuesses = async () => {
      try {
        // Check if both players' data is available
        if (gameId && (player1Data.guesses || player2Data.guesses)) {
          const fetchedGuesses = await fetchMultiGuesses(
            gameId,
            player1Data,
            player2Data
          );
          setGuesses(fetchedGuesses);
        }
      } catch (error) {
        console.error("Error fetching guesses:", error);
      }
    };

    fetchGuesses();
  }, [gameId, player1Data, player2Data]);

  useEffect(() => {
    const fetchPlayerData = async () => {
      const playerRef = retrievePlayerData(gameId);

      // Set up real-time listener for player1 and Player2 data and set CurrentPlayer data
      const playerUnsubscribe = onSnapshot(playerRef, async (snapshot) => {
        if (snapshot.exists()) {
          const player = snapshot.data();
          setPlayer1Data(player.players.player1);
          setPlayer2Data(player.players.player2);
          if (
            (player.players.player1.displayName === currentUser?.displayName ||
              player.players.player1.displayName === currentUser?.email) &&
            player.players.player1.isActive
          ) {
            setCurrentPlayer(player.players.player1);
            setSecretCode(player.players.player2.secretCode);
          } else {
            setCurrentPlayer(player.players.player2);
            setSecretCode(player.players.player1.secretCode);
          }
        } else {
          console.error(`Player document does not exist in game ${gameId}`);
        }
      });

      return () => {
        // Cleanup the real-time listeners when the component is unmounted
        playerUnsubscribe();
      };
    };

    if (player1Data.isActive && player2Data.isActive) {
      fetchPlayerData();
    }
  }, [
    gameId,
    player1Data.isActive,
    player2Data.isActive,
    currentUser?.displayName,
    currentUser?.email,
    player1Data.isCompleted,
    player2Data.isCompleted,
  ]);

  //For handlinging the player change and complete status.
  useEffect(() => {
    // Check if the latest guess has bulls equal to digits
    if (
      guesses &&
      numberOfInputFields &&
      currentPlayer.isPlaying &&
      currentPlayer.guesses
    ) {
      const latestGuess = guesses[guesses.length - 1];
      if (latestGuess && latestGuess.bulls === numberOfInputFields) {
        // Set the winning state after a delay
        setTimeout(() => {
          setTurnComplete(true);
          const nextPlayer =
            currentPlayer.displayName === player1Data.displayName
              ? "player2"
              : "player1";

          const currentPlayingPlayer =
            currentPlayer.displayName === player1Data.displayName
              ? "player1"
              : "player2";

          if (currentPlayer.isPlaying && !currentPlayer.isCompleted) {
            assignPlay(gameId, nextPlayer);
            updatePlayerCompleteStatus(
              gameId,
              currentPlayingPlayer,
              guesses.length
            );
          }
        }, 2000);
      }
    }
  }, [
    gameId,
    numberOfInputFields,
    guesses,
    currentPlayer.displayName,
    currentPlayer.isCompleted,
    currentPlayer.isPlaying,
    player1Data.displayName,
    currentPlayer.guesses,
  ]);

  useEffect(() => {
    if (
      player1Data.isReady &&
      player2Data.isReady &&
      player1Data.isCompleted &&
      player2Data.isCompleted
    ) {
      setBothPlayersCompleted(true);
    }
  }, [
    player1Data.isReady,
    player2Data.isReady,
    player1Data.isCompleted,
    player2Data.isCompleted,
  ]);

  useEffect(() => {
    // Scroll to the bottom when the component mounts or when the content changes
    if (scrollableContainer.current) {
      scrollableContainer.current.scrollTop =
        scrollableContainer.current.scrollHeight;
    }
  }, [guesses]);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const player1 = await getPlayerData(gameId, "player1");
        const player2 = await getPlayerData(gameId, "player2");

        // Check if both player data is available
        if (player1 && player2) {
          const player1AvatarUrl = setAvatarUrlBasedOnDisplayName(
            player1,
            currentUser
          );
          const player2AvatarUrl = setAvatarUrlBasedOnDisplayName(
            player2,
            currentUser
          );

          // Set avatars only if the URL is not null
          if (player1AvatarUrl && player2AvatarUrl && player1 && player2) {
            setPlayer1Data({ ...player1 });
            setPlayer2Data({ ...player2 });
            setPlayerAvatarUrl({
              player1Url: player1AvatarUrl,
              player2Url: player2AvatarUrl,
            });
            if (
              player1.displayName === currentUser?.displayName ||
              player1.displayName === currentUser?.email
            ) {
              setCurrentPlayer({ ...player1 });
              setSecretCode(player2.secretCode);
            } else {
              setCurrentPlayer({ ...player2 });
              setSecretCode(player1.secretCode);
            }
          } else {
            console.log("Player 2 data not available. Retrying...");
            setTimeout(() => fetchAvatars(), 1000); // If player2 data is not available, retry after after 1 second
          }
        } else {
          setTimeout(() => fetchAvatars(), 1000); // Retry after 1 second
        }
      } catch (error) {
        setTimeout(() => fetchAvatars(), 1000); // Retry after 1 second
      }
    };

    fetchAvatars();
    setAvatarBGColor(getRandomColor());
  }, [currentUser, gameId]);

  useEffect(() => {
    multiPlayerCompareAndSaveID(
      currentUser?.uid,
      currentUser?.displayName ? currentUser?.displayName : currentUser?.email,
      digits,
      gameId
    );
    initialMultiPlayerGameDataSave(
      gameId,
      currentUser?.displayName ? currentUser?.displayName : currentUser?.email
    );
  }, [currentUser, digits, gameId]);

  useEffect(() => {
    checkSecretCodeReadiness();
  }, [secretValue, checkSecretCodeReadiness]);

  // Call getNavbarHeight when the component mounts and when the window is resized
  useEffect(() => {
    getNavbarHeight();
    window.addEventListener("resize", getNavbarHeight);
    return () => {
      window.removeEventListener("resize", getNavbarHeight);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isSecretCodeSubmitedValue = await fetchIsSceretCodeSubmitted(
          gameId,
          currentUser
        );
        setIsSecretCodeSubmitted(isSecretCodeSubmitedValue);
      } catch (error) {
        console.error("Error fetching isSecretCodeSubmitted value:", error);
      }
    };

    if (player1Data.isActive && player2Data.isActive) {
      fetchData();
    }
  }, [gameId, currentUser, player1Data.isActive, player2Data.isActive]);

  useEffect(() => {
    const handleReadyStatusChange = async () => {
      if (player1Data.isReady && player2Data.isReady) {
        // Both players are ready, start the game
        const randomPlayer = Math.random() < 0.5 ? "player1" : "player2";
        // Call the function to randomly assign the value true to isPlaying
        await assignPlay(gameId, randomPlayer);
      }
    };
    if (!player1Data.isPlaying && !player2Data.isPlaying) {
      handleReadyStatusChange();
    }
  }, [
    gameId,
    player1Data.isReady,
    player2Data.isReady,
    player2Data.isPlaying,
    player1Data.isPlaying,
  ]);

  ///////////////////////////////////////////////// FOR SECRET VALUE SUBMIT ////////////////////////////////////////////////////////

  const handleSecretValueChange = (index, value) => {
    if (isNaN(value) || secretValue.includes(value)) return; // Only allow numeric input and no repeat input

    const newSecretValue = [...secretValue];
    newSecretValue[index] = value;

    setSecretValue(newSecretValue);

    // Move focus to the next input box
    if (index < numberOfInputFields - 1 && value !== "") {
      inputValueRefs[index + 1].current.focus();
    }

    checkSecretCodeReadiness();
  };

  const handleSecretValueBackspace = (index) => {
    // Handle backspace key
    if (index > 0 && secretValue[index] === "") {
      // If the current box is empty, delete the value from the previous box
      const newSecretValue = [...secretValue];
      newSecretValue[index - 1] = "";
      setSecretValue(newSecretValue);

      // Move focus to the previous input box
      inputValueRefs[index - 1].current.focus();
    } else if (index >= 0) {
      // If the current box is not empty, simply clear the value
      const newSecretValue = [...secretValue];
      newSecretValue[index] = "";
      setSecretValue(newSecretValue);

      // Move focus to the current input box
      inputValueRefs[index].current.focus();
    }
  };

  const handleSecretValueSubmit = async (e) => {
    e.preventDefault();

    // Check if any input field is empty
    if (secretValue.some((digit) => digit === "")) {
      return;
    }

    // Update the ready status in the database
    updatePlayerReadyStatus(gameId, currentUser, secretValue.join(""));
    setIsSecretCodeReady(false);

    // Set isSecretCodeSubmitted to true
    setIsSecretCodeSubmitted(true);

    setSecretValue(Array(numberOfInputFields).fill(""));
  };

  ///////////////////////////////////////////////// FOR INPUT VALUE SUBMIT ////////////////////////////////////////////////////////

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

    // // Save the game data to Firestore
    try {
      const playerDataToSave =
        currentPlayer.displayName === player1Data.displayName
          ? player1Data
          : player2Data;

      await saveMultiGameData(
        gameId,
        inputValue.join(""),
        cows,
        bulls,
        secretCode,
        playerDataToSave
      );
    } catch (error) {
      console.error("Error saving game data:", error);
    }
  };

  const handleWinDialogBox = async () => {
    try {
      if (player1Data.numberOfChances > player2Data.numberOfChances) {
        updatePlayerWinStatus(gameId, "player1");
      } else if (player1Data.numberOfChances < player2Data.numberOfChances) {
        updatePlayerWinStatus(gameId, "player2");
      } else {
        updatePlayerWinStatus(gameId, "player1");
        updatePlayerWinStatus(gameId, "player2");
      }
      setBothPlayersCompleted(false);
      navigate("/home");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleOtherPlayerQuits = async () => {
    try {
      if (player1Data.quit) {
        updatePlayerWinStatus(gameId, "player2");
      } else if (player2Data.quit) {
        updatePlayerWinStatus(gameId, "player1");
      }
      setOtherPlayerQuits(false);
    } catch (error) {
      console.log("Error updating the Other Player Quit function:", error);
    }
  };

  const handleQuit = async () => {
    try {
      // Update the quit Value of the player
      const player =
        currentPlayer.displayName === player1Data.displayName
          ? "player1"
          : "player2";
      updatePlayerQuitStatus(gameId, player);
    } catch (error) {
      console.error("Error quitting game:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen primary-white-bg">
      {player1Data.quit && player2Data.quit && (
        <Navigate to={"/"} replace={true} />
      )}
      <Navbar />
      <PlayerWaitingDialogBox
        open={playerWaiting}
        onClose={() => setPlayerWaiting(false)}
        gameId={gameId}
      />
      {(!player1Data.isCompleted || !player2Data.isCompleted) && (
        <TurnCompleteDialogBox
          open={turnComplete}
          onClose={() => setTurnComplete(false)}
          chance={currentPlayer.numberOfChances}
          player={currentPlayer.displayName}
        />
      )}
      <WinDialogBox
        open={bothPlayersCompleted}
        onClose={handleWinDialogBox}
        isMulti={true}
        player1={player1Data}
        player2={player2Data}
        currentPlayer={currentPlayer}
      />
      <WinDialogBox
        open={otherPlayerQuits}
        onClose={handleOtherPlayerQuits}
        isMulti={true}
        isQuit={true}
        currentPlayer={currentPlayer}
      />
      <QuitDialogBox
        open={quits}
        onClose={() => setQuits(false)}
        handleQuit={handleQuit}
      />
      <div
        style={{ paddingTop: `${navbarHeight}rem` }}
        className="flex justify-between m-3"
      >
        <div className="flex">
          <div className="flex items-center">
            <div
              className={`relative ml-4 flex rounded-full bg-${avatarBGColor}-300 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800`}
            >
              <img
                className="h-5 w-5 lg:h-8 lg:w-8 rounded-full"
                src={playerAvatarUrl.player1Url}
                alt=""
              />
            </div>
          </div>
          <div className="flex flex-col text-left text-xs lg:text-base">
            <p className="mx-2 font-bold primary-light-brown-text">Player 1</p>
            <p className="mx-2">
              {isDesktop
                ? player1Data.displayName
                  ? player1Data.displayName
                  : "Waiting for other player to join....."
                : player1Data.displayName
                ? player1Data.displayName.includes(" ")
                  ? `${player1Data.displayName.charAt(
                      0
                    )}${player1Data.displayName
                      .split(" ")[1]
                      .charAt(0)
                      .toUpperCase()}`
                  : player1Data.displayName.substring(0, 2).toUpperCase()
                : "Waiting for other player to join....."}
            </p>
          </div>
        </div>
        {(player1Data.quit || player2Data.quit) && (
          <div className="alert font-semibold">
            The other player has left the room.
            <br />
            Redirecting you to Home...
          </div>
        )}
        <div className="flex">
          <div className="flex flex-col text-xs lg:text-base">
            <p className="mx-2 flex justify-end font-bold primary-light-brown-text">
              Player 2
            </p>
            <p className="mx-2 flex justify-end">
              {isDesktop
                ? player2Data.displayName
                  ? player2Data.displayName
                  : "Waiting for other player to join....."
                : player2Data.displayName
                ? player2Data.displayName.includes(" ")
                  ? `${player2Data.displayName.charAt(
                      0
                    )}${player2Data.displayName
                      .split(" ")[1]
                      .charAt(0)
                      .toUpperCase()}`
                  : player2Data.displayName.substring(0, 2).toUpperCase()
                : "Waiting for other player to join....."}
            </p>
          </div>
          <div className="flex items-center">
            <div
              className={`relative mr-4 flex rounded-full bg-${avatarBGColor}-300 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800`}
            >
              <img
                className="h-5 w-5 lg:h-8 lg:w-8 rounded-full"
                src={playerAvatarUrl.player2Url}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      {!(player1Data.isReady && player2Data.isReady) && (
        <div className="w-full flex items-center justify-center h-full my-24 sm:my-28">
          <form
            className="flex flex-col items-center m-4 p-4 sm:p-8 justify-center my-8 max-w-fit border-4 border-dashed border-yellow-800 primary-beige-bg"
            onSubmit={handleSecretValueSubmit}
          >
            <div className="mb-4 primary-dark-text font-bold text-lg">
              Enter the Secret Code for the other player to guess.
            </div>
            <div>
              {secretValue.map((digit, index) => (
                <input
                  key={index}
                  ref={inputValueRefs[index]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) =>
                    handleSecretValueChange(index, e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Backspace" && handleSecretValueBackspace(index)
                  }
                  className={`mx-2 w-7 h-9 sm:w-10 sm:h-10 text-center rounded border-2 border-yellow-800 focus-visible:border-yellow-800 ${
                    secretNumberErrors[index] ? "border-red-500" : ""
                  }`}
                  inputMode="numeric"
                />
              ))}
            </div>
            <button
              className={`button mx-2 mt-4 w-fit rounded-md px-3.5 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                !isSecretCodeReady || isSecretCodeSubmitted
                  ? "cursor-not-allowed"
                  : ""
              }`}
              type="submit"
              disabled={!isSecretCodeReady || isSecretCodeSubmitted}
            >
              {isSecretCodeSubmitted ? "Waiting" : "Ready"}
            </button>
            <div
              className={`alert mt-2 ${
                isSecretCodeSubmitted ? "visible" : "hidden"
              }`}
            >
              Waiting for the other player to get ready...
            </div>
          </form>
        </div>
      )}

      {player1Data.isReady && player2Data.isReady && (
        <div className="flex-1 flex overflow-hidden mx-8 sm:mx-16 pb-12 py-10 lg:pt-12 lg:pb-24">
          <div
            className={`${
              !currentPlayer.isPlaying ? "h-4/5" : ""
            } w-full 4mx-auto flex flex-col-reverse lg:flex-row gap-x-4`}
          >
            <div className="flex flex-col items-center w-full justify-center">
              {!currentPlayer.isPlaying && (
                <div className="w-full h-full flex flex-col justify-center items-center p-4 lg:p-12">
                  <div className="flex w-fit flex-col justify-center items-center border-2 h-full border-yellow-800 rounded primary-beige-bg p-4 lg:p-6">
                    <div className="w-fit font-bold primary-light-brown-text text-center text-xs lg:text-base">
                      {currentPlayer.displayName === player1Data.displayName
                        ? player2Data.displayName
                        : player1Data.displayName}{" "}
                      is guessing the secretCode
                    </div>
                    <div className="w-fit flex flex-col flex-1 justify-center items-center text-xs lg:text-base">
                      <div>Your Secret Code</div>
                      <div>{currentPlayer.secretCode}</div>
                    </div>
                  </div>
                </div>
              )}
              {currentPlayer.isPlaying && (
                <div className="w-fit my-2 lg:my-12 lg:w-full p-2 lg:py-8 px-12 lg:px-0 border-4 border-yellow-800 rounded-2xl primary-beige-bg">
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
                            inputMode="numeric"
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
                      className={`button rounded-md px-2 py-1.5 lg:px-3.5 lg:py-2.5 text-xs md:text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
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
              )}
            </div>
            <div className="flex flex-grow lg:flex-grow-0 flex-col w-full">
              {guesses.length === 0 ? (
                <div className="mb-2 lg:mb-0 border-dashed border-4 rounded-sm border-yellow-800 divide-y-2 w-full h-full">
                  {currentPlayer.isPlaying ? (
                    <div className="flex justify-center items-center px-6 py-4 w-full h-full font-bold primary-dark-text text-xs lg:text-base">
                      The other player has entered a {digits} digit Secret Code
                      for you. Make your guess to figure out the code....
                    </div>
                  ) : (
                    <div className="flex justify-center items-center px-6 py-4 w-full h-full font-bold primary-dark-text text-xs lg:text-base">
                      Wait till the other player starts guessing your {digits}{" "}
                      digit Secret Code.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded overflow-hidden shadow-md mb-2 lg:pb-4 primary-white-text font-bold primary-brown-bg">
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
      )}
      {player1Data.isReady &&
        player2Data.isReady &&
        currentPlayer.isPlaying && <Draft isDraftExpanded={isDraftExpanded} />}

      {showChat && (
        <ChatComponent gameId={gameId} currentPlayer={currentPlayer} />
      )}
    </div>
  );
}

export default MultiGame;
