import React, { useState, useEffect } from "react";
import { AddChatMessages, retrievePlayerData } from "../firebase/multiplayer";
import { onSnapshot } from "firebase/firestore";

function ChatComponent({ gameId, currentPlayer }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setinputValue] = useState("");
  const [showChatIcon, setShowChatIcon] = useState(true);
  const [messagesCount, setMessagesCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      setinputValue("");
      await AddChatMessages(gameId, currentPlayer, inputValue);
    }
  };

  const handleIconButton = () => {
    setShowChatIcon(!showChatIcon);
    setUnreadMessagesCount(0);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const messageRef = retrievePlayerData(gameId);

      // Set up real-time listener for player1 and Player2 data and set CurrentPlayer data
      const messageUnsubscribe = onSnapshot(messageRef, async (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.data().messages;
          if (showChatIcon) {
            const newMessageNumber = messagesData.length - messagesCount;
            setUnreadMessagesCount(newMessageNumber);
          } else {
            setUnreadMessagesCount(0);
          }
          setMessages(messagesData);
          setMessagesCount(messagesData.length);
        } else {
          console.error(`Player document does not exist in game ${gameId}`);
        }
      });

      return () => {
        // Cleanup the real-time listeners when the component is unmounted
        messageUnsubscribe();
      };
    };

    fetchMessages();
  }, [gameId, showChatIcon, messagesCount]);

  return (
    <div>
      {showChatIcon ? (
        <button
          className="absolute bottom-20 right-4 lg:right-10"
          onClick={handleIconButton}
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-12 h-12 primary-brown-text"
              style={{ transform: "scaleX(-1)" }} // Add this line to invert horizontally
            >
              <path
                fillRule="evenodd"
                d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
                clipRule="evenodd"
              />
            </svg>
            {unreadMessagesCount > 0 && (
              <div className="bg-red-600 primary-white-text rounded-full w-6 h-6 absolute top-0 right-0 -mt-2 -mr-2 flex items-center justify-center">
                {unreadMessagesCount}
              </div>
            )}
          </div>
        </button>
      ) : (
        <div className="fixed bottom-20 right-10 w-72 primary-white-bg p-4 rounded shadow-md">
          <div className="flex">
            <div className="flex w-full justify-between">
              <div className="font-bold text-lg mb-2 primary-brown-text">
                Chat
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowChatIcon(!showChatIcon)}
              >
                <svg
                  className="w-6 h-6 primary-brown-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="h-48 overflow-y-auto mb-2 flex flex-col-reverse">
            {messages &&
              messages
                .slice()
                .reverse()
                .map((message) => (
                  <div key={message.uid}>
                    {message.displayName === currentPlayer.displayName ? (
                      <div className="flex w-full justify-end">
                        <div className="rounded-tl-lg rounded-tr-lg rounded-bl-lg primary-light-brown-bg p-2 text-white mb-2 w-fit">
                          {message.text}
                        </div>
                      </div>
                    ) : (
                      <div className="flex w-full justify-start">
                        <div className="rounded-bl-lg rounded-br-lg rounded-tr-lg primary-beige-bg p-2 mb-2 w-fit">
                          {message.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
          </div>
          <form className="flex" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message"
              value={inputValue}
              onChange={(e) => setinputValue(e.target.value)}
              className="flex-grow p-2 mr-2 border-2 border-yellow-800 rounded"
            />
            <button type="submit" className="button p-2 rounded">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatComponent;
