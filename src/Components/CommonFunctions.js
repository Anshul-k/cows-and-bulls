export const generateSecretCode = (length) => {
  // Generate a static secret code for the game without repeating digits
  const digits = Array.from({ length: 10 }, (_, i) => i.toString()); // Array [0, 1, 2, ..., 9]
  const shuffledDigits = [...digits].sort(() => Math.random() - 0.5); // Shuffle the array
  return shuffledDigits.slice(0, length).join("");
};

export const calculateCowsAndBulls = (guess, secretCode) => {
  let cows = 0;
  let bulls = 0;

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secretCode[i]) {
      bulls++;
    } else if (secretCode.includes(guess[i])) {
      cows++;
    }
  }

  return { cows, bulls };
};
