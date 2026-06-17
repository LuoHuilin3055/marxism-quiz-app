interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
}

export default function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const percent = max ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className="progress-block">
      <div className="progress-head">
        <span>{label}</span>
        <strong>{percent}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
