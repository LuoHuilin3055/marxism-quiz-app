interface StatsCardProps {
  label: string;
  value: string | number;
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="stats-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
