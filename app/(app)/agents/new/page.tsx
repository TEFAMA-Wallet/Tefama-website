"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Bot } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { usd } from "@/lib/data";

const STRATEGIES = ["DCA", "Buy-the-dip", "Grid Trading", "Momentum"];
const DURATIONS = ["6h", "12h", "24h", "3d", "7d", "30d"];

const STEP_LABELS = ["Strategy", "Budget", "Parameters", "Review"];

export default function CreateAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [deploying, setDeploying] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "", strategy: "DCA", budget: 500, duration: "24h", slippage: 0.5, agreed: false,
  });

  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const risk = form.budget > 1500 || form.strategy === "Grid Trading" ? "High" : form.budget > 600 ? "Medium" : "Low";
  const riskColor = risk === "High" ? "var(--ember-500)" : risk === "Medium" ? "var(--orange-400)" : "var(--orange-300)";

  const deploy = () => {
    setDeploying(true);
    setTimeout(() => { setDeploying(false); setDone(true); }, 1500);
  };

  if (done) {
    return (
      <>
        <TopBar crumbs={[{ label: "My agents", path: "/agents" }, { label: "Create agent" }]} />
        <div className="page" style={{ maxWidth: 560 }}>
          <Card variant="raised" glow className="rise" style={{ textAlign: "center", padding: 44, marginTop: 20 }}>
            <div className="auth-orb" style={{ animation: "none" }}><Check size={48} /></div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Agent deployed</h2>
            <p className="txt-sec" style={{ marginBottom: 24, fontSize: 14 }}>
              {form.name || "Your agent"} is live and trading within its on-chain policy.
            </p>
            <Card style={{ textAlign: "left", padding: "4px 18px", marginBottom: 24 }}>
              <div className="dl">
                {[["Strategy", form.strategy], ["Budget", usd(form.budget)], ["Duration", form.duration]].map(([k, v]) => (
                  <div key={k} className="r"><span className="k">{k}</span><span className="v">{v}</span></div>
                ))}
              </div>
            </Card>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" block onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
              <Button variant="primary" block onClick={() => router.push("/agents")}>View agents</Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar crumbs={[{ label: "My agents", path: "/agents" }, { label: "Create agent" }]} />
      <div className="page" style={{ maxWidth: 640 }}>
        <div className="wizard-steps" style={{ marginTop: 8, marginBottom: 28 }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} className={`wizard-step${i === step ? " active" : i < step ? " done" : ""}`}>
              <div className="ws-dot">
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <div className="ws-label">{label}</div>
            </div>
          ))}
        </div>

        <Card variant="raised" style={{ padding: 32 }}>
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Choose a strategy</h2>
              <div className="form-group">
                <label className="form-label">Agent name</label>
                <input className="form-input" placeholder="e.g. SUI Accumulator" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Strategy</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {STRATEGIES.map((s) => (
                    <button key={s} onClick={() => set("strategy", s)} style={{
                      padding: "14px 16px", borderRadius: 10, textAlign: "left",
                      background: form.strategy === s ? "var(--brand-tint)" : "var(--ink-a04)",
                      border: `1px solid ${form.strategy === s ? "var(--orange-400)" : "var(--border-subtle)"}`,
                      color: form.strategy === s ? "var(--orange-400)" : "var(--text-primary)",
                      fontWeight: 500, fontSize: 14,
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Set your budget</h2>
              <div className="form-group">
                <label className="form-label">Budget (USDC)</label>
                <input className="form-input" type="number" min="10" max="10000" value={form.budget}
                  onChange={(e) => set("budget", Number(e.target.value))}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 18 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DURATIONS.map((d) => (
                    <button key={d} onClick={() => set("duration", d)} style={{
                      padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                      background: form.duration === d ? "var(--brand-tint)" : "var(--ink-a04)",
                      border: `1px solid ${form.duration === d ? "var(--orange-400)" : "var(--border-subtle)"}`,
                      color: form.duration === d ? "var(--orange-400)" : "var(--text-primary)",
                    }}>{d}</button>
                  ))}
                </div>
              </div>
              <Card style={{ padding: 16, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Risk level</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: riskColor }}>{risk}</span>
                </div>
              </Card>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Parameters</h2>
              <div className="form-group">
                <label className="form-label">Max slippage (%)</label>
                <input className="form-input" type="number" step="0.1" min="0.1" max="5" value={form.slippage}
                  onChange={(e) => set("slippage", Number(e.target.value))} />
              </div>
              <Card style={{ padding: 16 }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  With <strong style={{ color: "var(--text-primary)" }}>{form.strategy}</strong>, the agent will execute trades automatically within your $<strong style={{ color: "var(--text-primary)" }}>{form.budget}</strong> budget over <strong style={{ color: "var(--text-primary)" }}>{form.duration}</strong>, never exceeding {form.slippage}% slippage per trade.
                </p>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Review & deploy</h2>
              <Card style={{ padding: "4px 18px", marginBottom: 20 }}>
                <div className="dl">
                  {[
                    ["Name", form.name || "Unnamed agent"],
                    ["Strategy", form.strategy],
                    ["Budget", usd(form.budget)],
                    ["Duration", form.duration],
                    ["Max slippage", form.slippage + "%"],
                    ["Risk", risk],
                  ].map(([k, v]) => (
                    <div key={k} className="r">
                      <span className="k">{k}</span>
                      <span className="v" style={k === "Risk" ? { color: riskColor } : {}}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: 20 }}>
                <input type="checkbox" checked={form.agreed} onChange={(e) => set("agreed", e.target.checked)} style={{ marginTop: 2 }} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  I understand this agent will trade autonomously within the budget and limits above. I can revoke it at any time.
                </span>
              </label>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 3 && (
              <Button variant="primary" block={step === 0} onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            )}
            {step === 3 && (
              <Button variant="primary" block onClick={deploy} disabled={!form.agreed || deploying}
                icon={deploying ? undefined : <Bot size={18} />}>
                {deploying ? "Deploying…" : "Deploy agent"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
