import { useState, useEffect, useRef } from "react";
import axios from "axios";
import send from "./assets/send.svg";
import user from "./assets/user.png";
import bot from "./assets/bot.png";
import loadingIcon from "./assets/loader.svg";
import { FaMicrophone } from "react-icons/fa6";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { IoCopySharp } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [input, setInput] = useState("");
  const [posts, setPosts] = useState([]);
  const [botTyping, setBotTyping] = useState(false);
  const [history, setHistory] = useState([]);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();


  useEffect(() => {
    // Helps in scrolling down while the bot is styping
    document.querySelector(".layout").scrollTop =
      document.querySelector(".layout").scrollHeight;

  }, [posts]);

  // import.meta.env.VITE_BACKEND_API
  const fetchBotResponse = async () => {

    const { data } = await axios.post(
      import.meta.env.VITE_BACKEND_API,
      { input, history },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Sending the response and setting conversationHistory to my state so it holds the entire history of the user's current chat session and send the history back to the backend server when user asks another question
    const { response, conversationHistory } = data;
    setHistory(conversationHistory);
    return response;
  };

  const autoTypingBotResponse = (text) => {
    let index = 0;
    let interval = setInterval(() => {
      if (index < text.length) {
        setPosts((prevState) => {
          let lastItem = prevState.pop();
          if (lastItem.type !== "bot") {
            prevState.push({
              type: "bot",
              post: text.charAt(index - 1),
            });
          } else {
            prevState.push({
              type: "bot",
              post: lastItem.post + text.charAt(index - 1),
            });
          }
          return [...prevState];
        });
        index++;
      } else {
        clearInterval(interval);
        setBotTyping(false);
      }
    }, 5);
  };

  const onSubmit = () => {
    SpeechRecognition.stopListening();
    resetTranscript();


    if (input.trim() === "") return;
    if (botTyping) return;
    updatePosts(input);
    updatePosts("loading...", false, true);
    setInput("");
    setBotTyping(true);
    fetchBotResponse().then((res) => {
      updatePosts(res, true);
    });
  };

  const updatePosts = (post, isBot, isLoading) => {
    if (isBot) {
      autoTypingBotResponse(post);
    } else {
      setPosts((prevState) => {
        return [
          ...prevState,
          {
            type: isLoading ? "loading" : "user",
            post,
          },
        ];
      });
    }
  };

  const onKeyUp = (e) => {
    if (e.key === "Enter" || e.which === 13) {
      onSubmit();
    }
  };



  const focusInputElement = useRef();

  const speechToText = () => {

    if (!browserSupportsSpeechRecognition) {
      return alert("This browser doesn't support speech regonition")
    }

    SpeechRecognition.startListening({ continuous: true })

    console.log(listening ? "on" : "off");

    setInput(transcript);


  }

  useEffect(() => {
    if (listening) {
      speechToText();
    }
    else {
      resetTranscript();
    }
  }, [transcript, listening])

  // Helps in scrolling the input element while user speaks
  useEffect(() => {
    // below commented out one wasn't working for mobile devices
    // focusInputElement.current.scrollTo({ left: focusInputElement.current.scrollWidth, behavior: "smooth" });
    focusInputElement.current.scrollLeft += focusInputElement.current.scrollWidth;
  }, [input])




  const copyText = (postId) => {
    posts.map((post, i) => {
      if (i === postId) {
        toast('Text Copied', { theme: "dark", autoClose: 1000 });
        navigator.clipboard.writeText(post.post)
      }
    })
  }


  return (
    <main className="chatGPT-app">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 className="chat-heading"><span>Chattifyy</span> AI</h2>
        <span style={{ fontSize: 12, color: "white", marginLeft: 100, fontWeight: "bold" }}> Powered By GPT 3.5</span>
      </div>
      <section className="chat-container">
        <div className="layout">
          {posts.map((post, index) => (
            <div
              key={index}
              className={`chat-bubble ${post.type === "bot" || post.type === "loading" ? "bot" : ""
                }`}
            >
              <div className="avatar">
                <img
                  src={
                    post.type === "bot" || post.type === "loading" ? bot : user
                  }
                />
              </div>
              {post.type === "loading" ? (
                <div className="loader">
                  <img src={loadingIcon} />
                </div>
              ) : (
                <div className="post">
                  {post.type === "bot" ? (
                    <div style={{ display: "flex", gap: 0, flexDirection: "column", justifyContent: "space-between" }}>
                      {post.post.length > 100 && (
                        <div id="copy" onClick={() => copyText(index)}>
                          <IoCopySharp style={{ cursor: "pointer", minWidth: 15 }} />
                        </div>
                      )}
                      {post.post}
                    </div>
                  ) : (
                    <div>{post.post}</div>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      <footer>
        <input
          className="composebar"
          value={input}
          autoFocus
          type="text"
          placeholder="Ask me anything!"
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={onKeyUp}
          ref={focusInputElement}
        />
        {botTyping ? (
          <div
            className="send-button-disabled"
            style={{ opacity: 0.5 }}
            onClick={onSubmit}
          >
            <img src={send} />
          </div>
        ) : (
          <div style={{ margin: "0px 10px", display: "flex", alignItems: "center", gap: 10 }}>
            {listening ? (
              <FaMicrophone style={{ fontSize: 25, cursor: "pointer", color: "#4157F7" }} onClick={async () => { await SpeechRecognition.stopListening() }} />
            ) : (
              <FaMicrophone style={{ fontSize: 25, cursor: "pointer" }} onClick={speechToText} />
            )}
            <div className="send-button" onClick={onSubmit}>
              <img src={send} />
            </div>
          </div>

        )}
      </footer>
      <ToastContainer />
    </main>
  );
}

export default App;
