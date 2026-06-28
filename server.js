const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { errorHandler } = require('./errorHandler');

dotenv.config();

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => { console.error(err); process.exit(1); });

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));

app.use('/api/tasks', require('./tasks'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
