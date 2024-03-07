import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function WinDialogBox({
  open,
  onClose,
  chance,
  isMulti,
  player1 = null,
  player2 = null,
  isQuit,
  currentPlayer = null,
}) {
  const cancelButtonRef = useRef(null);
  const [player, setPlayer] = useState("");
  const [winner, setWinner] = useState("");

  useEffect(() => {
    if (player1 && player2) {
      if (player1.numberOfChances < player2.numberOfChances) {
        setPlayer(
          `${player1.displayName} won the match with ${player1.numberOfChances} number of chances`
        );
        setWinner(player1);
      } else if (player1.numberOfChances > player2.numberOfChances) {
        setPlayer(
          `${player2.displayName} won the match with ${player2.numberOfChances} number of chances`
        );
        setWinner(player2);
      } else {
        setPlayer(`It's a DRAW......You both played well`);
      }
    }
  }, [player1, player2]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={onClose}
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
                <div className="primary-white-text px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    {!isMulti ? (
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <div className="flex w-full justify-center items-center">
                          <img
                            src="/Assets/Mini-Cow-Dancing.gif"
                            alt="Win"
                            style={{
                              width: "150px",
                              height: "150px",
                              paddingBottom: "1rem",
                            }}
                          />
                        </div>
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 primary-light-brown-text"
                        >
                          Yaayyyyy!!!! you have Won in {chance} chances.
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm primary-dark-text">
                            Thank you for playing..... See you next time.
                          </p>
                        </div>
                      </div>
                    ) : isQuit ? (
                      // Render content when isMulti is true and isQuit is true
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <div className="flex w-full justify-center items-center">
                          <img
                            src="/Assets/Mad-cow-throws-phone.gif"
                            alt="Quit"
                            style={{
                              width: "150px",
                              height: "150px",
                              paddingBottom: "1rem",
                            }}
                          />
                        </div>
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 primary-light-brown-text"
                        >
                          The other player has left the game. YOU WIN !!!
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm primary-dark-text">
                            Thank you for playing. See you next time.
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Render content when isMulti is true and isQuit is false
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <div className="flex w-full justify-center items-center">
                          {winner.displayName === currentPlayer.displayName ||
                          winner === "" ? (
                            <img
                              src="/Assets/Mini-Cow-Dancing.gif"
                              alt="Quit"
                              style={{
                                width: "150px",
                                height: "150px",
                                paddingBottom: "1rem",
                              }}
                            />
                          ) : (
                            <img
                              src="/Assets/Bull-picking-nose.gif"
                              alt="Quit"
                              style={{
                                width: "150px",
                                height: "150px",
                                paddingBottom: "1rem",
                              }}
                            />
                          )}
                        </div>
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 primary-light-brown-text"
                        >
                          {player}
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm primary-dark-text">
                            Thank you for playing..... See you next time.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md primary-white-bg px-3 py-2 text-sm font-semibold primary-dark-text shadow-sm ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    Home
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
