const TYPE_STYLES = {
  success: { bg: "#ecfdf5", border: "#10b981", text: "#065f46", icon: "✓" },
  error: { bg: "#fef2f2", border: "#ef4444", text: "#991b1b", icon: "✕" },
  warning: { bg: "#fffbeb", border: "#f59e0b", text: "#92400e", icon: "!" },
  info: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af", icon: "i" },
};

function ToastItem({ toast, onDismiss }) {
  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        minWidth: 260,
        maxWidth: 360,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderLeft: `4px solid ${style.border}`,
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        animation: "toast-in 0.25s ease-out",
        pointerEvents: "auto",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: style.border,
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {style.icon}
      </div>

      <div style={{ flex: 1, fontSize: 14, color: style.text, lineHeight: 1.4 }}>
        {toast.title}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Đóng thông báo"
        style={{
          flexShrink: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: style.text,
          fontSize: 14,
          lineHeight: 1,
          padding: 2,
          opacity: 0.6,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
      >
        ✕
      </button>
    </div>
  );
}

export default ToastItem;