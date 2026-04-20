import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect directly to your local MongoDB Server!
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/root-kuttu'; 

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to your local MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Soil Details Schema & Model
const soilSchema = new mongoose.Schema({
  nitrogen: { type: Number, required: true },
  phosphorus: { type: Number, required: true },
  potassium: { type: Number, required: true },
  ph: { type: Number, required: true },
  location: { type: String, required: true },
  season: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const SoilDetail = mongoose.model('SoilDetail', soilSchema);

// Community Post Schema & Model
const postSchema = new mongoose.Schema({
  author: String,
  location: String,
  user_email: String,
  content: String,
  category: String,
  likes: [String],
  replies: [{ author: String, content: String, date: { type: Date, default: Date.now } }],
  date: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// Expense Schema & Model
const expenseSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['expense', 'income'], required: true },
  date: { type: String, required: true }, // Using string for simple date comparison from frontend
  createdAt: { type: Date, default: Date.now }
});

const Expense = mongoose.model('Expense', expenseSchema);

// ---- API Routes ----

// Get all expenses for a user
app.get('/api/expenses/:email', async (req, res) => {
  try {
    const expenses = await Expense.find({ user_email: req.params.email }).sort({ date: -1, createdAt: -1 });
    res.status(200).json(expenses.map(e => ({
      ...e.toObject(),
      id: e._id // Map _id to id for frontend compatibility
    })));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching expenses', error: err.message });
  }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { user_email, category, description, amount, type, date } = req.body;
    const newExpense = new Expense({ user_email, category, description, amount, type, date });
    await newExpense.save();
    res.status(201).json({
      ...newExpense.toObject(),
      id: newExpense._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Error adding expense', error: err.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting expense', error: err.message });
  }
});


// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
});

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const { author, location, user_email, content, category } = req.body;
    const newPost = new Post({ author, location, user_email, content, category });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
});

// Like/Unlike a post
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { user_email } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    if (post.likes.includes(user_email)) {
      post.likes = post.likes.filter(email => email !== user_email);
    } else {
      post.likes.push(user_email);
    }
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error liking post', error: err.message });
  }
});

// Reply to a post
app.post('/api/posts/:id/reply', async (req, res) => {
  try {
    const { author, content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.replies.push({ author, content });
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error replying to post', error: err.message });
  }
});

// Save Soil Details Endpoint
app.post('/api/soil-details', async (req, res) => {
  try {
    const { nitrogen, phosphorus, potassium, ph, location, season } = req.body;
    
    const newSoilTest = new SoilDetail({
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      location,
      season
    });
    
    await newSoilTest.save();
    res.status(201).json({ message: 'Soil details saved successfully!', data: newSoilTest });
  } catch (error) {
    res.status(500).json({ message: 'Error saving soil details', error: error.message });
  }
});

// 1. Signup Endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { name, location, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Save the plain text password directly (as requested for project testing)
    const newUser = new User({ name, location, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// 2. Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the submitted password directly with the plain text password in the database
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Assign a token so the user stays logged in
    const token = jwt.sign({ userId: user._id }, 'super_secret_jwt_key', { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token, name: user.name, email: user.email, location: user.location });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});
// ---- Crop Disease Analysis Endpoint ----
app.post('/api/analyze-crop-disease', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Since this is a local server, we can either:
    // 1. Actually call an AI API (requires an API key in .env)
    // 2. Provide a realistic response for demo purposes

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For now, we'll return a sample success response.
    // In a real scenario, you'd send 'imageBase64' to an AI service like Gemini/OpenAI.
    const mockResults = [
      {
        name: "Tomato Late Blight",
        confidence: 94,
        severity: "High",
        description: "Late blight is a serious disease caused by the fungus-like organism Phytophthora infestans. it can quickly destroy tomato crops in wet weather.",
        treatment: [
          "Apply copper-based fungicides immediately",
          "Remove and destroy infected leaves and fruit",
          "Ensure better air circulation between plants",
          "Avoid overhead watering to keep foliage dry"
        ],
        prevention: [
          "Use disease-resistant tomato varieties",
          "Practice crop rotation (avoid planting in same spot for 3 years)",
          "Maintain proper spacing for airflow",
          "Monitor plants daily during humid/wet weather"
        ]
      },
      {
        name: "Rice Blast",
        confidence: 88,
        severity: "Medium",
        description: "Rice blast is caused by the fungus Magnaporthe oryzae. It can affect all above-ground parts of the rice plant.",
        treatment: [
          "Apply recommended triazole fungicides",
          "Adjust nitrogen application (avoid excess)",
          "Maintain consistent water levels in the field"
        ],
        prevention: [
          "Use resistant cultivars",
          "Balanced fertilization",
          "Proper seed treatment before sowing"
        ]
      }
    ];

    // Return a random result for demonstration
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    res.status(200).json(randomResult);

  } catch (error) {
    res.status(500).json({ message: 'Error analyzing image', error: error.message });
  }
});


// ---- Weather Alert Endpoint ----
app.post('/api/send-weather-alert', async (req, res) => {
  try {
    const payload = req.body;
    console.log('Sending weather alert to:', payload.to_email);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real scenario, you'd use a service like Resend, Nodemailer, or SendGrid here.
    // Since this is a local project, we'll simulate a successful send.
    
    res.status(200).json({ message: 'Weather alert sent successfully (simulated)' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending weather alert', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
