import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const saveGameData = async (gameId, guess, cows, bulls, secretCode) => {
  try {
    const gameRef = doc(db, "Solo_games", gameId);

    // Check if the game document exists
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      // If the game document exists, update the data
      await setDoc(
        gameRef,
        {
          guesses: [...gameDoc.data().guesses, { guess, cows, bulls }],
          secretCode,
        },
        { merge: true }
      );
    } else {
      // If the game document doesn't exist, create a new one
      await setDoc(gameRef, {
        guesses: [{ guess, cows, bulls }],
        secretCode,
      });
    }
  } catch (error) {
    console.error("Error saving game data:", error);
    throw error;
  }
};

export const updateGameStatus = async (userId, gameId) => {
  try {
    const userRef = doc(db, "Solo_users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentGames = userDoc.data().games || [];
      const updatedGames = currentGames.map((game) => {
        if (game.gameId === gameId) {
          return { ...game, isCompleted: true };
        }
        return game;
      });

      await setDoc(userRef, { games: updatedGames }, { merge: true });
    }
  } catch (error) {
    console.error("Error updating game status:", error);
    throw error;
  }
};

export const fetchGameData = async (
  gameId,
  setGuesses,
  setSecretCode,
  numberOfInputFields,
  generateSecretCode
) => {
  try {
    const gameRef = doc(db, "Solo_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      const gameData = gameDoc.data();
      setGuesses(gameData.guesses || []);
      setSecretCode(
        gameData.secretCode || generateSecretCode(numberOfInputFields)
      );
    }
  } catch (error) {
    console.error("Error fetching game data:", error);
  }
};

export const saveUserGameId = async (
  userId,
  displayName,
  digits,
  newGameId,
  isCompleted = false
) => {
  try {
    if (userId) {
      const userRef = doc(db, "Solo_users", userId);
      const userDoc = await getDoc(userRef);

      let updatedGames = [];

      if (userDoc.exists()) {
        const currentGames = userDoc.data().games || [];
        updatedGames = [
          ...currentGames,
          { gameId: newGameId, isCompleted, digits },
        ];
      } else {
        updatedGames = [{ gameId: newGameId, isCompleted, digits }];
      }

      await setDoc(
        userRef,
        { games: updatedGames, displayName },
        { merge: true }
      );
    } else {
      console.error("User ID is undefined.");
    }
  } catch (error) {
    console.error("Error saving game ID for the user:", error);
    throw error;
  }
};

export const compareAndSaveGameData = async (
  userId,
  displayName,
  digits,
  newGameId,
  isCompleted = false
) => {
  try {
    if (userId && newGameId) {
      // Check if the user already has the current game ID
      const userRef = doc(db, "Solo_users", userId);
      const userDoc = await getDoc(userRef);

      if (
        !userDoc.exists() ||
        !userDoc.data().games ||
        !userDoc.data().games.some((game) => game.gameId === newGameId)
      ) {
        // Save the current game ID, displayName, and set isCompleted for the user
        saveUserGameId(userId, displayName, digits, newGameId, isCompleted);
      }
    }
  } catch (error) {
    console.error("Error checking and saving game ID for the user:", error);
  }
};

export const checkGameExists = async (
  userId,
  navigate,
  setShowDigitSelector
) => {
  try {
    const userRef = doc(db, "Solo_users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().games) {
      // Find the first incomplete game for the user
      const incompleteGame = userDoc
        .data()
        .games.find((game) => !game.isCompleted);

      if (incompleteGame) {
        // Fetch game data for the incomplete game
        const gameId = incompleteGame.gameId;
        const numberOfDigits = incompleteGame.digits;

        // Redirect to solo player game with gameId and numberOfDigits in the URL
        navigate(`/solo/${numberOfDigits}/${gameId}`);
      } else {
        // Show the digit selector dialog
        setShowDigitSelector(true);
      }
    } else {
      // Show the digit selector dialog
      setShowDigitSelector(true);
    }
  } catch (error) {
    console.error("Error checking game status:", error);
  }
};
