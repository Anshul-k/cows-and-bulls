import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContexts";
import { Navigate } from "react-router-dom";
import "../style.scss";

function LandingPage() {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
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
    <div className="flex flex-col h-screen bg-cows-and-bulls">
      {userLoggedIn && <Navigate to={"/home"} replace={true} />}
      <Navbar />
      <div
        className="relative flex-1 isolate px-4 py-14 sm:px-6 sm:py-0 lg:px-8"
        style={{ paddingTop: `${navbarHeight}rem` }}
      >
        <div className="w-full h-full flex justify-center items-center">
          <div className="mx-auto max-w-4xl py-4 sm:py-24 lg:py-32">
            {/* Left bottom image */}
            <img
              src="/Assets/Corn-grass.gif"
              alt="Left"
              className="absolute left-0 bottom-0"
              style={{ width: "100px", height: "100px" }}
            />
            {/* Right bottom image */}
            <img
              src="/Assets/Corn-grass.gif"
              alt="Right"
              className="absolute right-0 bottom-0"
              style={{
                width: "100px",
                height: "100px",
                transform: "scaleX(-1)",
              }}
            />
            {/* Moving tractor */}
            <img
              src="/Assets/Moving-tractor.gif"
              alt="Tractor"
              className="moving-tractor"
              style={{
                width: "100px",
                height: "100px",
              }}
            />
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Cows and Bulls
              </h1>
              <p className="mt-3 sm:mt-6 text-md sm:text-lg leading-8 primary-white-text">
                Welcome to the exciting world of Cows and Bulls! This classic
                code-breaking game challenges your strategic thinking and
                deduction skills. Play against friends or test your own wits as
                you attempt to crack the hidden code. Make careful guesses,
                decode the feedback of 'cows' and 'bulls,' and race against the
                clock to uncover the secret combination. With its simple rules
                Cows and Bulls is the perfect game to sharpen your mind and have
                a blast with friends.
              </p>
              <p className="mt-3 sm:mt-6 text-md sm:text-lg leading-8 primary-white-text">
                Ready for a quick mental workout? Play now
              </p>
              <div className="mt-4 sm:mt-8 flex items-center justify-center gap-x-6">
                <button
                  onClick={() => {
                    navigate("/login");
                  }}
                  className="rounded-md button px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Let's Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
