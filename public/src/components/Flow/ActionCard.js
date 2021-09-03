import React from 'react'
import { ItemTypes } from './Constants'
import { useDrag } from 'react-dnd'
import './ActionCard.css'

const style = {
  border: 'rounded 1px dashed gray',
  marginBottom: '0.2rem',
  backgroundColor: 'white',
  cursor: 'move',
  float: 'left',
  width: '100%',
  maxWidth: '200px',
  minWidth: '200px',
  height: '40px',
  verticalAlign: 'middle'
}

const style1 = {
  border: '1px dashed #bdbdbd',
  backgroundColor: '#bdbdbd',
  cursor: 'move',
  float: 'left',
  width: '40px',
  margin: '0 auto',
  height: '39px'
}

const style2 = {
  border: '1px dashed gray',
  backgroundColor: 'white',
  cursor: 'move',
  float: 'left',
  width: '100%',
  height: '39px',
  verticalAlign: 'middle'
}

function ActionCard({ icon, cardName, holderIndex }) {
  const [{ opacity }, drag] = useDrag({
    item: {
      name: cardName, index: holderIndex,
      type: ItemTypes.CARD
    },
    end(item, monitor) {
      const dropResult = monitor.getDropResult()
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  })

  return (
    <div className="d-flex justify-content-start .z-depth-1-half"
      ref={drag}
      style={{ ...style, opacity }}>
      <div className="p-2 col-example text-left"
        style={{ ...style1 }}><i className={"fa fa-" + icon} aria-hidden="true"></i></div>
      <div className="py-2 pl-1 col-example text-left"
        style={{ ...style2 }}>{cardName}</div>
    </div>


  )
}

export default ActionCard