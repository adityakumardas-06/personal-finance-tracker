// backend/src/index.js
import 'dotenv/config';
import app from './app.js';
import '../seedUsers.js';  // <-- ye line add ki

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});