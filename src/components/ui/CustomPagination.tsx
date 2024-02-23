"use client";
import React, { Dispatch, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ReactPaginate from "react-paginate";

// Example items, to simulate fetching from another resources.

function Items({ currentItems }: any) {
  return (
    <>
      {currentItems &&
        currentItems.map((item: any) => (
          <div>
            <h3>Item #{item}</h3>
          </div>
        ))}
    </>
  );
}

export default function PaginatedItems({
  itemsPerPage,
  totalPage,
  currentPage,
  setCurrentPage,
}: {
  itemsPerPage: number;
  totalPage: number;
  currentPage: number;
  setCurrentPage: any;
}) {
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.

  // Simulate fetching items from another resources.
  // (This could be items from props; or items loaded in a local state
  // from an API endpoint with useEffect and useState)
  // Start with the first page (0-indexed)

  const offset = currentPage * itemsPerPage;

  const handlePageClick = ({ selected }: any) => {
    setCurrentPage(selected + 1);
  };

  return (
    <div className="pagination-container">
      <ReactPaginate
        breakLabel="..."
        nextLabel=" >"
        onPageChange={handlePageClick}
        marginPagesDisplayed={1}
        pageCount={totalPage}
        previousLabel="< "
        renderOnZeroPageCount={null}
        containerClassName="pagination"
        pageClassName="pagination-item"
        activeClassName="active"
        previousClassName={`pagination-previous ${
          currentPage === 0 ? "disabled" : ""
        }`} // Disable previous button when on the first page
        nextClassName={`pagination-next ${
          currentPage === totalPage - 1 ? "disabled" : ""
        }`} // Disable next button when on the last page
      />
    </div>
  );
}
