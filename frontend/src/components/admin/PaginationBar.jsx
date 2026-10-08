import React from 'react';

export default function PaginationBar({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [15, 25, 50, 100]
}) {
  if (totalItems <= 0) return null;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      borderBottomLeftRadius: '10px',
      borderBottomRightRadius: '10px',
      flexWrap: 'wrap',
      gap: '10px',
      fontSize: '12px',
      color: '#475569'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>
          Mostrando <strong style={{ color: '#0f172a' }}>{startItem} - {endItem}</strong> de <strong style={{ color: '#0f172a' }}>{totalItems}</strong>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#64748b' }}>Por pág:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            style={{
              padding: '2px 6px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              fontSize: '11.5px',
              fontWeight: '600',
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            {pageSizeOptions.map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          style={{
            padding: '3px 7px',
            borderRadius: '5px',
            border: '1px solid #e2e8f0',
            background: currentPage === 1 ? '#f8fafc' : '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#334155',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            fontWeight: '600'
          }}
          title="Primera página"
        >
          ⏮
        </button>
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '3px 8px',
            borderRadius: '5px',
            border: '1px solid #e2e8f0',
            background: currentPage === 1 ? '#f8fafc' : '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#334155',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            fontWeight: '600'
          }}
          title="Página anterior"
        >
          ◀
        </button>

        {pages[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              style={{
                padding: '3px 8px',
                borderRadius: '5px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#334155',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              1
            </button>
            {pages[0] > 2 && <span style={{ padding: '0 2px', color: '#94a3b8' }}>...</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            style={{
              padding: '3px 9px',
              borderRadius: '5px',
              border: p === currentPage ? '1.5px solid #0fa4de' : '1px solid #e2e8f0',
              background: p === currentPage ? '#0fa4de' : '#ffffff',
              color: p === currentPage ? '#ffffff' : '#334155',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: p === currentPage ? '800' : '600',
              boxShadow: p === currentPage ? '0 1px 4px rgba(15, 164, 222, 0.3)' : 'none'
            }}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span style={{ padding: '0 2px', color: '#94a3b8' }}>...</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              style={{
                padding: '3px 8px',
                borderRadius: '5px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#334155',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '3px 8px',
            borderRadius: '5px',
            border: '1px solid #e2e8f0',
            background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
            color: currentPage === totalPages ? '#cbd5e1' : '#334155',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            fontWeight: '600'
          }}
          title="Página siguiente"
        >
          ▶
        </button>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          style={{
            padding: '3px 7px',
            borderRadius: '5px',
            border: '1px solid #e2e8f0',
            background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
            color: currentPage === totalPages ? '#cbd5e1' : '#334155',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            fontWeight: '600'
          }}
          title="Última página"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
