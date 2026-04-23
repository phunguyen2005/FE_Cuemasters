export const redirectToExternalPayment = (approvalUrl: string) => {
  try {
    (window.top ?? window).location.href = approvalUrl;
  } catch {
    window.location.assign(approvalUrl);
  }
};
