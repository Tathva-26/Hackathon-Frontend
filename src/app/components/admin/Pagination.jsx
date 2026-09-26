import styles from "../admin.module.css";

export default function Pagination({ pagination, page, onPage, summary }) {
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total ?? 0;
  return (
    <div className={styles.pagination}>
      <span>{summary || `${total.toLocaleString("en-IN")} ${total === 1 ? "record" : "records"}`}</span>
      <div>
        <button aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          ‹
        </button>
        <strong>
          Page {Math.min(page, totalPages)} of {totalPages}
        </strong>
        <button aria-label="Next page" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          ›
        </button>
      </div>
    </div>
  );
}
