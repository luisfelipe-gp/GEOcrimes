import { number } from 'framer-motion';
import { create } from 'zustand';

// 1. useModal
interface ModalState {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
}


export const useModal = create<ModalState>((set: any) => ({
    openModal: true,
    setOpenModal: (openModal: any) => set({ openModal }),
}))

interface ModalSidebarState {
  collapsedBar: boolean;
  setCollapsedBar: (collapsed: boolean) => void;
}

export const useModalSidebar = create<ModalSidebarState>((set: any) => ({
  collapsedBar: false,
  setCollapsedBar: (collapsedBar: any) => set({ collapsedBar: collapsedBar }),
}))


// 3. useCrimeBar
interface CrimeBarState {
  collapsedCrimeBar: boolean;
  setCollapsedCrimeBar: (collapsedCrimeBar: boolean) => void;
}

export const useCrimeBar = create<CrimeBarState>((set: any) => ({
  collapsedCrimeBar: false,
  setCollapsedCrimeBar: (collapsedCrimeBar: any) => set({ collapsedCrimeBar: collapsedCrimeBar }),
}))

// 4. useUserData
interface UserDataState {
  user: any | null;
  loading: boolean;
  errorUser: any | null;
  setUser: (newuser: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
  clearUser: () => void;
}

export const useUserData = create<UserDataState>((set: any) => ({
  user: null,
  loading: true,
  errorUser: null,
  setUser: (newuser: any) => set({ user: newuser, loading: false, error: null }),
  setLoading: (loading: any) => set({ loading }),
  setError: (error: any) => set({ errorUser: error, loading: false }),
  clearUser: () => set({ user: null, loading: false, errorUser: null }),
}))

// 5. useSearchAPI
interface SearchAPIState {
  currentSearch: any | null;
  zoomObject: string;
  currentDataCountry: any | null;
  setCurrentSearch: (currentSearch: any) => void;
  setZoomObject: (zoomObject: string) => void;
  setCurrentDataCountry: (currentDataCountry: any) => void;
}

export const useSearchAPI = create<SearchAPIState>((set: any) => ({
  currentSearch: null,
  zoomObject: "",
  currentDataCountry: null,
  setCurrentSearch: (currentSearch: any) => set({currentSearch: currentSearch }),
  setZoomObject: (zoomObject: any) => set({ zoomObject }),
  setCurrentDataCountry: (currentDataCountry: any) => set({currentDataCountry: currentDataCountry }),
}))

// 6. useDenunciaData
interface DenunciaDataState {
  currentDenuncia: { lat: number; lng: number };
  setCurrentDenuncia: (newData: Partial<{ lat: number; lng: number }>) => void;
}

export const useDenunciaData = create<DenunciaDataState>((set, get) => ({
  currentDenuncia: {lat: 0, lng: 0},
  setCurrentDenuncia: (newData: any) =>
    set({ currentDenuncia: { ...get().currentDenuncia, ...newData } }),
}))