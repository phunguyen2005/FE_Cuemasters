import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const reservationOrderId = sessionStorage.getItem('pendingPayPalOrderId');
    const membershipOrderId = sessionStorage.getItem('pendingMembershipPayPalOrderId');
    const orderId = membershipOrderId || reservationOrderId;

    const cleanup = async () => {
      if (orderId) {
        try {
          await paymentService.cancelPayPalPayment(orderId);
        } catch {
          // Swallow error and rely on the server-side cleanup worker fallback.
        }
      }

      sessionStorage.removeItem('pendingPayPalOrderId');
      sessionStorage.removeItem('pendingReservationId');
      sessionStorage.removeItem('pendingMembershipPayPalOrderId');
      navigate(membershipOrderId ? '/membership' : '/floor-plan', { replace: true });
    };

    void cleanup();
  }, [navigate]);

  return null;
}
