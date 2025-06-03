import { create } from "zustand";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertState {
  isAlertOpen: boolean;
  alertTitle: string;
  alertMessage: string;
  alertType: AlertType;
  onAlertClose?: () => void; // 알림이 닫힐 때 실행될 콜백 (선택 사항)
  showAlert: (
    title: string,
    message: string,
    type?: AlertType,
    onClose?: () => void
  ) => void;
  hideAlert: () => void;
}

export const useUIStore = create<AlertState>((set) => ({
  isAlertOpen: false,
  alertTitle: "",
  alertMessage: "",
  alertType: "info", // 기본 타입
  onAlertClose: undefined,
  showAlert: (title, message, type = "info", onClose) =>
    set({
      isAlertOpen: true,
      alertTitle: title,
      alertMessage: message,
      alertType: type,
      onAlertClose: onClose,
    }),
  hideAlert: () =>
    set((state) => {
      if (state.onAlertClose) {
        state.onAlertClose(); // 저장된 onClose 콜백 실행
      }
      return {
        isAlertOpen: false,
        alertTitle: "", // 상태 초기화
        alertMessage: "",
        alertType: "info",
        onAlertClose: undefined,
      };
    }),
}));
