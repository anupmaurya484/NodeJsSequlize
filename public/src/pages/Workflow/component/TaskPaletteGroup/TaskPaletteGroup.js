import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TaskPaletteGroup.scss';
import logger from '../../helper/logger.helper';
import { config }  from '../../../../utils/workflow.config';
class TaskPaletteGroup extends Component {
    constructor (props) {
        super(props);
        this.state = {
            display: false
        }
    }

    render () {
        let group = this.props.group;
        return (
            <div className="task-parent-wrapper unselectable" >
                <div className="task-parent-header unselectable" onClick={() => this.setState({display: !this.state.display})}>
                    <div className={`task-parent-icon fa ${this.state.display ? 'fa-chevron-down' : 'fa-chevron-right'}`}
                    onClick={() => this.setState({display: !this.state.display})}/>
                    <div className="task-parent-title unselectable" >{this.props.name}</div>
                </div>
                <div className={`task-parent-symbols ${this.state.display ? '' : 'hide'}`}>
                {
                    Object.keys(group).filter(t => {return group[t].enabled? true: false }).map(s => {
                        return (
                            <div
                            key={group[s].name}
                            datatype={JSON.stringify({type: s, parent: this.props.name})}
                            draggable={true}
                            className={`task-palette-item task-palette-temp unselectable active ${(!this.props.search || group[s].title.toLowerCase().indexOf(this.props.search.toLowerCase()) >= 0) ? '' : 'hide'}`} >
                                <div className={`task-palette-icon fa fa-${group[s].icon} unselectable`} />
                                <div className="task-palette-title unselectable tooltip-block" data-toggle="tooltip" title={group[s].title}>
                                    {group[s].title}
                                </div>
                            </div>
                        )
                    })
                }
                </div>
            </div>
        )
    }
}
TaskPaletteGroup.propTypes = {
    group: PropTypes.object,
    search: PropTypes.string,
    name: PropTypes.string
}

TaskPaletteGroup.defaultProps = {

}


export default TaskPaletteGroup;
