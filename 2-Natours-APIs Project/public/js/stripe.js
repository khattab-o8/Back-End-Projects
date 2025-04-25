/* eslint-disable */
// MODULES:
import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51RDqXqQClen2vM3i01nIVcT1z3ZG04Oa77iCwPAXd2BDBUHWhaPAKS1A899b6GkaxnVZ2isNyUYApeHXdwvqEYLR00OlHeePb5'
);
//-------------Here-------------//

export const bookTour = async tourId => {
  try {
    // 1)- Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2)- Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
