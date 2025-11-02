async function askTutorAI() {
  const question = document.getElementById("chat-input").value;
  const chatBox = document.getElementById("chat-messages");

  if (!question.trim()) return;

  // Add user message
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = question;
  chatBox.appendChild(userMsg);

  // Add loading text
  const aiMsg = document.createElement("div");
  aiMsg.className = "message ai";
  aiMsg.textContent = "Thinking...";
  chatBox.appendChild(aiMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById("chat-input").value = "";

  try {
    const response = await fetch("https://tutorai-backend-a4la.onrender.com/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();
    aiMsg.textContent = data.answer;
  } catch (error) {
    aiMsg.textContent = "Error: Could not connect to TutorAI.";
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("send-button").addEventListener("click", askTutorAI);
document.getElementById("chat-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") askTutorAI();
});
