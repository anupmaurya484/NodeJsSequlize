import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TaskPalette.scss';
import logger from '../../helper/logger.helper';
import { config } from '../../../../utils/workflow.config';

import TaskPaletteGroup from '../TaskPaletteGroup';

class TaskPalette extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: ''
        }
        this.handleToggle = this.handleToggle.bind(this);
    }

    handleToggle() {
        if (this.props.isDisplay) {
            document.getElementById('task-palette-container').style.left = 0;
        }
        this.props.toggle();
    }

    render() {
        return (
            <div id="task-palette-container" >
                <div id="task-palette-inner" className={`${this.props.isDisplay ? '' : 'minimize'}`}>
                    <div id="task-palette-minimize" onClick={this.handleToggle}><span className={`fa fa-${this.props.isDisplay ? 'chevron-left' : 'chevron-right'}`} /></div>
                    <div className={`${this.props.isDisplay ? '' : 'hide'}`}>
                        <div id="task-palette-wrapper">
                            <div id="task-palette-search-wrapper">
                                <div className="topnav-search">
                                    <div className="search-container d-flex">
                                        <button type="submit"><i className="fa fa-search"></i></button>
                                        <input value={this.state.search} onChange={e => this.setState({ search: e.target.value })} type="text" placeholder="Search.." name="search" />
                                    </div>
                                </div>
                            </div>
                            {
                                Object.keys(config.taskType).map(key => <TaskPaletteGroup search={this.state.search} group={config.taskType[key]} name={key} key={key} />)
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
TaskPalette.propTypes = {
    isDisplay: PropTypes.bool,
    left: PropTypes.number,
    top: PropTypes.number,
    onClick: PropTypes.func,
    toggle: PropTypes.func,
    isActive: PropTypes.bool
}

TaskPalette.defaultProps = {

}


export default TaskPalette;
