import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function DigitSelector({ open, onClose, isSolo, isMulti }) {
  const cancelButtonRef = useRef(null);
  const navigate = useNavigate();

  const handleButtonClick = (digits, isSolo, isMulti) => {
    const gameId = uuidv4();
    if (isSolo) {
      navigate(`/solo/${digits}/${gameId}`);
    } else if (isMulti) {
      navigate(`/multi/${digits}/${gameId}`);
    }
  };

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg primary-white-bg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-max">
                <div className="primary-white-bg px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 primary-brown-text"
                      >
                        Select the Number of Digits you want to Play with?
                      </Dialog.Title>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleButtonClick(3, isSolo, isMulti)}
                          className="button rounded-md w-full px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          3 Digits
                        </button>
                        <button
                          onClick={() => handleButtonClick(4, isSolo, isMulti)}
                          className="button rounded-md w-full px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          4 Digits
                        </button>
                        <button
                          onClick={() => handleButtonClick(5, isSolo, isMulti)}
                          className="button rounded-md w-full px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          5 Digits
                        </button>
                        <button
                          onClick={() => handleButtonClick(6, isSolo, isMulti)}
                          className="button rounded-md w-full px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          6 Digits
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className=" px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md primary-white-bg px-3 py-2 text-sm font-semibold primary-dark-text shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    Cancel
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
