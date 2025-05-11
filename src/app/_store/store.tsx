import { number } from 'framer-motion';
import { create } from 'zustand';

export const useModal = create((set: any) => ({
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

export const useCrimeBar = create((set: any) => ({
  collapsedCrimeBar: false,
  setCollapsedCrimeBar: (collapsedCrimeBar: any) => set({ collapsedCrimeBar: collapsedCrimeBar }),
}))

export const useUserData = create((set: any) => ({
  user: null,
  loading: true,
  errorUser: null,
  setUser: (newuser: any) => set({ user: newuser, loading: false, error: null }),
  setLoading: (loading: any) => set({ loading }),
  setError: (error: any) => set({ errorUser: error, loading: false }),
  clearUser: () => set({ user: null, loading: false, errorUser: null }),
}))


export const useSearchAPI = create((set: any) => ({
  currentSearch: null,
  zoomObject: "",
  currentDataCountry: null,
  setCurrentSearch: (currentSearch: any) => set({currentSearch: currentSearch }),
  setZoomObject: (zoomObject: any) => set({ zoomObject }),
  setCurrentDataCountry: (currentDataCountry: any) => set({currentDataCountry: currentDataCountry }),
}))


export const useDenunciaData = create((set: any, get:any) => ({
  currentDenuncia: {lat: number, lng: number},
  setCurrentDenuncia: (newData: any) =>
    set({ currentDenuncia: { ...get().currentDenuncia, ...newData } }),
}))