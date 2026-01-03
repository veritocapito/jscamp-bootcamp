

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const stylePrevButton = isFirstPage ? { pointerEvents: "none", opacity: 0.5 } : {};
  const styleNextButton = isLastPage ? { pointerEvents: "none", opacity: 0.5 } : {};

  const handlePrevClick = (e) => {
    e.preventDefault();
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handleChangePage = (page, e) => {
    e.preventDefault();
    if (page !== currentPage) {
      onPageChange(page);
    }
  }

  return (
    <nav className="pagination">
      <a href="#" style={stylePrevButton} onClick={handlePrevClick}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15 6l-6 6l6 6" />
        </svg>
      </a>

      {pages.map(page => (
        <a
          key={page}
          href="#"
          className={page === currentPage ? "is-active" : ""}
          onClick={(e) => handleChangePage(page, e)}
        >
          {page}
        </a>
      ))}

      <a href="#" style={styleNextButton} onClick={handleNextClick}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 6l6 6l-6 6" />
        </svg>
      </a>
    </nav>
  );
};

export default Pagination;
