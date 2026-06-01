import { useState, useMemo } from "react";

// ── AyHungry Brand Tokens ──────────────────────────────────────────
const B = {
  blueViolet: "#5852DA", // PRIMARY — dominante
  darkViolet: "#201E48", // fondo oscuro / texto sobre claro
  lightViolet: "#F0F3FD", // fondo claro
  violet: "#AEB9F1", // apoyo
  lemonYellow: "#EFE24C", // acento fuerte
  lightYellow: "#FFF7B0", // acento suave
  tangerine: "#E18A30", // acento cálido
  lightOrange: "#FFD0A6", // acento muy suave
  raspberry: "#E13877", // alerta / peligro
  blueTea: "#4F7FFF", // info / secundario
  lightBlue: "#CDD5F7", // apoyo claro
  greenApple: "#8FA822", // positivo
  lightGreen: "#EAED74", // positivo suave
  potGrey: "#6C6B81", // texto secundario
  medGrey: "#DFDFE3", // bordes claros
  lightGrey: "#F9F9FB", // fondo neutro
};

const UF_VALUE = 40200;

const DASHBOARD_DATA = {
  totalLeads: 313,
  diasActivos: 101,
  promedioDia: 3.1,
  bloques: [
    { label: "00–03h", pct: 10.3 },
    { label: "04–07h", pct: 12.2 },
    { label: "08–11h", pct: 17.3 },
    { label: "12–15h", pct: 13.5 },
    { label: "16–19h", pct: 22.4 },
    { label: "20–23h", pct: 24.4 },
  ],
  wtp: [
    { label: "2–3 UF", pct: 60, color: B.violet },
    { label: "4–8 UF", pct: 28, color: B.blueViolet },
    { label: "+8 UF", pct: 12, color: B.lemonYellow },
  ],
  leadsPorMes: [
    { mes: "Feb", total: 78 },
    { mes: "Mar", total: 83 },
    { mes: "Abr", total: 83 },
    { mes: "May", total: 65 },
  ],
};

function fmt(n) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}
function fmtUF(n) {
  return n.toFixed(1) + " UF";
}

