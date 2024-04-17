// Import necessary modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const Razorpay = require('razorpay');
const { spawn } = require('child_process');

// Create an Express app
const app = express();
const port = 3000;

// Razorpay Configuration
const razorpay = new Razorpay({
  key_id: 'rzp_test_5tVHs4Ujfblq6R',
  key_secret: 'AACi2JsGeSLlYq0ZISIRHHtN',
});

// Multer Configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route to handle payment initiation
app.get('/initiate-payment', (req, res) => {
  const amount = req.query.amount;
  console.log(amount); // Get the amount from the client
  const options = {
    amount: amount * 100, // Amount in paise (5 rupees)
    currency: 'INR',
    receipt: 'order_receipt_1',
    payment_capture: 1,
  };

  razorpay.orders.create(options, (err, order) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error creating Razorpay order');
    }

    // Send the order details to the client
    res.json(order);
  });
});

// Define a route to handle file upload after successful payment
app.post('/upload-files', upload.array('files'), (req, res) => {
  // Execute temp.py script after successful payment
  console.log("Payment sucessful")
  console.log("Printing in progress")
  const pythonProcess = spawn('python', ['temp.py']);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    // Send response to the client
    res.send('Payment successful. Script executed successfully.');
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
