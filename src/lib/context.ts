import { createContext, useContext } from "react";
import type { DeviceInfo, LabState, Measurement, CoolingMode } from "./state";
import type { ProfileId } from "../data/guides";

export type PageId =
  | "overview"
  | "recovery"
  | "windows"
  | "profiles"
  | "cooling"
  | "lasso"
  | "journal"
  | "sources";
export type ModalState =
  | null
  | { type: "search" }
  | { type: "device"; tab?: "specs" | "my" }
  | { type: "guide"; id: string }
  | { type: "measurement"; id?: string }
  | { type: "reset" }
  | { type: "delete"; id: string }
  | { type: "mobile-nav" };
export interface LabContextValue {
  state: LabState;
  canPersist: boolean;
  page: PageId;
  navigate: (page: PageId) => void;
  open: (modal: ModalState) => void;
  close: () => void;
  toggleCheck: (id: string) => void;
  saveDevice: (device: DeviceInfo) => void;
  saveProfile: (id: ProfileId, fps: number) => void;
  saveMeasurement: (measurement: Measurement) => void;
  deleteMeasurement: (id: string) => void;
  setCooling: (mode: CoolingMode) => void;
  resetData: () => void;
  exportReport: () => void;
  toast: (message: string) => void;
}
export const LabContext = createContext<LabContextValue | null>(null);
export function useLab() {
  const context = useContext(LabContext);
  if (!context) throw new Error("useLab must be inside LabContext");
  return context;
}
