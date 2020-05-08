import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import debounce from 'lodash/debounce'

import ExitIcon from './icons/exit.svg'
import NextIcon from './icons/next.svg'
import PrevIcon from './icons/previous.svg'

const StyledOverlayContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const OverlayButton = styled.button`
  width: 64px;
  height: 64px;
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;

  & svg {
    width: 32px;
    height: 32px;
    overflow: visible !important;
  }

  & svg path {
    stroke: rgba(255, 255, 255, 0.5);
    transition-property: stroke, filter;
    transition-duration: 140ms;
  }

  &:hover svg path {
    stroke: rgba(255, 255, 255, 1);
    filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.6));
  }

  &.hide svg path {
    stroke: rgba(255, 255, 255, 0);
    transition: stroke 300ms;
  }
`

const ExitButton = styled(OverlayButton)`
  left: 28px;
  top: 28px;
`

const NavigationButton = styled(OverlayButton)`
  height: 80%;
  width: 20%;
  top: 10%;

  ${({ float }) => (float == 'left' ? 'left: 0;' : null)}
  ${({ float }) => (float == 'right' ? 'right: 0;' : null)}

  & svg {
    width: 48px;
    height: 64px;
  }
`

const mouseMoveEvent = ({ setHide }) =>
  debounce(
    (event) => {
      console.log('Hide')
      setHide((hide) => !hide)
    },
    2000,
    { leading: true, trailing: true }
  )

const PresentNavigationOverlay = ({
  nextImage,
  previousImage,
  setPresenting,
}) => {
  const [hide, setHide] = useState(true)
  const onMouseMove = useRef(mouseMoveEvent({ hide, setHide }))

  return (
    <StyledOverlayContainer onMouseMove={onMouseMove.current}>
      <NavigationButton
        className={hide && 'hide'}
        float="left"
        onClick={() => previousImage()}
      >
        <PrevIcon />
      </NavigationButton>
      <NavigationButton
        className={hide && 'hide'}
        float="right"
        onClick={() => nextImage()}
      >
        <NextIcon />
      </NavigationButton>
      <ExitButton
        className={hide && 'hide'}
        onClick={() => setPresenting(false)}
      >
        <ExitIcon />
      </ExitButton>
    </StyledOverlayContainer>
  )
}

PresentNavigationOverlay.propTypes = {
  nextImage: PropTypes.func.isRequired,
  previousImage: PropTypes.func.isRequired,
  setPresenting: PropTypes.func.isRequired,
}

export default PresentNavigationOverlay
