import React from 'react'
import { ItemTypes } from './Constants'
import { useDrop } from 'react-dnd'
import { MDBIcon } from 'mdbreact'

const style = {
    border: '1px solid white',
    marginBottom: '0.5rem',
    backgroundColor: 'white',
    cursor: 'move',
    width: '250px',
    height: '40px',
  }

function selectBackgroundColor(isActive, canDrop) {
    if (isActive) {
      return 'darkgreen'
    } else if (canDrop) {
      return 'darkkhaki'
    } else {
      return '#ffffff'
    }
  }

function ActionConnector({y, handleActionDropped}) {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.CARD,
        drop: (item) => handleActionDropped(item.name, y, item.index),
        collect: mon => ({
            isOver: !!mon.isOver(),
            canDrop: !!mon.canDrop()
        }),
    })
    const isActive = canDrop && isOver
    const backgroundColor = selectBackgroundColor(isActive, canDrop)

    return (
        <div id={y} ref={drop} style={{ ...style, backgroundColor }}>
            <MDBIcon icon='long-arrow-alt-down' />
        </div>
    )
}

export default ActionConnector