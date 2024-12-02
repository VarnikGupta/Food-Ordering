import React from "react";
import css from "./Pagination.module.css";

const Pagination = ({ totalItems, currentPage, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={css.pagination}>
      <div className={css.info}>
        Showing {(currentPage - 1) * pageSize + 1}-
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
      </div>
      <div className={css.pageNumbers}>
        <button
          className={css.navButton}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            className={`${css.pageNumber} ${
              page === currentPage ? css.active : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className={css.navButton}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
