// updatePassword.js
const userModel = require('./models/userModel');

userModel.updatePassword(2, 'Airforce1', (err, success) => {
  if (err) {
    console.error('❌ Password update failed:', err);
  } else {
    console.log('✅ Password updated successfully!');
  }
});
