import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";

function Rules() {
  const [navbarHeight, setNavbarHeight] = useState(0);

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

  return (
    <div className="primary-white-bg">
      <Navbar />
      <div
        style={{ paddingTop: `${navbarHeight + 2}rem` }}
        className="container mx-auto px-6 pt-12 sm:pb-0 sm:py-14"
      >
        <h1 className="text-3xl font-bold mb-6 primary-brown-text">
          Cows and Bulls Game Rules
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 primary-light-brown-text">
            Solo Player Mode:
          </h2>
          <ol className="list-decimal ml-6">
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Number Selection:
              </h3>
              <ul className="list-disc ml-6 primary-dark-text">
                <li>
                  Choose a difficulty level by selecting the number of digits
                  (3, 4, 5, or 6).
                </li>
                <li>
                  The computer generates a random hidden number based on the
                  chosen difficulty.
                </li>
              </ul>
            </li>
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Guessing:
              </h3>
              <ul className="list-disc ml-6 primary-dark-text">
                <li>
                  Make guesses by inputting numbers into the designated area.
                </li>
                <li>
                  After each guess, the game provides feedback in the form of
                  "cows" and "bulls."
                </li>
              </ul>
            </li>
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Feedback:
              </h3>
              <ul className="list-disc ml-6 primary-dark-text">
                <li>
                  A "cow" represents a correct digit in the wrong position.
                </li>
                <li>
                  A "bull" represents a correct digit in the correct position.
                </li>
              </ul>
            </li>
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Objective:
              </h3>
              <p className="primary-dark-text">
                Continue guessing until the hidden number is completely revealed
                (all bulls) or until the maximum number of attempts is reached.
              </p>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 primary-light-brown-text">
            Multiplayer Mode:
          </h2>
          <ol className="list-decimal ml-6">
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Number Selection:
              </h3>
              <ul className="list-disc ml-6 primary-dark-text">
                <li>
                  Players take turns being the code maker or code breaker.
                </li>
                <li>
                  The code maker selects a number, and the code breaker tries to
                  guess it.
                </li>
              </ul>
            </li>
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Turn-Based Play:
              </h3>
              <ul className="list-disc ml-6 primary-dark-text">
                <li>
                  Players alternate between being the code maker and code
                  breaker.
                </li>
                <li>
                  The code breaker receives feedback after each guess, just like
                  in solo mode.
                </li>
              </ul>
            </li>
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Objective:
              </h3>
              <p className="primary-dark-text">
                In multiplayer mode, the goal is to break the opponent's code in
                fewer attempts than they break yours.
              </p>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 primary-light-brown-text">
            Draft:
          </h2>
          <ul className="list-disc ml-6">
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Click Once ("Not Present"):
              </h3>
              <p className="primary-dark-text">
                Use a single click to mark a number as not present in the hidden
                code. This helps in narrowing down the possibilities for
                subsequent guesses.
              </p>
            </li>
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Click Twice ("Present"):
              </h3>
              <p className="primary-dark-text">
                Double-click on a number to mark it as present in the correct
                position of the hidden code. This provides crucial information
                for refining further guesses.
              </p>
            </li>
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Click Thrice (Clear Markings):
              </h3>
              <p className="primary-dark-text">
                Triple-click on a number to clear any markings, allowing players
                to reset and reevaluate their deductions as needed.
              </p>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 primary-light-brown-text">
            Hint:
          </h2>
          <ul className="list-disc ml-6">
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Usage Limit:
              </h3>
              <p className="primary-dark-text">
                Players can use the hint button only once during the entire
                game, so it should be employed wisely.
              </p>
            </li>
            <li>
              <h3 className="font-semibold mb-2 primary-green-text">
                Functionality:
              </h3>
              <p className="primary-dark-text">
                The hint button offers a clue by revealing one digit in the
                correct position of the hidden code. Players can strategically
                use this information to make more informed guesses.
              </p>
            </li>
          </ul>
        </section>
      </div>
      <img
        src="/Assets/Running-cow.gif"
        alt="Tractor"
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

export default Rules;
