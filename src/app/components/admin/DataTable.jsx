import styles from "../admin.module.css";

// columns: [{ key, header, render(row), align? }]
export default function DataTable({
  columns,
  rows,
  loading,
  error,
  onRetry,
  onRowClick,
  selectedId,
  rowKey = (row) => row.id,
  emptyTitle = "Nothing here yet.",
  emptyText = "Try a different search or filter.",
}) {
  if (error && rows.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <div className={styles.tableState}>
          <strong>Could not load.</strong>
          <span>{error.message}</span>
          {onRetry && (
            <button className={styles.secondaryButton} onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <div className={styles.tableState}>
          {loading ? (
            <span>Loading…</span>
          ) : (
            <>
              <strong>{emptyTitle}</strong>
              <span>{emptyText}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.tableWrap} ${loading ? styles.tableLoading : ""}`}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.align ? { textAlign: column.align } : undefined}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = rowKey(row);
            return (
              <tr
                key={id}
                className={`${onRowClick ? styles.clickable : ""} ${selectedId === id ? styles.selectedRow : ""}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} style={column.align ? { textAlign: column.align } : undefined}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
