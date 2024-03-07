import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
  // add user to firestore
};

export const doSignOut = () => {
  return auth.signOut();
};

export const isEmailAlreadyRegistered = async (email) => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return signInMethods.length > 0; // If length is greater than 0, email is already registered
  } catch (error) {
    // Handle the error as needed
    console.error("Error checking email registration:", error);
    return false;
  }
};

// export const doDeleteAccount = async (password) => {
//   try {
//     const user = auth.currentUser;

//     // Re-authenticate the user before deleting the account
//     const credential = EmailAuthProvider.credential(user.email, password);
//     await reauthenticateWithCredential(user, credential);

//     // Delete the user account
//     await user.delete();

//     return true; // Account deletion successful
//   } catch (error) {
//     // Handle the error as needed
//     console.error("Error deleting account:", error);
//     return false; // Account deletion failed
//   }
// };

// export const doPasswordReset = (email) => {
//   return sendPasswordResetEmail(auth, email);
// };

// export const doPasswordChange = (password) => {
//   return updatePassword(auth.currentUser, password);
// };

// export const doSendEmailVerification = () => {
//   return sendEmailVerification(auth.currentUser, {
//     url: `${window.location.origin}/home`,
//   });
// };
