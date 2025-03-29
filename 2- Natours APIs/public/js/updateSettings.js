/* eslint-disable */
// MODULES:
import { showAlert } from './alerts.js';

//-------------Here-------------//

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    const popUpWord = type.at(0).toUpperCase() + type.slice(1);

    if (res.data.status === 'success') {
      showAlert('success', `${popUpWord} updated successfully`);
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert('error', err.response.data.message);
  }
};
