import Button from "../../../components/common/Button/Button.jsx";

const Pagination = ({ pagination = {}, onPageChange }) => {
  const current = pagination.currentPage || 1;
  const total = pagination.totalPages || 1;
  const pages = Array.from({ length: Math.min(total, 5) }, (_, index) => Math.max(1, Math.min(total - 4, current - 2)) + index)
    .filter((page, index, list) => page <= total && list.indexOf(page) === index);

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row">
      <p className="text-sm text-slate-600">Page {current} of {total}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" disabled={!pagination.previousPage} onClick={() => onPageChange(pagination.previousPage)}>Previous</Button>
        {pages.map((page) => (
          <button
            key={page}
            className={`focus-ring min-h-10 min-w-10 rounded-lg px-3 text-sm font-semibold ${page === current ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <Button variant="secondary" disabled={!pagination.nextPage} onClick={() => onPageChange(pagination.nextPage)}>Next</Button>
      </div>
    </div>
  );
};

export default Pagination;
