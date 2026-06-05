// import { useState, useRef, useEffect } from "react";
// import { Button, Input, Spin, DatePicker, TimePicker } from "antd";
// import { SendOutlined, CloseOutlined } from "@ant-design/icons";
// import { SERVER_URL } from "../../config";
// import image from "../../../public/pic.jpeg";
// import axios from "axios";
// import "./ChatWidget.css";

// export default function ChatWidget() {
//   const widgetId = "ths";
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       text: "Hello, and welcome to TheHypeSociety!\n\nMy name is Charles. Do you need support with any of the following?",
//       sender: "bot",
//       showButtons: false,
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(null);
//   const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
//   const [suggestions, setSuggestions] = useState(["Digital Marketing", "Brand", "Content including UGC", "Website Design"]);
//   const [isMobile, setIsMobile] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [isInitialQuestion, setIsInitialQuestion] = useState(true);

//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

//     // Detect mobile
//     const checkMobile = () => setIsMobile(window.innerWidth <= 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, [messages, loading, showAppointmentPicker]);

//   const handleOpenChat = async () => {
//     setIsOpen(true);
//     window.parent.postMessage({ event: "iframeButtonClick" }, "*");

//     let userIP = "";
//     try {
//       const ipRes = await axios.get("https://api64.ipify.org?format=json");
//       userIP = ipRes.data.ip;
//     } catch (e) {
//       console.error("IP fetch failed", e);
//     }

//     try {
//       await axios.post(`https://widgetsanalytics.vercel.app/api/track-visitor`, {
//         event: "chat_opened",
//         timestamp: new Date().toISOString(),
//         widgetId,
//         ip: userIP,
//       });
//     } catch (error) {
//       console.error("Failed to track visitor:", error);
//     }
//   };

