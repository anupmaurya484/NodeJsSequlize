import React, { useState, useEffect } from 'react';
import { Row, Col, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import paginate from '../../utils/jw-paginate'

let totalCount = 0;
const PaginationFooter = (props) => {

    const [maxPages, setmaxPages] = useState(10);
    const [pager, setpager] = useState(null);

    useEffect(() => {
        setPage(props.initialPage, true)
    }, [])

    useEffect(() => {
        if (props.totalCount != totalCount) {
            setPage(props.initialPage, true)
            totalCount = props.totalCount
        }
    }, [props])


    const setPage = (page, type) => {
        let pager = paginate(props.totalCount, page, props.pageRecord, maxPages);
        setpager(pager)
        if (!type) {
            props.onEvent(pager)
        }
    }


    return (
        <Row>
            <Col sm="7" lg="7">
                <div className="hint-text">Showing <b>{((props.initialPage * 10) - 10) + props.DataCount}</b> out of <b>{props.totalCount}</b> entries</div>
            </Col>
            <Col sm="5" lg="5">
                {pager &&
                    <Pagination className="pagination pagination-rounded justify-content-center">
                        <PaginationItem disabled={pager.currentPage == 1} onClick={() => setPage(1)} ><PaginationLink >First</PaginationLink></PaginationItem>
                        <PaginationItem disabled={pager.currentPage === 1}><PaginationLink previous onClick={() => setPage(pager.currentPage - 1)} /></PaginationItem>
                        {pager.pages.map((page, index) => (
                            <PaginationItem key={index} active={pager.currentPage === page} onClick={() => setPage(page)}> <PaginationLink >{page}</PaginationLink></PaginationItem>
                        ))}
                        <PaginationItem><PaginationLink disabled={pager.currentPage === pager.totalPages} next onClick={() => setPage(pager.currentPage + 1)} /></PaginationItem>
                        <PaginationItem disabled={pager.currentPage == pager.totalPages} onClick={() => setPage(pager.totalPages)} ><PaginationLink >Last </PaginationLink ></PaginationItem>
                    </Pagination >
                }
            </Col>
        </Row>

    );
}

export default PaginationFooter;