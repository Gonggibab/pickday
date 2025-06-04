// stores/useUIStore.ts
import { create } from "zustand";
import React from "react"; // React.ReactNode 사용을 위해 import

type AlertType = "success" | "error" | "info" | "warning";

interface AlertState {
  isAlertOpen: boolean;
  alertTitle: string;
  alertMessage: React.ReactNode;
  alertType: AlertType;
  onAlertClose?: () => void;
  showAlert: (
    title: string,
    message: React.ReactNode,
    type?: AlertType,
    onClose?: () => void
  ) => void;
  hideAlert: () => void;
  updateAlertMessage: (message: React.ReactNode) => void; // 메시지 업데이트 액션 추가
}

export const useUIStore = create<AlertState>((set, get) => ({
  // get 추가
  isAlertOpen: false,
  alertTitle: "",
  alertMessage: "",
  alertType: "info",
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
        state.onAlertClose();
      }
      return {
        isAlertOpen: false,
        alertTitle: "",
        alertMessage: "",
        alertType: "info",
        onAlertClose: undefined,
      };
    }),
  updateAlertMessage: (message) => {
    // 알림창이 열려 있을 때만 메시지 업데이트
    if (get().isAlertOpen) {
      set({ alertMessage: message });
    }
  },
}));
