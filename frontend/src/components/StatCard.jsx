const StatCard = ({ icon, value, label, iconBg, iconColor }) => {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{
          background: iconBg || "rgba(99, 102, 241, 0.1)",
          color: iconColor || "#6366f1",
        }}
      >
        {icon}
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;

