import Razorpay from 'razorpay';
import { config } from './index';

let razorpayInstance: Razorpay | null = null;

try {
  razorpayInstance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
} catch (error) {
  console.warn('Razorpay initialization warning (will use fallback mock if keys invalid):', error);
}

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};

export default getRazorpayInstance;
