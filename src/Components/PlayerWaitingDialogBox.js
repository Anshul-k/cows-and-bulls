import { Fragment, useRef, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useLocation } from "react-router-dom";
import { getIsActiveStatusForPlayers } from "../firebase/multiplayer";

export default function PlayerWaitingDialogBox({ open, onClose, gameId }) {
  const cancelButtonRef = useRef(null);
  const location = useLocation();
  const [currentLink, setCurrentLink] = useState("");
  const [initialCheckCompleted, setInitialCheckCompleted] = useState(false);
  const [shouldRenderDialog, setShouldRenderDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Update the link whenever the location changes
    setCurrentLink(window.location.href);
  }, [location]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentLink);
      setIsCopied(true);
      // Reset the copied state after a few seconds (e.g., 3 seconds)
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      console.error("Error copying link to clipboard:", error);
    }
  };

  const handleDialogClose = () => {
    // You can customize this condition based on your requirements
    if (!initialCheckCompleted) {
      // Don't close the dialog when the initial check is not completed
      return;
    }

    onClose();
  };

  useEffect(() => {
    const checkIsActiveStatus = async () => {
      try {
        const { player1IsActive, player2IsActive } =
          await getIsActiveStatusForPlayers(gameId);

        if (player1IsActive && player2IsActive) {
          onClose();
        } else {
          // If not both players aren't active, wait for a few milliseconds and check again
          setTimeout(checkIsActiveStatus, 1000);
          setShouldRenderDialog(true);
        }
      } catch (error) {
        console.error("Error getting isActive status:", error);
      }
    };

    // Only perform the initial check if it hasn't been completed yet
    if (!initialCheckCompleted) {
      checkIsActiveStatus();
      setInitialCheckCompleted(true);
    }
  }, [gameId, onClose, initialCheckCompleted]);

  if (!shouldRenderDialog) {
    return null; // Do not render the dialog if both players are already active
  }

  return (
    <div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={handleDialogClose}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg primary-white-bg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="primary-white-bg px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start w-full">
                      <div className="mt-3 text-center items-center w-full sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base text-center font-semibold leading-6 primary-light-brown-text"
                        >
                          Waiting for the other player to join......
                        </Dialog.Title>
                        <div className="mt-4">
                          <input
                            type="text"
                            readOnly
                            value={currentLink}
                            className="w-full border p-2 rounded"
                          />
                          <button
                            className={`mt-2 ${
                              isCopied
                                ? "bg-green-500 primary-white-text"
                                : "button"
                            } px-4 py-2 rounded`}
                            onClick={handleCopyLink}
                          >
                            {isCopied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
