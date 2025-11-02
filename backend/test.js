const axios = require("axios");

(async () => {
  try {
    const response = await axios.post("http://localhost:5000/api/ask", {
      question: "What is AI?"
    });
    console.log("✅ Response from TutorAI:\n", response.data);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
})();
