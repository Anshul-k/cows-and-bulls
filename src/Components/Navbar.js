import { Fragment, useState, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContexts";
import { doSignOut } from "../firebase/auth";
import { useMedia } from "react-use";
import "../style.scss";
import DigitSelector from "../Components/DigitSelector";
import MultiSelectDialogBox from "../Components/MultiSelectDialogBox";
import { checkGameExists } from "../firebase/storage";

const navigation = [
  { name: "Play Solo", link: "#", current: false },
  { name: "Play With a Friend", link: "#", current: false },
  { name: "Rules", link: "rules", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const getRandomNumber = () => {
  const letters = "0123456789";
  let Number = "";
  for (let i = 0; i < 6; i++) {
    Number += letters[Math.floor(Math.random() * 16)];
  }
  return Number;
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

export default function Navbar() {
  const navigate = useNavigate();
  const { userLoggedIn, currentUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarBackgroundColor, setAvatarBackgroundColor] = useState("");
  const [showDigitSelector, setShowDigitSelector] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [showMultiSelector, setShowMultiSelector] = useState(false);

  const isDesktop = useMedia("(min-width: 768px)");

  const playSolo = () => {
    setIsSolo(true);
    checkGameExists(currentUser.uid, navigate, setShowDigitSelector);
  };

  useEffect(() => {
    // Check the user's authentication method and set the avatar accordingly
    if (currentUser && currentUser.email) {
      // Set avatar based on the first two letters of the email address
      const userEmail = currentUser.email;
      setAvatarUrl(`https://robohash.org/${userEmail.substring(0, 2)}`);
    } else if (currentUser && currentUser.displayName) {
      // Set a default avatar using the first letters of the first and last name
      const nameArray = currentUser.displayName.split(" ");
      const firstName = nameArray[0];
      const lastName = nameArray.slice(1).join(" ");
      setAvatarUrl(`https://robohash.org/${firstName[0]}${lastName[0]}`);
    } else {
      // Set a default avatar if neither image, displayName nor email is available
      setAvatarUrl(`https://robohash.org/${getRandomNumber()}`);
    }

    // Set a random background color
    setAvatarBackgroundColor(getRandomColor());
  }, [currentUser]); // Run this effect only once on component mount

  const handleNavigationLink = (item) => {
    if (item.name === "Play Solo") {
      playSolo();
    } else if (item.name === "Play With a Friend") {
      setShowMultiSelector(true);
    } else {
      navigate(`/${item.link}`);
    }
  };

  return (
    <Disclosure
      as="nav"
      className="fixed w-full z-10 NavBackground"
      id="navbar"
    >
      {({ open }) => (
        <>
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
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                {currentUser && (
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 primary-brown-text focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                )}
              </div>
              {currentUser ? (
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <button
                    onClick={() => navigate("/home")}
                    className="flex flex-shrink-0 items-center"
                  >
                    <img
                      className="h-14 w-auto"
                      src="/Assets/Cows_and_Bulls_logo-transparent.png"
                      alt="Cows and Bulls Logo"
                    />
                  </button>
                  {currentUser && (
                    <div className="hidden sm:ml-6 sm:block">
                      <div className="flex items-center h-full gap-1 space-x-4">
                        {navigation.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleNavigationLink(item)}
                            className="Navbutton rounded-md px-3 py-2 text-sm font-medium"
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/")}
                  className="flex flex-1 items-center justify-center"
                >
                  <img
                    className="h-14 w-auto"
                    src="/Assets/Cows_and_Bulls_logo-transparent.png"
                    alt="Cows and Bulls Logo"
                  />
                </button>
              )}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {currentUser && (
                  <div className="primary-brown-text font-bold">
                    {isDesktop
                      ? currentUser.displayName
                        ? currentUser.displayName
                        : currentUser.email
                      : currentUser.displayName
                      ? `${currentUser.displayName.charAt(
                          0
                        )}${currentUser.displayName.split(" ")[1].charAt(0)}`
                      : currentUser.email.substring(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Profile dropdown */}
                {currentUser && (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button
                        className={`relative flex rounded-full bg-${avatarBackgroundColor}-300 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-${avatarBackgroundColor}-800`}
                      >
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={avatarUrl}
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md primary-white-bg py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {userLoggedIn
                            ? ({ active }) => (
                                <button
                                  onClick={() => {
                                    doSignOut().then(() => {
                                      navigate("/");
                                    });
                                  }}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 w-full text-left text-sm primary-dark-text font-medium"
                                  )}
                                >
                                  Logout
                                </button>
                              )
                            : null}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  onClick={() => handleNavigationLink(item)}
                  className="Navbutton block rounded-md px-3 py-2 text-base font-medium"
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
