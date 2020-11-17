import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'semantic-ui-react'
import styled from 'styled-components'
import { MessageState } from '../messages/Messages'
import { useLazyQuery, gql } from '@apollo/client'
import { authToken } from '../../authentication'

export const SIDEBAR_DOWNLOAD_QUERY = gql`
  query sidebarDownloadQuery($mediaId: Int!) {
    media(id: $mediaId) {
      id
      downloads {
        title
        mediaUrl {
          url
          width
          height
          fileSize
        }
      }
    }
  }
`

function formatBytes(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 Byte'
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

const downloadMedia = async url => {
  const imgUrl = new URL(url)

  if (authToken() == null) {
    // Get share token if not authorized
    const token = location.pathname.match(/^\/share\/([\d\w]+)(\/?.*)$/)
    if (token) {
      imgUrl.searchParams.set('token', token[1])
    }
  }

  const response = await fetch(imgUrl.href, {
    credentials: 'include',
  })

  let blob = null
  if (response.headers.has('content-length')) {
    blob = await downloadMediaShowProgress(response)
  } else {
    blob = await response.blob()
  }

  const filename = url.match(/[^/]*$/)[0]

  downloadBlob(blob, filename)
}

const downloadMediaShowProgress = async response => {
  const totalBytes = Number(response.headers.get('content-length'))
  const reader = response.body.getReader()
  let data = new Uint8Array(totalBytes)

  let canceled = false
  const onDismiss = () => {
    canceled = true
    reader.cancel('Download canceled by user')
  }

  const notifKey = Math.random().toString(26)
  MessageState.add({
    key: notifKey,
    type: 'progress',
    onDismiss,
    props: {
      header: 'Downloading photo',
      content: `Starting download`,
      progress: 0,
    },
  })

  let receivedBytes = 0
  let result
  do {
    result = await reader.read()

    if (canceled) break

    if (result.value) data.set(result.value, receivedBytes)

    receivedBytes += result.value ? result.value.length : 0

    MessageState.add({
      key: notifKey,
      type: 'progress',
      onDismiss,
      props: {
        header: 'Downloading photo',
        percent: (receivedBytes / totalBytes) * 100,
        content: `${formatBytes(receivedBytes)} of ${formatBytes(
          totalBytes
        )} bytes downloaded`,
      },
    })
  } while (!result.done)

  if (canceled) {
    return
  }

  MessageState.add({
    key: notifKey,
    type: 'progress',
    props: {
      header: 'Downloading photo completed',
      content: `The photo has been downloaded`,
      percent: 100,
      positive: true,
    },
  })

  setTimeout(() => {
    MessageState.removeKey(notifKey)
  }, 2000)

  const content = new Blob([data.buffer], {
    type: response.headers.get('content-type'),
  })

  return content
}

const downloadBlob = async (blob, filename) => {
  let objectUrl = window.URL.createObjectURL(blob)

  let anchor = document.createElement('a')
  document.body.appendChild(anchor)

  anchor.href = objectUrl
  anchor.download = filename
  anchor.click()

  anchor.remove()

  window.URL.revokeObjectURL(objectUrl)
}

const DownloadTableRow = styled(Table.Row)`
  cursor: pointer;
`

const SidebarDownload = ({ photo }) => {
  if (!photo || !photo.id) return null

  const [
    loadPhotoDownloads,
    { called, loading, data },
  ] = useLazyQuery(SIDEBAR_DOWNLOAD_QUERY, { variables: { mediaId: photo.id } })

  let downloads = []

  if (called) {
    if (!loading) {
      downloads = data && data.media.downloads
    }
  } else {
    if (!photo.downloads) {
      loadPhotoDownloads()
    } else {
      downloads = photo.downloads
    }
  }

  const extractExtension = url => {
    return url.split(/[#?]/)[0].split('.').pop().trim().toLowerCase()
  }

  let downloadRows = downloads.map(x => (
    <DownloadTableRow
      key={x.mediaUrl.url}
      onClick={() => downloadMedia(x.mediaUrl.url)}
    >
      <Table.Cell>{`${x.title}`}</Table.Cell>
      <Table.Cell>{`${x.mediaUrl.width} x ${x.mediaUrl.height}`}</Table.Cell>
      <Table.Cell>{`${formatBytes(x.mediaUrl.fileSize)}`}</Table.Cell>
      <Table.Cell>{extractExtension(x.mediaUrl.url)}</Table.Cell>
    </DownloadTableRow>
  ))

  return (
    <div style={{ marginBottom: 24 }}>
      <h2>Download</h2>

      <Table selectable singleLine compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Dimensions</Table.HeaderCell>
            <Table.HeaderCell>Size</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{downloadRows}</Table.Body>
      </Table>
    </div>
  )
}

SidebarDownload.propTypes = {
  photo: PropTypes.object,
}

export default SidebarDownload
