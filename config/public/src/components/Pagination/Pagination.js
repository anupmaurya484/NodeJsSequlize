import React, { useState, useEffect } from "react";
import { Pagination, PaginationItem } from 'reactstrap';
import { shallowEqual } from "react-redux";


class Paginato extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            items: []
        }
    }

    componentDidMount = () => {
        this.updatePagination()
    }

    updatePagination = () => {
        let items = [];
        let totalPage = Math.ceil(this.props.length / this.props.pageSize);
        for (let number = 1; number <= totalPage; number++) {
            items.push(<PaginationItem  onClick={()=>this.props.onClick(number)} className="btn-default btn btn-secondary btn-sm ml-1" tag='button'  key={number} active={number == this.props.active}>{number}</PaginationItem>);
        }
        this.setState({items : items})
    }

    componentDidUpdate(prevProps) {
        if (this.props.active !== prevProps.active)
        {
            this.updatePagination()
        }
    }

   render() {
       
    return (
        <Pagination size='sm'>{this.state.items}</Pagination>
    )
   }
}

export default Paginato;