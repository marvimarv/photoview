import { authToken } from '../authentication'
import { Checkbox, Dropdown, Button, Icon } from 'semantic-ui-react'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const sortingOptions = [
  {
    key: 'date_shot',
    value: 'date_shot',
    text: 'Date shot',
  },
  {
    key: 'date_imported',
    value: 'date_imported',
    text: 'Date imported',
  },
  {
    key: 'title',
    value: 'title',
    text: 'Title',
  },
  {
    key: 'kind',
    value: 'kind',
    text: 'Kind',
  },
]

const FavoritesCheckbox = styled(Checkbox)`
  margin-bottom: 16px;
  margin-right: 10px;

  &.ui.toggle.checkbox label {
    padding-left: 0;
    padding-right: 4em;
    font-weight: bold;
  }

  &.ui.checkbox input,
  &.ui.toggle.checkbox label:before {
    left: auto;
    right: 0;
  }

  &.ui.toggle.checkbox label:after {
    left: auto;
    right: 1.75em;
    transition: background 0.3s ease 0s, right 0.3s ease 0s;
  }

  &.ui.toggle.checkbox input:checked + label:after {
    left: auto;
    right: 0.08em;
    transition: background 0.3s ease 0s, right 0.3s ease 0s;
  }
`

const OrderDirectionButton = styled(Button)`
  padding: 0.88em;
  margin-left: 10px !important;
`

const AlbumFilter = ({
  onlyFavorites,
  setOnlyFavorites,
  setOrdering,
  ordering,
}) => {
  const [orderDirection, setOrderDirection] = useState(ordering.orderDirection)

  const onChangeOrderDirection = (e, data) => {
    const direction = data.children.props.name === 'arrow up' ? 'DESC' : 'ASC'
    setOrderDirection(direction)
  }

  useEffect(() => {
    setOrdering({ orderDirection })
  }, [orderDirection])

  return (
    <>
      {authToken() && (
        <FavoritesCheckbox
          toggle
          label="Show only favorites"
          checked={onlyFavorites}
          onClick={e => e.stopPropagation()}
          onChange={(e, result) => setOnlyFavorites(result.checked)}
        />
      )}
      <strong> Sort by </strong>
      <Dropdown
        selection
        options={sortingOptions}
        defaultValue={
          sortingOptions.find(e => e.value === ordering.orderBy)?.value ||
          sortingOptions[0].value
        }
        onChange={(e, data) => {
          setOrdering({ orderBy: data.value })
        }}
      />
      <OrderDirectionButton icon basic onClick={onChangeOrderDirection}>
        <Icon name={'arrow ' + (orderDirection === 'ASC' ? 'up' : 'down')} />
      </OrderDirectionButton>
    </>
  )
}

AlbumFilter.propTypes = {
  onlyFavorites: PropTypes.bool,
  setOnlyFavorites: PropTypes.func,
  setOrdering: PropTypes.func,
  ordering: PropTypes.object,
}

export default React.memo(AlbumFilter)
