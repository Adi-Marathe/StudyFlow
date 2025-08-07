import react from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./Chatbot.css";
import Navbar from "../../Components/Navbar/Navbar";
import Aibot from "../../Components/Aibot/Aibot";

function Chatbot() {
  return (
    <>
      <div className="chatbot-container">
        <Sidebar />

        <div className="chatbot-content-wrapper">
          <Navbar />
          <main className="chatbot-main">
            <div>
                <Aibot />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Chatbot;
