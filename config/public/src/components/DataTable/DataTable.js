import React, { Component, Fragment } from 'react'
import { Pagination, Table } from "reactstrap";
import PaginationFooter from '../PaginationFooter';

import "./index.css"

class DataTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            isPagination: false,
            PageNo: 0,
            totalCount: 0,
            PageRecord: 0,
            DataCount: 0
        };
    }

    componentDidMount() {
        this.onloadState(this.props)
    }

    componentWillReceiveProps(props) {
        this.onloadState(props)
    }

    onloadState(props) {
        if (props.pagination) {
            const { PageNo, totalCount, PageRecord, DataCount } = props.pagination;
             this.setState({
                data: props.data,
                isPagination: true,
                PageNo: PageNo,
                totalCount: totalCount,
                PageRecord: PageRecord,
                DataCount: DataCount
            });
        } else {
            this.setState({ data: props.data });
        }
    }

    render() {
        const { PageNo, totalCount, PageRecord, DataCount, isPagination,data } = this.state;
       
        if (data && data.columns && data.rows) {
            return (
                <>
                    <div className="table-responsive">
                        <div className="table-wrapper">
                            <Table className="table-centered table-hover">
                                <thead className="thead-light">
                                    <tr>
                                        <th> # </th>
                                        {data.columns.map((x, i) => <th key={i}>{x.label}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.rows.map((y, i) => {
                                        return (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                {data.columns.map((x, i) => <td key={i}>{y[x.field]}</td>)}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>

                    {(isPagination && DataCount != 0) &&
                        <PaginationFooter
                            initialPage={PageNo}
                            totalCount={totalCount}
                            pageRecord={PageRecord}
                            DataCount={DataCount}
                            onEvent={(page) => this.props.pagination.onEventPage({ "PageNo": page.currentPage, "search": '', "PageRecord": PageRecord })} />
                    }
                </>
            )
        } else {
            return false
        }
    }
}

export default DataTable