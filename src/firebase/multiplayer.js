import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const multiPlayerCompareAndSaveID = async (
  userId,
  displayName,
  digits,
  gameId
) => {
  try {
    if (userId && gameId) {
      // Check if the user already has the current game ID
      const userRef = doc(db, "Multi_users", userId);
      const userDoc = await getDoc(userRef);

      if (
        !userDoc.exists() ||
        !userDoc.data().games ||
        !userDoc.data().games.some((game) => game.gameId === gameId)
      ) {
        // Save the current game ID, displayName, and set isCompleted for the user
        let updatedGames = [];

        if (userDoc.exists()) {
          const currentGames = userDoc.data().games || [];
          updatedGames = [...currentGames, { gameId: gameId, digits: digits }];
        } else {
          updatedGames = [{ gameId: gameId, digits: digits }];
        }

        await setDoc(
          userRef,
          { games: updatedGames, displayName },
          { merge: true }
        );
      }
    }
  } catch (error) {
    console.error("Error checking and saving game ID for the user:", error);
    throw error;
  }
};

export const initialMultiPlayerGameDataSave = async (gameId, userName) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);

    // Check if the game document exists
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      // If the game document exists, update the data
      const existingPlayer1 = gameDoc.data().players?.player1;
      const existingPlayer2 = gameDoc.data().players?.player2;

      if (
        (existingPlayer1 && userName === existingPlayer1.displayName) ||
        (existingPlayer2 && userName === existingPlayer2.displayName)
      ) {
        // If userName is equal to either player1 or player2 display name, do nothing and return
        return;
      }

      // If both players have display names and current userName is not equal to either,
      // and player1 and player2 display names are not the same, show an alert
      if (
        existingPlayer1.isActive &&
        existingPlayer2.isActive &&
        userName !== existingPlayer1.displayName &&
        userName !== existingPlayer2.displayName
      ) {
        alert("Room is already filled");
        return;
      }

      await setDoc(
        gameRef,
        {
          players: {
            player1: existingPlayer1 || {
              displayName: userName,
              isPlaying: false,
              isActive: existingPlayer1 ? existingPlayer1.isActive : true,
              isReady: false,
              isSecretCodeSubmitted: false,
              isCompleted: false,
              numberOfChances: 0,
              quit: false,
              win: false,
            },
            player2: {
              displayName: existingPlayer1 ? userName : null,
              isPlaying: false,
              isActive: existingPlayer1 ? true : false,
              isReady: false,
              isSecretCodeSubmitted: false,
              isCompleted: false,
              numberOfChances: 0,
              quit: false,
              win: false,
            },
          },
          messages: [],
        },
        { merge: true }
      );
    } else {
      // If the game document doesn't exist, create a new one
      await setDoc(gameRef, {
        players: {
          player1: {
            displayName: userName,
            isPlaying: false,
            isActive: true,
            isReady: false,
            isSecretCodeSubmitted: false,
            isCompleted: false,
            numberOfChances: 0,
            quit: false,
            win: false,
          },
          player2: {
            displayName: null,
            isPlaying: false,
            isActive: false,
            isReady: false,
            isSecretCodeSubmitted: false,
            isCompleted: false,
            numberOfChances: 0,
            quit: false,
            win: false,
          },
        },
        messages: [],
      });
    }
  } catch (error) {
    console.error("Error saving game data:", error);
    throw error;
  }
};

export const getIsActiveStatusForPlayers = async (gameId) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists() && gameDoc.data().players) {
      const player1IsActive = gameDoc.data().players.player1?.isActive || false;
      const player2IsActive = gameDoc.data().players.player2?.isActive || false;

      return { player1IsActive, player2IsActive };
    }

    return { player1IsActive: false, player2IsActive: false }; // Default values if players or isActive are not found in the document
  } catch (error) {
    console.error("Error fetching isActive status for players:", error);
    throw error;
  }
};

