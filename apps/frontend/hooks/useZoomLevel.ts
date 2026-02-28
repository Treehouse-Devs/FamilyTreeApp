import { useStore } from '@/store/store'

export function useZoomLevel() {
  const zoomLevel = useStore(state => state.zoomLevel)
  const setZoomLevel = useStore(state => state.setZoomLevel)

  return { zoomLevel, setZoomLevel }
}
