import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import DigitSelector from "./DigitSelector";

export default function MultiSelectDialogBox({
  open,
  onClose,
  setShowMultiSelector,
}) {
  const [showDigitSelector, setShowDigitSelector] = useState(false);
  const cancelButtonRef = useRef(null);
  const [link, setLink] = useState(""); // State to store the entered link
  const navigate = useNavigate();

  const handleMultiSelect = () => {
    setShowDigitSelector(true);
    setShowMultiSelector(false);
  };

  const handleLinkInputChange = (event) => {
    // Update the link state when the user types in the input field
    setLink(event.target.value);
  };

  const handleInputKeyPress = (event) => {
    // If the user presses Enter, redirect to the entered link
    if (event.key === "Enter") {
      const url = new URL(link);
      const path = url.pathname;
      navigate(path);
    }
  };

  return (
    <div>
      <DigitSelector
        open={showDigitSelector}
        onClose={() => setShowDigitSelector(false)}
        isMulti={true}
      />
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
                  <div className="primary-white-bg px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start w-full">
                      <div className="mt-3 text-center items-center w-full sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base text-center font-semibold leading-6 primary-brown-text"
                        >
                          Create a New room
                        </Dialog.Title>
                        <button
                          onClick={handleMultiSelect}
                          className="button rounded-md mt-2 w-full text-center px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-base m-4 text-center font-semibold leading-6 primary-brown-text"
                    >
                      OR
                    </Dialog.Title>
                    <div className="sm:flex sm:items-start">
                      <form className="mt-3 text-center w-full sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base text-center font-semibold leading-6 primary-brown-text"
                        >
                          Join an already Exisiting room
                        </Dialog.Title>
                        <input
                          type="text"
                          name="price"
                          className="block mt-2 w-full rounded-md border-0 py-1.5 pl-7 pr-20 primary-dark-text ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="Enter the link"
                          value={link}
                          onChange={handleLinkInputChange}
                          onKeyPress={handleInputKeyPress}
                        />
                      </form>
                    </div>
                  </div>
                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
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
    </div>
  );
}