export const getPlayerData = async (gameId, playerId) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists() && gameDoc.data().players) {
      const playerData = gameDoc.data().players[playerId];

      if (playerData) {
        return playerData;
      } else {
        throw new Error(`Player ${playerId} not found in game ${gameId}`);
      }
    } else {
      throw new Error(`Game ${gameId} not found or has no player data`);
    }
  } catch (error) {
    console.error("Error fetching player data:", error);
    throw error;
  }
};

export const retrievePlayerData = (gameId) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);

    return gameRef;
  } catch (error) {
    console.error("Error creating player reference:", error);
    throw error;
  }
};

export const fetchIsSceretCodeSubmitted = async (gameId, currentUser) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists() && gameDoc.data().players) {
      const players = gameDoc.data().players;

      // Check if the current user's display name or email matches either player
      const currentPlayerId = Object.keys(players).find((playerId) => {
        const player = players[playerId];
        return (
          (currentUser?.displayName &&
            player.displayName === currentUser.displayName) ||
          (currentUser?.email && player.displayName === currentUser.email)
        );
      });

      if (currentPlayerId) {
        const isSecretCodeSubmiitedValue =
          gameDoc.data().players[currentPlayerId].isSecretCodeSubmitted;
        return isSecretCodeSubmiitedValue;
      } else {
        throw new Error(`Player not found in game ${gameId}`);
      }
    } else {
      throw new Error(`Game ${gameId} not found or has no player data`);
    }
  } catch (error) {
    console.error("Error fetching player data:", error);
    throw error;
  }
};

export const updatePlayerReadyStatus = async (
  gameId,
  currentUser,
  secretCode
) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists() && gameDoc.data().players) {
      const players = gameDoc.data().players;

      // Check if the current user's display name or email matches either player
      const currentPlayerId = Object.keys(players).find((playerId) => {
        const player = players[playerId];
        return (
          (currentUser?.displayName &&
            player.displayName === currentUser.displayName) ||
          (currentUser?.email && player.displayName === currentUser.email)
        );
      });

      if (currentPlayerId) {
        // Update the isReady status for the found player
        await updateDoc(gameRef, {
          [`players.${currentPlayerId}.isReady`]: true,
          [`players.${currentPlayerId}.secretCode`]: secretCode,
          [`players.${currentPlayerId}.isSecretCodeSubmitted`]: true,
        });
      } else {
        console.error("Player not found for the current user in game", gameId);
        // Handle the case where player data is not found
      }
    } else {
      console.error("Game", gameId, "not found or has no player data");
      // Handle the case where the game or player data is not found
    }
  } catch (error) {
    console.error("Error updating player ready status:", error);
    throw error;
  }
};

export const updatePlayerCompleteStatus = async (gameId, player, chances) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists() && gameDoc.data().players) {
      if (player === "player1" || player === "player2") {
        // Update the isPlaying status for the randomly selected player
        await updateDoc(gameRef, {
          [`players.${player}.isCompleted`]: true,
          [`players.${player}.numberOfChances`]: chances,
        });
      } else {
        console.error("Invalid player specified:", player);
        // Handle the case where an invalid player is specified
      }
    } else {
      console.error("Game", gameId, "not found or has no player data");
      // Handle the case where the game or player data is not found
    }
  } catch (error) {
    console.error("Error updating player isCompleted status:", error);
    throw error;
  }
};

export const assignPlay = async (gameId, player) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists() && gameDoc.data().players) {
      if (player === "player1" || player === "player2") {
        // Update the isPlaying status for the randomly selected player
        await updateDoc(gameRef, {
          [`players.${player}.isPlaying`]: true,
          [`players.${
            player === "player1" ? "player2" : "player1"
          }.isPlaying`]: false,
        });
      } else {
        console.error("Invalid player specified:", player);
        // Handle the case where an invalid player is specified
      }
    } else {
      console.error("Game", gameId, "not found or has no player data");
      // Handle the case where the game or player data is not found
    }
  } catch (error) {
    console.error("Error updating player isPlaying status:", error);
    throw error;
  }
};