export default function App() {
  const [ejecutivas, setEjecutivas] = useState(2);
  const [leadsDia, setLeadsDia] = useState(5);
  const [cierreMin, setCierreMin] = useState(1);
  const [cierreMax, setCierreMax] = useState(2);
  const [ticket, setTicket] = useState(1.5);
  const [churn, setChurn] = useState(5);
  const [meses, setMeses] = useState(3);
  const [contactabilidad, setContactabilidad] = useState(70);
  const [fallback, setFallback] = useState(5);

  const calc = useMemo(() => {
    const leadsSemanales = DASHBOARD_DATA.promedioDia * 7;
    const capacidadSemanal = ejecutivas * leadsDia * 5;
    const contactosEfect = capacidadSemanal * (contactabilidad / 100);
    const fallbackFactor = 1 - fallback / 100;
    const cierreBase = ((cierreMin + cierreMax) / 2) * fallbackFactor;
    const cierresSemBase = ejecutivas * cierreBase * 5;
    const cierresSemMin = ejecutivas * cierreMin * fallbackFactor * 5;
    const cierresSemMax = ejecutivas * cierreMax * fallbackFactor * 5;
    const mrrMesBase = cierresSemBase * ticket * 4;

    let acumulado = [],
      mrr = 0;
    for (let i = 1; i <= meses; i++) {
      const nuevos = cierresSemBase * ticket * 4;
      const churnAmount = mrr * (churn / 100);
      mrr = Math.max(0, mrr + nuevos - churnAmount);
      acumulado.push({ mes: i, nuevos, churnAmount, mrr });
    }

    const escenarios = [
      {
        label: "Conservador",
        color: B.raspberry,
        cierres: cierresSemMin,
        mrr: cierresSemMin * ticket * 4,
      },
      {
        label: "Base",
        color: B.blueViolet,
        cierres: cierresSemBase,
        mrr: mrrMesBase,
      },
      {
        label: "Optimista",
        color: B.greenApple,
        cierres: cierresSemMax,
        mrr: cierresSemMax * ticket * 4,
      },
    ];

    return {
      leadsSemanales,
      capacidadSemanal,
      contactosEfect,
      cierresSemBase,
      mrrMesBase,
      acumulado,
      escenarios,
    };
  }, [
    ejecutivas,
    leadsDia,
    cierreMin,
    cierreMax,
    ticket,
    churn,
    meses,
    contactabilidad,
    fallback,
  ]);

  // ── Slider component ──────────────────────────────────────────────
  const Slider = ({
    label,
    value,
    min,
    max,
    step = 0.5,
    onChange,
    unit = "",
  }) => (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: B.potGrey,
            fontFamily: "Karla, sans-serif",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: B.lemonYellow,
            fontFamily: "Lato, sans-serif",
          }}
        >
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: B.blueViolet, cursor: "pointer" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        <span style={{ fontSize: 10, color: B.potGrey }}>
          {min}
          {unit}
        </span>
        <span style={{ fontSize: 10, color: B.potGrey }}>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );

  const maxMrr = Math.max(...calc.acumulado.map((a) => a.mrr), 1);
  const maxBloque = Math.max(...DASHBOARD_DATA.bloques.map((b) => b.pct));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: B.darkViolet,
        color: B.lightViolet,
        fontFamily: "Karla, sans-serif",
        padding: "24px 16px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Karla:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { -webkit-appearance: none; height: 3px; border-radius: 2px; background: rgba(88,82,218,0.3); outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${B.blueViolet}; cursor: pointer; box-shadow: 0 0 10px rgba(88,82,218,0.6); }
        .card  { background: rgba(255,255,255,0.04); border: 1px solid rgba(174,185,241,0.12); border-radius: 14px; padding: 20px; }
        .pill  { background: rgba(88,82,218,0.1); border: 1px solid rgba(88,82,218,0.2); border-radius: 8px; padding: 10px 14px; }
        .tag   { display: inline-block; background: rgba(239,226,76,0.12); color: ${B.lemonYellow}; border: 1px solid rgba(239,226,76,0.3); border-radius: 4px; padding: 2px 10px; font-size: 11px; font-family: Karla, sans-serif; letter-spacing: 0.06em; }
        .lbl   { font-size: 11px; color: ${B.potGrey}; letter-spacing: 0.1em; text-transform: uppercase; font-family: Karla, sans-serif; margin-bottom: 14px; }
      `}</style>

      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${B.blueViolet}, ${B.blueTea})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              🍽️
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: B.lemonYellow,
                  fontFamily: "Karla",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                AyHungry · SaaS Gastronómico
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontFamily: "Lato",
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                Proyección Comercial
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              "313 leads reales",
              "Feb–May 2026",
              "3.1 leads/día",
              "UF $40.200",
            ].map((t, i) => (
              <span key={i} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── KPIs reales ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="lbl">— Datos reales del pipeline</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
            }}
          >
            {[
              {
                label: "Leads totales",
                value: "313",
                sub: "101 días activos",
                color: B.lemonYellow,
              },
              {
                label: "Promedio / día",
                value: "3.1",
                sub: "tendencia ↑ 4–6 en mayo",
                color: B.blueViolet,
              },
              {
                label: "Pico horario",
                value: "20–23h",
                sub: "24.4% del total",
                color: B.tangerine,
              },
              {
                label: "Día más fuerte",
                value: "Domingo",
                sub: "17.9% · Lunes 16.6%",
                color: B.blueTea,
              },
            ].map((k, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(88,82,218,0.1)",
                  border: `1px solid rgba(88,82,218,0.2)`,
                  borderRadius: 10,
                  padding: 14,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: B.potGrey,
                    marginBottom: 6,
                    fontFamily: "Karla",
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: k.color,
                    fontFamily: "Lato",
                  }}
                >
                  {k.value}
                </div>
                <div style={{ fontSize: 10, color: B.potGrey, marginTop: 4 }}>
                  {k.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Distribución horaria ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="lbl">— Cuándo llegan los leads</div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              height: 90,
            }}
          >
            {DASHBOARD_DATA.bloques.map((b, i) => {
              const isPeak = b.pct >= 22;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: isPeak ? B.lemonYellow : B.potGrey,
                      fontFamily: "Lato",
                      fontWeight: isPeak ? 700 : 400,
                    }}
                  >
                    {b.pct}%
                  </div>
                  <div
                    style={{
                      width: "100%",
                      borderRadius: "6px 6px 0 0",
                      height: `${(b.pct / maxBloque) * 60}px`,
                      background: isPeak
                        ? `linear-gradient(180deg, ${B.lemonYellow}, ${B.tangerine})`
                        : `rgba(88,82,218,0.35)`,
                      border: `1px solid ${
                        isPeak ? "rgba(239,226,76,0.4)" : "rgba(88,82,218,0.2)"
                      }`,
                      transition: "height 0.4s ease",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 9,
                      color: B.potGrey,
                      textAlign: "center",
                    }}
                  >
                    {b.label}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 12,
              padding: "8px 14px",
              background: `rgba(239,226,76,0.08)`,
              borderRadius: 8,
              border: `1px solid rgba(239,226,76,0.2)`,
            }}
          >
            <span style={{ fontSize: 11, color: B.lemonYellow }}>
              ⚡ El 47% llega después de las 16:00 · El 33% llega fin de semana
              sin ejecutiva disponible
            </span>
          </div>
        </div>

        {/* ── Sliders + Escenarios ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Sliders */}
          <div className="card">
            <div className="lbl">— Parámetros del modelo</div>
            <Slider
              label="Ejecutivas"
              value={ejecutivas}
              min={1}
              max={5}
              step={1}
              onChange={setEjecutivas}
            />
            <Slider
              label="Leads / día por ejecutiva"
              value={leadsDia}
              min={3}
              max={12}
              step={1}
              onChange={setLeadsDia}
            />
            <Slider
              label="Cierres mín / ejecutiva / día"
              value={cierreMin}
              min={0.5}
              max={3}
              step={0.5}
              onChange={setCierreMin}
            />
            <Slider
              label="Cierres máx / ejecutiva / día"
              value={cierreMax}
              min={1}
              max={5}
              step={0.5}
              onChange={setCierreMax}
            />
            <Slider
              label="Ticket promedio"
              value={ticket}
              min={1}
              max={5}
              step={0.25}
              onChange={setTicket}
              unit=" UF"
            />
            <Slider
              label="Contactabilidad"
              value={contactabilidad}
              min={40}
              max={95}
              step={5}
              onChange={setContactabilidad}
              unit="%"
            />
            <Slider
              label="Margen de error / leads sin cierre"
              value={fallback}
              min={0}
              max={40}
              step={5}
              onChange={setFallback}
              unit="%"
            />
            <Slider
              label="Churn mensual"
              value={churn}
              min={0}
              max={20}
              step={1}
              onChange={setChurn}
              unit="%"
            />
            <Slider
              label="Meses a proyectar"
              value={meses}
              min={1}
              max={12}
              step={1}
              onChange={setMeses}
            />

            <div
              style={{
                padding: "10px 12px",
                background: `rgba(88,82,218,0.1)`,
                borderRadius: 8,
                border: `1px solid rgba(88,82,218,0.25)`,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: B.violet,
                  marginBottom: 4,
                  fontFamily: "Lato",
                  fontWeight: 700,
                }}
              >
                ¿Qué es el margen de error?
              </div>
              <div style={{ fontSize: 11, color: B.potGrey, lineHeight: 1.6 }}>
                Leads que parecen cerrados pero no firman — no contestan el
                follow-up o se caen en el último paso. 5% es el mínimo realista.
                Si el equipo es nuevo, usa 15–20%.
              </div>
            </div>
          </div>

          {/* Capacidad + Escenarios */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ flex: 1 }}>
              <div className="lbl">— Capacidad operativa semanal</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  {
                    label: "Leads reales / semana",
                    value: calc.leadsSemanales.toFixed(1),
                    color: B.violet,
                  },
                  {
                    label: "Capacidad del equipo / semana",
                    value: calc.capacidadSemanal,
                    color: B.blueViolet,
                  },
                  {
                    label: "Contactos efectivos / semana",
                    value: Math.round(calc.contactosEfect),
                    color: B.lemonYellow,
                  },
                  {
                    label: "Leads fin de semana sin contacto",
                    value: Math.round(calc.leadsSemanales * 0.332),
                    color: B.raspberry,
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="pill"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 12, color: B.potGrey }}>
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: r.color,
                        fontFamily: "Lato",
                      }}
                    >
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ flex: 1 }}>
              <div className="lbl">— Escenarios mensuales</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {calc.escenarios.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${e.color}44`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      background: `${e.color}10`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: e.color,
                            fontFamily: "Karla",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                          }}
                        >
                          {e.label}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: B.potGrey,
                            marginTop: 2,
                          }}
                        >
                          {e.cierres.toFixed(0)} cierres · {fmtUF(e.mrr / 4)}
                          /semana
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 900,
                            color: e.color,
                            fontFamily: "Lato",
                          }}
                        >
                          {fmtUF(e.mrr)}
                        </div>
                        <div style={{ fontSize: 11, color: B.potGrey }}>
                          {fmt(e.mrr * UF_VALUE)}/mes
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── MRR Acumulado ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="lbl">
            — MRR acumulado · escenario base · churn {churn}% · margen error{" "}
            {fallback}%
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(meses, 6)}, 1fr)`,
              gap: 10,
            }}
          >
            {calc.acumulado.slice(0, 6).map((m, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 11,
                    color: B.potGrey,
                    marginBottom: 8,
                    fontFamily: "Karla",
                  }}
                >
                  Mes {m.mes}
                </div>
                <div
                  style={{
                    height: 80,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px 8px 0 0",
                    border: `1px solid rgba(88,82,218,0.2)`,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${(m.mrr / maxMrr) * 100}%`,
                      minHeight: 4,
                      background: `linear-gradient(180deg, ${B.blueViolet}, ${B.blueTea})`,
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.5s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: "8px 6px",
                    background: "rgba(88,82,218,0.1)",
                    borderRadius: "0 0 8px 8px",
                    border: `1px solid rgba(88,82,218,0.2)`,
                    borderTop: "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: B.lemonYellow,
                      fontFamily: "Lato",
                    }}
                  >
                    {fmtUF(m.mrr)}
                  </div>
                  <div style={{ fontSize: 10, color: B.potGrey, marginTop: 2 }}>
                    {fmt(m.mrr * UF_VALUE)}
                  </div>
                  {churn > 0 && (
                    <div
                      style={{ fontSize: 9, color: B.raspberry, marginTop: 2 }}
                    >
                      -{fmtUF(m.churnAmount)} churn
                    </div>
                  )}
                </div>
              </div>
            ))}
            {meses > 6 && (
              <div
                style={{
                  gridColumn: "1/-1",
                  padding: 14,
                  background: "rgba(88,82,218,0.1)",
                  borderRadius: 10,
                  border: `1px solid rgba(88,82,218,0.25)`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: B.potGrey }}>
                  MRR al mes {meses}
                </span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: B.lemonYellow,
                    fontFamily: "Lato",
                  }}
                >
                  {fmtUF(calc.acumulado[meses - 1]?.mrr || 0)}
                </span>
                <span style={{ fontSize: 14, color: B.violet }}>
                  {fmt((calc.acumulado[meses - 1]?.mrr || 0) * UF_VALUE)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── KPIs por ejecutiva ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="lbl">— KPIs por ejecutiva · objetivo semanal</div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  {["KPI", "Mínimo", "Base", "Óptimo"].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: i === 0 ? "left" : "right",
                        padding: "8px 12px",
                        color: B.potGrey,
                        fontFamily: "Karla",
                        fontSize: 11,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        borderBottom: `1px solid rgba(174,185,241,0.12)`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Leads contactados/semana",
                    `${Math.round(leadsDia * 5 * 0.6)}`,
                    `${Math.round(leadsDia * 5 * 0.7)}`,
                    `${Math.round(leadsDia * 5 * 0.85)}`,
                  ],
                  [
                    "Demos agendadas/semana",
                    `${Math.round(cierreMin * 5 * 1.5)}`,
                    `${Math.round(((cierreMin + cierreMax) / 2) * 5 * 1.5)}`,
                    `${Math.round(cierreMax * 5 * 1.5)}`,
                  ],
                  [
                    "Cierres/semana",
                    `${Math.round(cierreMin * 5 * (1 - fallback / 100))}`,
                    `${Math.round(
                      ((cierreMin + cierreMax) / 2) * 5 * (1 - fallback / 100)
                    )}`,
                    `${Math.round(cierreMax * 5 * (1 - fallback / 100))}`,
                  ],
                  [
                    "UF cerrada/semana",
                    fmtUF(cierreMin * 5 * (1 - fallback / 100) * ticket),
                    fmtUF(
                      ((cierreMin + cierreMax) / 2) *
                        5 *
                        (1 - fallback / 100) *
                        ticket
                    ),
                    fmtUF(cierreMax * 5 * (1 - fallback / 100) * ticket),
                  ],
                  [
                    "MRR aportado/mes",
                    fmtUF(cierreMin * 20 * (1 - fallback / 100) * ticket),
                    fmtUF(
                      ((cierreMin + cierreMax) / 2) *
                        20 *
                        (1 - fallback / 100) *
                        ticket
                    ),
                    fmtUF(cierreMax * 20 * (1 - fallback / 100) * ticket),
                  ],
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `1px solid rgba(174,185,241,0.06)` }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        color: B.potGrey,
                        fontFamily: "Karla",
                      }}
                    >
                      {row[0]}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        color: B.raspberry,
                        fontFamily: "Lato",
                        fontWeight: 700,
                      }}
                    >
                      {row[1]}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        color: B.blueViolet,
                        fontFamily: "Lato",
                        fontWeight: 700,
                      }}
                    >
                      {row[2]}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        color: B.greenApple,
                        fontFamily: "Lato",
                        fontWeight: 700,
                      }}
                    >
                      {row[3]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── WTP + Qué es MRR ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div className="card">
            <div className="lbl">— Disposición de pago declarada</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DASHBOARD_DATA.wtp.map((w, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: w.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color:
                          w.color === B.lemonYellow ? B.darkViolet : "#fff",
                        fontFamily: "Lato",
                      }}
                    >
                      {w.pct}%
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#fff",
                        fontFamily: "Lato",
                      }}
                    >
                      {w.label}
                    </div>
                    <div style={{ fontSize: 11, color: B.potGrey }}>
                      de los leads
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${w.pct}%`,
                        height: "100%",
                        background: w.color,
                        borderRadius: 2,
                        transition: "width 0.5s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: `rgba(143,168,34,0.1)`,
                borderRadius: 8,
                border: `1px solid rgba(143,168,34,0.25)`,
              }}
            >
              <span style={{ fontSize: 11, color: B.lightGreen }}>
                💡 El 40% declara +4 UF. Tratarlos igual que el resto deja MRR
                sobre la mesa.
              </span>
            </div>
          </div>

          <div
            className="card"
            style={{
              border: `1px solid rgba(239,226,76,0.2)`,
              background: "rgba(239,226,76,0.03)",
            }}
          >
            <div className="lbl" style={{ color: B.lemonYellow }}>
              — ¿Qué es el MRR?
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: B.lemonYellow,
                marginBottom: 8,
                fontFamily: "Lato",
              }}
            >
              Monthly Recurring Revenue — ingreso mensual que se repite
            </div>
            <div
              style={{
                fontSize: 12,
                color: B.potGrey,
                lineHeight: 1.7,
                marginBottom: 12,
              }}
            >
              No es una venta única. Es la plata que entra{" "}
              <b style={{ color: B.lightViolet }}>todos los meses</b> mientras
              el restaurante siga activo como cliente. Cada cierre suma
              permanentemente al total.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                {
                  label: "MRR nuevo",
                  desc: "Lo que suman los cierres de este mes",
                  color: B.greenApple,
                },
                {
                  label: "MRR perdido",
                  desc: "Lo que se va si un cliente cancela (churn)",
                  color: B.raspberry,
                },
                {
                  label: "MRR neto",
                  desc: "Nuevo − perdido = crecimiento real",
                  color: B.blueViolet,
                },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: r.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: r.color,
                      fontFamily: "Lato",
                    }}
                  >
                    {r.label}:
                  </span>
                  <span style={{ fontSize: 12, color: B.potGrey }}>
                    {r.desc}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                background: "rgba(88,82,218,0.12)",
                borderRadius: 8,
                border: `1px solid rgba(88,82,218,0.25)`,
              }}
            >
              <span
                style={{ fontSize: 11, color: B.violet, fontFamily: "Karla" }}
              >
                Ejemplo: Cierras 60 restaurantes × 1.5 UF →{" "}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: B.lemonYellow,
                  fontFamily: "Lato",
                }}
              >
                90 UF MRR = {fmt(90 * 40200)}
              </span>
              <span style={{ fontSize: 11, color: B.potGrey }}>
                {" "}
                cada mes, sin vender nada nuevo.
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            textAlign: "center",
            padding: "14px 0",
            color: B.potGrey,
            fontSize: 11,
            fontFamily: "Karla",
            borderTop: `1px solid rgba(174,185,241,0.08)`,
          }}
        >
          AyHungry · Proyección sobre 313 leads reales Feb–May 2026 · Ajusta los
          parámetros en vivo durante la reunión
        </div>
      </div>
    </div>
  );
}
