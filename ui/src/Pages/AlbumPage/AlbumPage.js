import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Layout from '../../Layout'
import AlbumSidebar from './AlbumSidebar'
import PhotoGallery from '../../PhotoGallery'

const albumQuery = gql`
  query albumQuery($id: ID) {
    album(id: $id) {
      title
      photos {
        id
        thumbnail {
          path
          width
          height
        }
      }
    }
  }
`

class AlbumPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeImage: -1,
      activeImageId: null,
    }

    this.setActiveImage = this.setActiveImage.bind(this)

    this.photoAmount = 1

    this.keyDownEvent = e => {
      const activeImage = this.state.activeImage
      if (activeImage != -1) {
        if (e.key == 'ArrowRight') {
          this.setActiveImage((activeImage + 1) % this.photoAmount)
        }

        if (e.key == 'ArrowLeft') {
          if (activeImage <= 0) {
            this.setActiveImage(this.photoAmount - 1)
          } else {
            this.setActiveImage(activeImage - 1)
          }
        }
      }
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDownEvent)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDownEvent)
  }

  setActiveImage(index, id) {
    this.setState({
      activeImage: index,
      activeImageId: id,
    })
  }

  render() {
    const albumId = this.props.match.params.id

    return (
      <Layout>
        <Query query={albumQuery} variables={{ id: albumId }}>
          {({ loading, error, data }) => {
            if (error) return <div>Error</div>

            if (data.album) {
              this.photoAmount = data.album.photos.length
            }

            return (
              <div>
                <PhotoGallery
                  loading={loading}
                  title={data.album && data.album.title}
                  photos={data.album && data.album.photos}
                  activeIndex={this.state.activeImage}
                  onSelectImage={index => {
                    this.setActiveImage(index, data.album.photos[index].id)
                  }}
                />
                <AlbumSidebar imageId={this.state.activeImageId} />
              </div>
            )
          }}
        </Query>
      </Layout>
    )
  }
}

export default AlbumPage
