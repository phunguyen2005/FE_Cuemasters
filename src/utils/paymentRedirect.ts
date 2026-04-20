const isTopLevelWindow = () => {
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
};

export const createExternalPaymentWindow = () => {
  if (isTopLevelWindow()) {
    return null;
  }

  const paymentWindow = window.open('about:blank', '_blank');
  if (paymentWindow) {
    paymentWindow.opener = null;
    paymentWindow.document.title = 'PayPal';
    paymentWindow.document.body.textContent = 'Opening PayPal checkout...';
  }

  return paymentWindow;
};

export const closeExternalPaymentWindow = (paymentWindow: Window | null) => {
  if (paymentWindow && !paymentWindow.closed) {
    paymentWindow.close();
  }
};

export const redirectToExternalPayment = (approvalUrl: string, paymentWindow?: Window | null) => {
  if (isTopLevelWindow()) {
    window.location.assign(approvalUrl);
    return;
  }

  if (paymentWindow && !paymentWindow.closed) {
    paymentWindow.location.assign(approvalUrl);
    paymentWindow.focus();
    return;
  }

  const openedWindow = window.open(approvalUrl, '_blank', 'noopener,noreferrer');
  if (openedWindow) {
    openedWindow.focus();
    return;
  }

  window.location.assign(approvalUrl);
};
