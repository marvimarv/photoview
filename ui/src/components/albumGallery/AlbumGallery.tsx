import React, { useReducer } from 'react'
import AlbumTitle from '../AlbumTitle'
import PhotoGallery from '../photoGallery/PhotoGallery'
import AlbumBoxes from './AlbumBoxes'
import AlbumFilter from '../AlbumFilter'
import { albumQuery_album } from '../../Pages/AlbumPage/__generated__/albumQuery'
import { OrderDirection } from '../../../__generated__/globalTypes'
import { photoGalleryReducer } from '../photoGallery/photoGalleryReducer'

type AlbumGalleryProps = {
  album?: albumQuery_album
  loading?: boolean
  customAlbumLink?(albumID: string): string
  showFilter?: boolean
  setOnlyFavorites?(favorites: boolean): void
  setOrdering?(ordering: { orderBy: string }): void
  ordering?: { orderBy: string | null; orderDirection: OrderDirection | null }
  onlyFavorites?: boolean
  onFavorite?(): void
}

const AlbumGallery = React.forwardRef(
  (
    {
      album,
      loading = false,
      customAlbumLink,
      showFilter = false,
      setOnlyFavorites,
      setOrdering,
      ordering,
      onlyFavorites = false,
    }: AlbumGalleryProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    // const [imageState, setImageState] = useState<ImageStateType>({
    //   activeImage: -1,
    //   presenting: false,
    // })

    const [mediaState, dispatchMedia] = useReducer(photoGalleryReducer, {
      presenting: false,
      activeIndex: -1,
      media: album?.media || [],
    })

    // const setPresentingWithHistory = (presenting: boolean) => {
    //   setPresenting(presenting)
    //   if (presenting) {
    //     history.pushState({ imageState }, '')
    //   } else {
    //     history.back()
    //   }
    // }

    // const updateHistory = (imageState: ImageStateType) => {
    //   history.replaceState({ imageState }, '')
    //   return imageState
    // }

    // useEffect(() => {
    //   const updateImageState = (event: PopStateEvent) => {
    //     setImageState(event.state.imageState)
    //   }

    //   window.addEventListener('popstate', updateImageState)

    //   return () => {
    //     window.removeEventListener('popstate', updateImageState)
    //   }
    // }, [imageState])

    // useEffect(() => {
    //   setActiveImage(-1)
    // }, [album])

    let subAlbumElement = null

    if (album) {
      if (album.subAlbums.length > 0) {
        subAlbumElement = (
          <AlbumBoxes
            loading={loading}
            albums={album.subAlbums}
            getCustomLink={customAlbumLink}
          />
        )
      }
    } else {
      subAlbumElement = <AlbumBoxes loading={loading} />
    }

    return (
      <div ref={ref}>
        <AlbumTitle album={album} disableLink />
        {showFilter && (
          <AlbumFilter
            onlyFavorites={onlyFavorites}
            setOnlyFavorites={setOnlyFavorites}
            setOrdering={setOrdering}
            ordering={ordering}
          />
        )}
        {subAlbumElement}
        {
          <h2
            style={{
              opacity: loading ? 0 : 1,
              display: album && album.subAlbums.length > 0 ? 'block' : 'none',
            }}
          >
            Images
          </h2>
        }
        <PhotoGallery
          loading={loading}
          mediaState={mediaState}
          dispatchMedia={dispatchMedia}
        />
      </div>
    )
  }
)

export default AlbumGallery
