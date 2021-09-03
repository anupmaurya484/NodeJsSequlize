// Placeholder to hold Action Card, placeholder position is fixed, 
// cards can move to other placeholder
import React from 'react'
import { ItemTypes } from './Constants'
import { useDrop } from 'react-dnd'

const style = {
    border: '1px solid white',
    marginBottom: '0rem',
    backgroundColor: 'white',
    cursor: 'move',
    width: '100%',
    maxWidth: '200px',
    minWidth: '200px',
    height: '40px',
  }

function selectBackgroundColor(isActive, canDrop, priority) {
    if (isActive) {
      return 'darkgreen'
    } else if (canDrop && priority) {
      return 'darkkhaki'
    } else {
      return '#ffffff'
    }
  }

function ConnectorPlaceholder({y, handleActionDropped , children }) {
    const [{ isOver, canDrop, priority }, drop] = useDrop({
        accept: ItemTypes.CARD,
        drop: (item) => handleActionDropped(item.name, y, item.index),
        collect: mon => ({
            isOver: !!mon.isOver(),
            canDrop: !!mon.canDrop(),
            priority: children? false: true,
        }),
    })
    const isActive = canDrop && isOver
    const backgroundColor = selectBackgroundColor(isActive, canDrop, priority)

    return (
      <div id={y} ref={drop}
        className="d-flex justify-content-center .z-depth-1-half"
        style={{ ...style, backgroundColor }}>
            {children}
      </div>
    )
}

export default ConnectorPlaceholder