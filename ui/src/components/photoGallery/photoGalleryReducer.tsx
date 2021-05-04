import React, { useEffect } from 'react'
import { PhotoGalleryProps_Media } from './PhotoGallery'

export interface PhotoGalleryState {
  presenting: boolean
  activeIndex: number
  media: PhotoGalleryProps_Media[]
}

export type GalleryAction =
  | { type: 'nextImage' }
  | { type: 'previousImage' }
  | { type: 'closePresentMode' }

export type PhotoGalleryAction =
  | GalleryAction
  | { type: 'openPresentMode'; activeIndex: number }
  | { type: 'selectImage'; index: number }
  | { type: 'replaceMedia'; media: PhotoGalleryProps_Media[] }

export function photoGalleryReducer(
  state: PhotoGalleryState,
  action: PhotoGalleryAction
): PhotoGalleryState {
  switch (action.type) {
    case 'nextImage':
      return {
        ...state,
        activeIndex: (state.activeIndex + 1) % state.media.length,
      }
    case 'previousImage':
      if (state.activeIndex <= 0) {
        return {
          ...state,
          activeIndex: state.media.length - 1,
        }
      } else {
        return {
          ...state,
          activeIndex: state.activeIndex - 1,
        }
      }
    case 'openPresentMode':
      return {
        ...state,
        presenting: true,
        activeIndex: action.activeIndex,
      }
    case 'closePresentMode':
      return {
        ...state,
        presenting: false,
      }
    case 'selectImage':
      return {
        ...state,
        activeIndex: Math.max(
          0,
          Math.min(state.media.length - 1, action.index)
        ),
      }
    case 'replaceMedia':
      return {
        ...state,
        media: action.media,
        activeIndex: -1,
        presenting: false,
      }
  }
}

export const urlPresentModeSetupHook = ({
  dispatchMedia,
  openPresentMode,
}: {
  dispatchMedia: React.Dispatch<GalleryAction>
  openPresentMode: (event: PopStateEvent) => void
}) => {
  useEffect(() => {
    const urlChangeListener = (event: PopStateEvent) => {
      if (event.state.presenting === true) {
        openPresentMode(event)
      } else {
        dispatchMedia({ type: 'closePresentMode' })
      }
    }

    window.addEventListener('popstate', urlChangeListener)

    history.replaceState({ presenting: false }, '')

    return () => {
      window.removeEventListener('popstate', urlChangeListener)
    }
  }, [])
}

export const openPresentModeAction = ({
  dispatchMedia,
  activeIndex,
}: {
  dispatchMedia: React.Dispatch<PhotoGalleryAction>
  activeIndex: number
}) => {
  dispatchMedia({
    type: 'openPresentMode',
    activeIndex: activeIndex,
  })

  history.pushState({ presenting: true, activeIndex }, '')
}

export const closePresentModeAction = ({
  dispatchMedia,
}: {
  dispatchMedia: React.Dispatch<GalleryAction>
}) => {
  dispatchMedia({
    type: 'closePresentMode',
  })

  history.back()
}
