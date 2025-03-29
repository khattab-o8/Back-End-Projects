/* eslint-disable */
// MODULES:
import { showAlert } from './alerts.js';

//-------------Here-------------//

export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      // url: '/api/v1/users/login',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (result.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/'); // Home page-> http://127.0.0.1:3000/
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
