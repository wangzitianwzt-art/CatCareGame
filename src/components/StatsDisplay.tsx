import "../styles/stats-display.css";

interface StatsDisplayProps {
  hunger: number;
  tiredness: number;
  cleanliness: number;
  catFood: number;
}

export function StatsDisplay({
  hunger,
  tiredness,
  cleanliness,
  catFood,
}: StatsDisplayProps) {
  const getHungerIcon = () => {
    if (hunger >= 70) return "😠";
    if (hunger >= 40) return "😐";
    return "😊";
  };

  const getTirednessIcon = () => {
    if (tiredness >= 80) return "😴";
    if (tiredness >= 50) return "😑";
    return "😄";
  };

  const getCleanlinessIcon = () => {
    if (cleanliness <= 30) return "🤢";
    if (cleanliness <= 60) return "😕";
    return "✨";
  };

  return (
    <div className="stats-display">
      <div className="stat-item">
        <div className="stat-label">饥饿</div>
        <div className="stat-bubble hunger">
          <div className="stat-icon">{getHungerIcon()}</div>
          <div className="stat-value">{Math.round(hunger)}</div>
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">疲惫</div>
        <div className="stat-bubble tiredness">
          <div className="stat-icon">{getTirednessIcon()}</div>
          <div className="stat-value">{Math.round(tiredness)}</div>
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">清洁</div>
        <div className="stat-bubble cleanliness">
          <div className="stat-icon">{getCleanlinessIcon()}</div>
          <div className="stat-value">{Math.round(cleanliness)}</div>
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">猫粮</div>
        <div className="stat-bubble food">
          <span className="stat-icon">🍖</span>
          <span className="stat-value">{catFood}</span>
        </div>
      </div>
    </div>
  );
}