export const updatePlayerQuitStatus = async (gameId, player) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists() && gameDoc.data().players) {
      if (player === "player1" || player === "player2") {
        // Update the isPlaying status for the randomly selected player
        await updateDoc(gameRef, {
          [`players.${player}.quit`]: true,
        });
      } else {
        console.error("Invalid player specified:", player);
        // Handle the case where an invalid player is specified
      }
    } else {
      console.error("Game", gameId, "not found or has no player data");
      // Handle the case where the game or player data is not found
    }
  } catch (error) {
    console.error("Error updating player quit status:", error);
    throw error;
  }
};

export const updatePlayerWinStatus = async (gameId, player) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists() && gameDoc.data().players) {
      if (player === "player1" || player === "player2") {
        // Update the isPlaying status for the randomly selected player
        await updateDoc(gameRef, {
          [`players.${player}.win`]: true,
        });
      } else {
        console.error("Invalid player specified:", player);
        // Handle the case where an invalid player is specified
      }
    } else {
      console.error("Game", gameId, "not found or has no player data");
      // Handle the case where the game or player data is not found
    }
  } catch (error) {
    console.error("Error updating player quit status:", error);
    throw error;
  }
};

export const saveMultiGameData = async (
  gameId,
  guess,
  cows,
  bulls,
  secretCode,
  playerData
) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);

    // Check if the game document exists
    const gameDoc = await getDoc(gameRef);
    const existingGameData = gameDoc.data();

    const currentPlayerField =
      playerData.displayName === existingGameData.players.player1.displayName
        ? "player1"
        : "player2";

    if (gameDoc.exists()) {
      // If the game document exists, update the data
      await setDoc(
        gameRef,
        {
          players: {
            ...existingGameData.players,
            [currentPlayerField]: {
              ...existingGameData.players[currentPlayerField],
              guesses: [
                ...(existingGameData.players[currentPlayerField].guesses || []),
                { guess, cows, bulls },
              ],
            },
          },
          secretCode,
        },
        { merge: true }
      );
    } else {
      // If the game document doesn't exist, create a new one
      await setDoc(
        gameRef,
        {
          players: {
            ...existingGameData.players,
            [currentPlayerField]: {
              ...existingGameData.players[currentPlayerField],
              guesses: [{ guess, cows, bulls }],
            },
          },
          secretCode,
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error saving game data:", error);
    throw error;
  }
};

export const fetchMultiGuesses = async (gameId, player1Data, player2Data) => {
  try {
    // Determine the player whose guesses to display based on isPlaying
    const currentPlayerField =
      player1Data.isPlaying && player1Data.isReady
        ? "player1"
        : player2Data.isPlaying && player2Data.isReady
        ? "player2"
        : null;

    if (currentPlayerField) {
      const gameRef = doc(db, "Multi_games", gameId);
      const gameDoc = await getDoc(gameRef);

      if (gameDoc.exists()) {
        const existingGameData = gameDoc.data();
        // Check if the guesses field is present before accessing it
        const currentPlayerGuesses =
          existingGameData.players &&
          existingGameData.players[currentPlayerField] &&
          existingGameData.players[currentPlayerField].guesses
            ? existingGameData.players[currentPlayerField].guesses
            : [];

        return currentPlayerGuesses;
      }
    }
  } catch (error) {
    console.error("Error fetching guesses:", error);
  }
};

export const AddChatMessages = async (gameId, currentPlayer, message) => {
  try {
    const gameRef = doc(db, "Multi_games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      const currentMessages = gameDoc.data().messages || [];
      const newMessage = {
        uid: uuidv4(),
        createdAt: new Date(),
        text: message,
        displayName: currentPlayer.displayName,
      };

      const updatedMessages = [...currentMessages, newMessage];

      await updateDoc(gameRef, {
        messages: updatedMessages,
      });
    }
  } catch (error) {
    console.log("Error adding the chat Messages:", error);
  }
};
