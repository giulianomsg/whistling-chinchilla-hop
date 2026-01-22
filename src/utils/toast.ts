import { feedbackService } from "@/components/ui/CapiFitFeedback";

export const showSuccess = (message: string) => {
  feedbackService.notify({ title: "Sucesso", description: message, type: 'success' });
};

export const showError = (message: string) => {
  feedbackService.notify({ title: "Erro", description: message, type: 'error' });
};

export const showLoading = (message: string) => {
  const id = Math.random().toString(36).substr(2, 9);
  feedbackService.notify({ id, title: "Aguarde", description: message, type: 'info', duration: 0, dismissible: false });
  return id;
};

export const dismissToast = (toastId: string) => {
  feedbackService.dismiss(toastId);
};
