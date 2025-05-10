import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

import app from './src/app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
