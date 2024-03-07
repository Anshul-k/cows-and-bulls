import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContexts";
import { Navigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import DigitSelector from "../Components/DigitSelector";
import { checkGameExists } from "../firebase/soloplayer";
import MultiSelectDialogBox from "../Components/MultiSelectDialogBox";
import "../style.scss";

function Home() {
  const navigate = useNavigate();
  const { userLoggedIn, currentUser } = useAuth();
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showDigitSelector, setShowDigitSelector] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [showMultiSelector, setShowMultiSelector] = useState(false);

  // Function to get the height of the navbar
  const getNavbarHeight = () => {
    const navbar = document.getElementById("navbar"); // Replace with your actual navbar ID
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight / 16); // Convert to rem units
    }
  };

  // Call getNavbarHeight when the component mounts and when the window is resized
  useEffect(() => {
    getNavbarHeight();
    window.addEventListener("resize", getNavbarHeight);
    return () => {
      window.removeEventListener("resize", getNavbarHeight);
    };
  }, []);

  const playSolo = () => {
    setIsSolo(true);
    checkGameExists(currentUser.uid, navigate, setShowDigitSelector);
  };

  return (
    <div className="primary-white-bg">
      {!userLoggedIn && <Navigate to={"/"} replace={true} />}
      <Navbar />
      <DigitSelector
        open={showDigitSelector}
        onClose={() => setShowDigitSelector(false)}
        isSolo={isSolo}
      />
      <MultiSelectDialogBox
        open={showMultiSelector}
        onClose={() => setShowMultiSelector(false)}
        setShowMultiSelector={setShowMultiSelector}
      />
      <div
        style={{ paddingTop: `${navbarHeight + 2}rem` }}
        className="relative isolate overflow-hidden px-6 pt-12 sm:pb-2 sm:py-14 lg:overflow-visible lg:px-0"
      >
        <div className="mx-auto grid max-w-full grid-cols-1 gap-x-8 gap-y-10 lg:mx-0 lg:items-start lg:gap-y-10">
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:gap-x-8 lg:px-8">
            <div className="lg:pr-4">
              <div className="lg:max-w-full">
                <h1 className="flex gap-3 mt-2 mb-12 text-3xl font-bold tracking-tight primary-brown-text sm:text-4xl">
                  Welcome to Cows and Bulls!
                  <img
                    src="/Assets/Ox-red.gif"
                    alt="Ox"
                    className="red-ox"
                    style={{
                      width: "40px",
                      height: "40px",
                    }}
                  />
                </h1>
                <ul className="mt-8 sm:px-12 primary-dark-text lg:max-w-full flex justify-between flex-col lg:flex-row lg:space-x-8">
                  <li className="flex mb-4 items-center justify-center flex-col border-4 primary-beige-bg rounded-3xl border-yellow-800 p-4 sm:p-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-12 h-12 mb-2 primary-brown-text"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span className="flex flex-col items-center justify-center">
                      <button
                        onClick={() => playSolo()}
                        className="rounded-md mb-2 button max-w-max px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Play Solo
                      </button>
                      <p className="primary-dark-text text-center">
                        Embark on a solo journey and test your skills
                      </p>
                    </span>
                  </li>
                  <li className="flex mb-4 items-center justify-center flex-col border-4 primary-beige-bg rounded-3xl border-yellow-800 p-4 sm:p-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-12 h-12 mb-2 primary-brown-text"
                    >
                      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                    </svg>

                    <span className="flex flex-col items-center justify-center">
                      <button
                        onClick={() => setShowMultiSelector(true)}
                        className="rounded-md mb-2 button max-w-max px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Play with a Friend
                      </button>
                      <p className="primary-dark-text text-center">
                        Challenge your friends in a battle of wits!
                      </p>
                    </span>
                  </li>
                  <li className="flex mb-4 items-center justify-center flex-col border-4 primary-beige-bg rounded-3xl border-yellow-800 p-4 sm:p-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-12 h-12 mb-2 primary-brown-text"
                    >
                      <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
                      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                    </svg>

                    <span className="flex flex-col items-center justify-center">
                      <button
                        onClick={() => {
                          navigate("/rules");
                        }}
                        className="rounded-md mb-2 button max-w-max px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Rules
                      </button>
                      <p className="primary-dark-text text-center">
                        Check out the rules of game in detail
                      </p>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:gap-x-8 lg:px-8">
            <div className="lg:pr-4">
              <p className="mt-6 text-xl leading-8 primary-dark-text mb-4 font-medium">
                How to Play:
              </p>
              <div className="max-w-3xl text-base leading-7 text-gray-700 lg:max-w-full">
                <p className="text-lg font-bold leading-7 primary-light-brown-text">
                  Objective
                </p>
                <p className="primary-dark-text">
                  Cows and Bulls is a classic guessing game where your objective
                  is to discover a secret number. Each digit must be unique, and
                  the game provides feedback on your guesses in the form of
                  "Cows" and "Bulls."
                </p>
                <ul className="list-disc pl-5 mt-4 primary-dark-text">
                  <li>
                    Cows: The number of correct digits in the wrong position.
                  </li>
                  <li>
                    Bulls: The number of correct digits in the correct position.
                  </li>
                </ul>
                <p className="text-lg font-bold leading-7 primary-light-brown-text mt-6">
                  Rules
                </p>
                <ol className="list-decimal pl-5 mt-1">
                  <li className="font-bold primary-green-text">
                    Guess the Number:
                  </li>
                  <p className="primary-dark-text">
                    Enter the number and submit your guess. The game will
                    provide feedback to help you refine your next guess.
                  </p>
                  <li className="font-bold primary-green-text">Feedback:</li>
                  <p className="primary-dark-text">
                    Pay attention to the Cows and Bulls feedback after each
                    guess. Use this information strategically to narrow down the
                    possibilities.
                  </p>
                  <li className="font-bold primary-green-text">Winning:</li>
                  <p className="primary-dark-text">
                    Achieve a perfect guess with four Bulls to win the game!
                    Challenge yourself to improve your guessing skills.
                  </p>
                </ol>
                <p className="text-lg font-bold leading-7 primary-light-brown-text mt-6">
                  Tips:
                </p>
                <ul className="list-disc pl-5 mt-1 primary-dark-text">
                  <li>
                    Start by making random guesses to understand the feedback.
                  </li>
                  <li>
                    Use the feedback to eliminate incorrect digits and
                    positions.
                  </li>
                  <li>
                    Hone your strategy to find the secret number in the fewest
                    guesses possible.
                  </li>
                </ul>
                <p className="mt-6 primary-dark-text">
                  Now that you know the rules, click on "Play Solo" or "Play
                  with a Friend" to start your Cows and Bulls adventure. May
                  your guesses be spot on!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <img
        src="/Assets/Running-cow.gif"
        alt="Running Cow"
        className="moving-cow"
        style={{
          width: "65px",
          height: "65px",
        }}
      />
      <footer className="primary-brown-bg primary-white-text py-4 text-center">
        <p>
          anshul.kasana98@gmail.com &copy; {new Date().getFullYear()} All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
export default Home;
