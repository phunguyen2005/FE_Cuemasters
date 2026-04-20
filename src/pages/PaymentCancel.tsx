import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const orderId = sessionStorage.getItem('pendingPayPalOrderId');
    const cleanup = async () => {
      if (orderId) {
        try {
          await paymentService.cancelPayPalPayment(orderId);
        } catch {
          // swallow — worker will expire it if API fails
        }
      }
      sessionStorage.removeItem('pendingPayPalOrderId');
      sessionStorage.removeItem('pendingReservationId');
      sessionStorage.removeItem('pendingMembershipPayPalOrderId');
      navigate('/floor-plan', { replace: true });
    };

    void cleanup();
  }, [navigate]);

  return null;
}
