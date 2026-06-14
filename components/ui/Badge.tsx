interface BadgeProps {
  status: "active" | "paused" | "revoked" | "pending";
  pulse?: boolean;
  children: React.ReactNode;
}

export default function Badge({ status, pulse, children }: BadgeProps) {
  return (
    <span className={`badge badge-${status}`}>
      {pulse && <span className="badge-dot" />}
      {children}
    </span>
  );
}
