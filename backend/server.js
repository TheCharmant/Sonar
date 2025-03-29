import dotenv from "dotenv";
import app from "./src/app.js";
import "./src/config/oauth.js"; // ✅ Ensure OAuth is initialized

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
