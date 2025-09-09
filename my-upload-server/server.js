const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const fs = require('fs');
const EmailService = require('./emailService');

// Initialize email service
const emailService = new EmailService();

// Function to sanitize the file name
const sanitizeFileName = (originalname) => {
  // Replace spaces and special characters with underscores
  return originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
};

// Function to ensure upload directories exist
const createUploadDirectories = () => {
  const directories = ['uploads/pictures', 'uploads/signatures'];
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call this when server starts
createUploadDirectories();

// Configure storage with dynamic destination based on file type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine folder based on upload type from request
    const uploadType = req.query.type || 'general';
    let uploadPath = 'uploads/';
    
    if (uploadType === 'picture') {
      uploadPath = 'uploads/pictures/';
    } else if (uploadType === 'signature') {
      uploadPath = 'uploads/signatures/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedFileName = sanitizeFileName(file.originalname);
    cb(null, sanitizedFileName);
  }
});

const upload = multer({ storage: storage });

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  let fileUrl = null;

  if (req.file) {
    const uploadType = req.query.type || 'general';
    const sanitizedFileName = sanitizeFileName(req.file.originalname);
    const subfolder = uploadType === 'picture' ? 'pictures' : 
                     uploadType === 'signature' ? 'signatures' : '';
    
    fileUrl = `http://172.20.9.60:3001/download/${subfolder}/${sanitizedFileName}`;
  }

  res.json({ fileUrl: fileUrl });
});

// Serve static files from both directories
app.use('/uploads/pictures', express.static('uploads/pictures'));
app.use('/uploads/signatures', express.static('uploads/signatures'));

// Serve files with download headers (for automatic download)
app.get('/download/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', folder, filename);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Email endpoint for HRD Helpdesk forms
app.post('/send-email', async (req, res) => {
  try {
    const { formData, attachments = [] } = req.body;
    
    if (!formData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Form data is required' 
      });
    }

    // Send email to osTicket
    const emailResult = await emailService.sendHRDRequest(formData, attachments);
    
    if (emailResult.success) {
      // Send confirmation email to employee
      if (formData.email) {
        await emailService.sendConfirmationEmail(formData.email, formData.title);
      }
      
      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: emailResult.error,
        message: 'Failed to send email'
      });
    }
  } catch (error) {
    console.error('Error in email endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Test email connection endpoint
app.get('/test-email', async (req, res) => {
  try {
    const isConnected = await emailService.testConnection();
    res.json({
      success: isConnected,
      message: isConnected ? 'Email service is ready' : 'Email service connection failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Feedback submission endpoint
app.post('/send-feedback', async (req, res) => {
  try {
    const { rating, feedback, name, email, timestamp } = req.body;

    // Validate required fields
    if (!rating || !feedback || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Validate email domain
    if (!email.includes('@castotravel.ph')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email must be from @castotravel.ph domain' 
      });
    }

    // Send feedback email to HR
    await emailService.sendFeedbackEmail({
      rating,
      feedback,
      name: name || 'Anonymous',
      email,
      timestamp
    });

    res.json({ 
      success: true, 
      message: 'Feedback submitted successfully' 
    });

  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send feedback' 
    });
  }
});

// Start the server
app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
