import React from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { Table, Button, Icon, Dropdown } from 'semantic-ui-react'

const shareQuery = gql`
  query sidbarGetShares($photoId: ID!) {
    photoShares(id: $photoId) {
      token
    }
  }
`

const addShareMutation = gql`
  mutation sidebarAddShare(
    $photoId: ID!
    $password: String
    $expire: _Neo4jDateInput
  ) {
    sharePhoto(photoId: $photoId, password: $password, expire: $expire) {
      token
    }
  }
`

const deleteShareMutation = gql`
  mutation sidebareDeleteShare($token: ID!) {
    deleteShareToken(token: $token) {
      token
    }
  }
`

const SidebarShare = ({ photo }) => {
  if (!photo || !photo.id) return null

  return (
    <div>
      <h2>Sharing options</h2>
      <Query query={shareQuery} variables={{ photoId: photo.id }}>
        {({ loading, error, data, refetch }) => {
          if (loading) return <div>Loading...</div>
          if (error) return <div>Error: {error}</div>

          const rows = data.photoShares.map(share => (
            <Table.Row key={share.token}>
              <Table.Cell>
                <b>Public Link</b> {share.token}
              </Table.Cell>
              <Table.Cell>
                <Button.Group>
                  <Button icon="chain" content="Copy" />
                  <Dropdown button text="More">
                    <Dropdown.Menu>
                      <Mutation
                        mutation={deleteShareMutation}
                        onCompleted={() => {
                          refetch()
                        }}
                      >
                        {(deleteShare, { loading, error, data }) => {
                          return (
                            <Dropdown.Item
                              text="Delete"
                              icon="delete"
                              disabled={loading}
                              onClick={() => {
                                deleteShare({
                                  variables: {
                                    token: share.token,
                                  },
                                })
                              }}
                            />
                          )
                        }}
                      </Mutation>
                    </Dropdown.Menu>
                  </Dropdown>
                </Button.Group>
              </Table.Cell>
            </Table.Row>
          ))

          if (rows.length == 0) {
            rows.push(
              <Table.Row key="no-shares">
                <Table.Cell colSpan="2">No shares found</Table.Cell>
              </Table.Row>
            )
          }

          return (
            <div>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell colSpan="2">
                      Public Shares
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>{rows}</Table.Body>
                <Table.Footer>
                  <Table.Row>
                    <Table.HeaderCell colSpan="2">
                      <Mutation
                        mutation={addShareMutation}
                        onCompleted={() => {
                          refetch()
                        }}
                      >
                        {(sharePhoto, { loading, error, data }) => {
                          return (
                            <Button
                              content="Add share"
                              icon="add"
                              floated="right"
                              positive
                              loading={loading}
                              disabled={loading}
                              onClick={() => {
                                sharePhoto({
                                  variables: {
                                    photoId: photo.id,
                                  },
                                })
                              }}
                            />
                          )
                        }}
                      </Mutation>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
            </div>
          )
        }}
      </Query>
    </div>
  )
}

export default SidebarShare
