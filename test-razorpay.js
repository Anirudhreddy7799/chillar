import Razorpay from 'razorpay';

// Using test keys - these would be replaced with real keys in production
const razorpay = new Razorpay({
  key_id: 'rzp_test_placeholder_key',
  key_secret: 'placeholder_secret_key'
});

// Test function to check if Razorpay is properly initialized
async function testRazorpayConnection() {
  try {
    console.log('Testing Razorpay connection...');
    
    // Create a test order
    const order = await razorpay.orders.create({
      amount: 500 * 100, // Amount in paise (5 rupees)
      currency: 'INR',
      receipt: 'receipt_test_' + Date.now(),
      notes: {
        purpose: 'Razorpay connection test'
      }
    });
    
    console.log('Successfully created test order with placeholder keys');
    console.log('Order ID:', order.id);
    
    return {
      success: true,
      order
    };
  } catch (error) {
    console.error('Razorpay test error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testRazorpayConnection()
  .then(result => {
    console.log('Test complete. Success:', result.success);
    if (!result.success) {
      console.log('You may need to provide valid Razorpay keys.');
    }
  });