//   function parseLinks(text) {
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     return text.replace(urlRegex, (url) => {
//       return `<a href="${url}" target="_blank" style="color: rgb(237, 0, 141); text-decoration: underline;">${url}</a>`;
//     });
//   }

//   const handleSuggestionClick = (suggestion) => {
//     if (isInitialQuestion) {
//       setIsInitialQuestion(false); // Move past the initial question
//       handleSend(suggestion); // Directly submit the suggestion
//     } else {
//       setInput(suggestion); // Pre-populate the input for subsequent questions
//     }
//   };

//   const handleSend = async (overrideInput = null) => {
//     const messageToSend = overrideInput || input.trim();
//     if (!messageToSend) return;

//     const newMessages = [...messages, { text: messageToSend, sender: "user", showButtons: false }];
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);
//     setSuggestions([]); // Clear suggestions before sending

//     const requestBody = { query: messageToSend };
//     if (sessionId) requestBody.session_id = sessionId;

//     try {
//       const response = await axios.post(`${SERVER_URL}/query`, requestBody);
//       const newMessage = {
//         text: response.data.message,
//         sender: "bot",
//         showButtons: response.data.message.toLowerCase().includes("preferred day"),
//       };
//       setMessages([...newMessages, newMessage]);
//       setSessionId(response.data.session_id);
//       setShowAppointmentPicker(newMessage.showButtons);
//       setSuggestions(response.data.suggestions || []); // Set new suggestions
//     } catch (error) {
//       console.log(error);
//       setMessages([
//         ...newMessages,
//         { text: "Sorry, something went wrong. Please try again.", sender: "bot", showButtons: false },
//       ]);
//       setSuggestions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookAppointment = async (dateObj) => {
//     if (!sessionId || !dateObj || !fullName || !email || !phone) {
//       setMessages([
//         ...messages,
//         { text: "Please provide your full name, email, phone number, and select a date and time for the appointment.", sender: "bot", showButtons: false },
//       ]);
//       setSuggestions([]);
//       return;
//     }

//     setLoading(true);
//     const preferredDay = dateObj.format("YYYY-MM-DD");
//     const preferredTime = dateObj.format("HH:mm");

//     try {
//       const response = await axios.post(`${SERVER_URL}/book_appointment`, {
//         session_id: sessionId,
//         preferred_day: preferredDay,
//         preferred_time: preferredTime,
//         full_name: fullName,
//         email: email,
//         phone: phone,
//       });
//       setMessages([...messages, { text: response.data.message, sender: "bot", showButtons: false }]);
//       setShowAppointmentPicker(false);
//       setSuggestions([]);
//       setFullName("");
//       setEmail("");
//       setPhone("");
//     } catch (error) {
//       const errorMessage = error.response?.data?.detail || "Error booking appointment. Please try again.";
//       setMessages([...messages, { text: errorMessage, sender: "bot", showButtons: false }]);
//       setSuggestions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleConfirm = () => {
//     if (!fullName || !email || !phone || !selectedDate) {
//       setMessages([
//         ...messages,
//         { text: "Please provide your full name, email, phone number, and select a date and time.", sender: "bot", showButtons: false },
//       ]);
//       setSuggestions([]);
//       return;
//     }

//     if (isMobile) {
//       if (!selectedTime) {
//         setMessages([
//           ...messages,
//           { text: "Please select a time for your appointment.", sender: "bot", showButtons: false },
//         ]);
//         setSuggestions([]);
//         return;
//       }
//       const combined = selectedDate.clone().set({
//         hour: selectedTime.hour(),
//         minute: selectedTime.minute(),
//       });
//       handleBookAppointment(combined);
//     } else {
//       handleBookAppointment(selectedDate);
//     }
//   };

//   return (
//     <div className="ai-chat-widget-wrapper">
//       {!isOpen && (
//         <div className="chat-button-container" onClick={handleOpenChat}>
//           <button className="chat-button">
//             <svg className="chat-button-icon" viewBox="64 64 896 896" focusable="false" fill="currentColor">
//               <path d="M464 512a48 48 0 1096 0 48 48 0 10-96 0zm200 0a48 48 0 1096 0 48 48 0 10-96 0zm-400 0a48 48 0 1096 0 48 48 0 10-96 0zm661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.35 444.35 0 00-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.35 445.35 0 00-142 96.5c-40.9 41.3-73 89.3-95.2 142.8-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 00112 714v152a46 46 0 0046 46h152.1A449.4 449.4 0 00510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.48 444.48 0 00142.8-95.2c41.3-40.9 73.8-88.7 96.5-142 23.6-55.2 35.6-113.9 35.9-174.5.3-60.9-11.5-120-34.8-175.6zm-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8 69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9 44.6 18.7 84.6 45.6 119 80 34.3 34.3 61.3 74.4 80 119 19.4 46.2 29.1 95.2 28.9 145.8-.6 99.6-39.7 192.9-110.1 262.7z"></path>
//             </svg>
//             <span className="chat-button-text">How can I help?</span>
//           </button>
//         </div>
//       )}

//       {isOpen && (
//         <div className="chat-popup">
//           <div className="chat-popup-header">
//             <span>Live Chat</span>
//             <CloseOutlined className="chat-popup-close" onClick={() => setIsOpen(false)} />
//           </div>

//           <div className="chat-popup-messages">
//             {messages.map((msg, index) => (
//               <div key={index} className="message-wrapper">
//                 {msg.sender !== "user" && <img className="bot-avatar" src={image} alt="Bot Avatar" />}
//                 <div
//                   className={msg.sender === "user" ? "user-message" : "bot-message"}
//                   dangerouslySetInnerHTML={{ __html: parseLinks(msg.text.replace(/\n/g, "<br />")) }}
//                 />
//               </div>
//             ))}

//             {showAppointmentPicker && (
//               <div className="message-wrapper">
//                 <div className="bot-message date-picker-container">
//                   <div className="appointment-form">
//                     <Input
//                       placeholder="Full Name"
//                       value={fullName}
//                       onChange={(e) => setFullName(e.target.value)}
//                       style={{ marginBottom: 8 }}
//                     />
//                     <Input
//                       placeholder="Email Address"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       style={{ marginBottom: 8 }}
//                     />
//                     <Input
//                       placeholder="Phone Number"
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value)}
//                       style={{ marginBottom: 8 }}
//                     />
//                     {!isMobile ? (
//                       <div>
//                         <DatePicker
//                           showTime
//                           format="YYYY-MM-DD HH:mm"
//                           placeholder="Select date and time"
//                           onChange={(date) => setSelectedDate(date)}
//                           popupClassName="custom-date-picker"
//                         />
//                         <Button
//                           type="primary"
//                           size="small"
//                           onClick={handleConfirm}
//                           style={{ marginTop: 8, width: "100%" }}
//                         >
//                           Confirm
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="mobile-date-time-picker">
//                         <DatePicker
//                           format="YYYY-MM-DD"
//                           placeholder="Select date"
//                           onChange={(date) => setSelectedDate(date)}
//                           popupClassName="custom-date-picker"
//                         />
//                         <TimePicker
//                           format="HH:mm"
//                           placeholder="Select time"
//                           onChange={(time) => setSelectedTime(time)}
//                           popupClassName="custom-date-picker"
//                         />
//                         <Button
//                           type="primary"
//                           size="small"
//                           onClick={handleConfirm}
//                           style={{ marginTop: 8 }}
//                         >
//                           Confirm
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {loading && (
//               <div className="loading-message">
//                 <Spin size="small" />
//                 <span>Thinking...</span>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {suggestions.length > 0 && !loading && !showAppointmentPicker && (
//             <div className="suggestions-container">
//               {suggestions.map((sug, sugIndex) => (
//                 <Button
//                   key={sugIndex}
//                   className="suggestion-button"
//                   onClick={() => handleSuggestionClick(sug)}
//                   disabled={loading || showAppointmentPicker}
//                 >
//                   {sug}
//                 </Button>
//               ))}
//             </div>
//           )}

//           {!isInitialQuestion && !showAppointmentPicker && (
//             <div className="chat-popup-input">
//               <Input
//                 placeholder="Type a message..."
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onPressEnter={() => handleSend()}
//                 disabled={loading}
//               />
//               <Button
//                 shape="circle"
//                 icon={<SendOutlined />}
//                 className="custom-send-button"
//                 onClick={() => handleSend()}
//                 disabled={loading}
//               />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Spin } from "antd";
import { SendOutlined, CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import image from "../../../public/pic.png";

import { SERVER_URL } from "../../config";
import "./ChatWidget.css";

function createSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatWidget() {
  const BOT_LOGO =
    "https://maroon-rat-255818.hostingersite.com/wp-content/uploads/2026/04/Logo-1.png";


  const initialBotMessage = useMemo(
    () => ({
      text:
        "Hello, and welcome to Densmore Insurance Strategies, Inc.\n\nI’m your virtual assistant. I can help with questions about home, auto, renters, business, flood, umbrella, farm, equine, and more.",
      sender: "bot",
    }),
    []
  );

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialBotMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(createSessionId());
  const [suggestions, setSuggestions] = useState([
    "Home Insurance",
    "Auto Insurance",
    "Business Insurance",
    "Renters Insurance",
    "Flood Insurance",
    "Get a Quote",
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleOpenChat = () => {
    setIsOpen(true);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const handleResetChat = async () => {
    const newSessionId = createSessionId();
    setSessionId(newSessionId);
    setMessages([initialBotMessage]);
    setInput("");
    setLoading(false);
    setSuggestions([
      "Home Insurance",
      "Auto Insurance",
      "Business Insurance",
      "Renters Insurance",
      "Flood Insurance",
      "Get a Quote",
    ]);

    try {
      await axios.delete(`${SERVER_URL}/api/chat/${sessionId}`);
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleSend = async (overrideInput = null) => {
    const messageToSend = (overrideInput ?? input).trim();
    if (!messageToSend || loading) return;

    const userMessage = { text: messageToSend, sender: "user" };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setSuggestions([]);

    try {
      const response = await axios.post(`${SERVER_URL}/api/chat`, {
        message: messageToSend,
        sessionId,
      });

      const replyText =
        response.data?.reply ||
        response.data?.message ||
        response.data?.response ||
        "Sorry, I could not generate a response.";

      const assistantMessage = { text: replyText, sender: "bot" };
      const nextMessages = [...updatedMessages, assistantMessage];

      setMessages(nextMessages);

      if (response.data?.sessionId) {
        setSessionId(response.data.sessionId);
      }

      if (Array.isArray(response.data?.suggestions) && response.data.suggestions.length > 0) {
        setSuggestions(response.data.suggestions);
      } else {
        setSuggestions([
          "Home Insurance",
          "Auto Insurance",
          "Business Insurance",
          "Flood Insurance",
          "Get a Quote",
        ]);
      }
    } catch (error) {
      console.error("Chat request failed:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Sorry, something went wrong. Please try again.";

      setMessages([
        ...updatedMessages,
        {
          text: errorMessage,
          sender: "bot",
        },
      ]);

      setSuggestions([
        "Home Insurance",
        "Auto Insurance",
        "Business Insurance",
        "Flood Insurance",
        "Get a Quote",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-chat-widget-wrapper">
      {!isOpen && (
        <div className="chat-button-container">
          <button className="chat-button" onClick={handleOpenChat} type="button">
            <svg className="chat-button-icon" viewBox="64 64 896 896" focusable="false" fill="currentColor">
              <path d="M464 512a48 48 0 1096 0 48 48 0 10-96 0zm200 0a48 48 0 1096 0 48 48 0 10-96 0zm-400 0a48 48 0 1096 0 48 48 0 10-96 0zm661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.35 444.35 0 00-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.35 445.35 0 00-142 96.5c-40.9 41.3-73 89.3-95.2 142.8-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 00112 714v152a46 46 0 0046 46h152.1A449.4 449.4 0 00510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.48 444.48 0 00142.8-95.2c41.3-40.9 73.8-88.7 96.5-142 23.6-55.2 35.6-113.9 35.9-174.5.3-60.9-11.5-120-34.8-175.6zm-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8 69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9 44.6 18.7 84.6 45.6 119 80 34.3 34.3 61.3 74.4 80 119 19.4 46.2 29.1 95.2 28.9 145.8-.6 99.6-39.7 192.9-110.1 262.7z"></path>
            </svg>
            <span className="chat-button-text">How can I help?</span>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="chat-popup">
          <div className="chat-popup-header">
            <div className="chat-header-left">
              <img className="chat-header-logo" src={image} alt="Densmore Insurance" />
              <span>Live Chat</span>
            </div>

            <div className="chat-header-actions">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                className="chat-header-icon-button"
                onClick={handleResetChat}
                aria-label="Reset chat"
              />
              <CloseOutlined className="chat-popup-close" onClick={handleCloseChat} />
            </div>
          </div>

          <div className="chat-popup-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}>
                {msg.sender !== "user" && (
                  <img className="bot-avatar" src={image} alt="Densmore Insurance" />
                )}

                <div className={msg.sender === "user" ? "user-message" : "bot-message"}>
                  {msg.sender === "user" ? (
                    <div className="message-text">{msg.text}</div>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ props }) => (
                          <a {...props} target="_blank" rel="noreferrer noopener" className="chat-link" />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="loading-message">
                <Spin size="small" />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {suggestions.length > 0 && !loading && (
            <div className="suggestions-container">
              {suggestions.map((sug, index) => (
                <Button
                  key={`${sug}-${index}`}
                  className="suggestion-button"
                  onClick={() => handleSuggestionClick(sug)}
                  disabled={loading}
                >
                  {sug}
                </Button>
              ))}
            </div>
          )}

          <div className="chat-popup-input">
            <Input.TextArea
              ref={inputRef}
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
            />
            <Button
              shape="circle"
              icon={<SendOutlined />}
              className="custom-send-button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            />
          </div>
        </div>
      )}
    </div>
  );
}
