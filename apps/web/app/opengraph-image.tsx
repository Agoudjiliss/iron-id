import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "IronID — The Gold Standard for Digital Truth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Gold glow top */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(212,175,55,0.18) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        {/* Purple glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "500px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Grid dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", zIndex: 1, padding: "0 80px", textAlign: "center" }}>
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(212,175,55,0.3)",
              background: "rgba(212,175,55,0.08)",
              color: "#D4AF37",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            ◆ Norme C2PA · Certification Cryptographique
          </div>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                background: "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.4)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🛡
            </div>
            <span style={{ fontSize: "42px", fontWeight: 900, color: "#FAFAFA", letterSpacing: "-1px" }}>
              Iron<span style={{ color: "#D4AF37" }}>ID</span>
            </span>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p
              style={{
                fontSize: "54px",
                fontWeight: 900,
                color: "#FAFAFA",
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
              }}
            >
              The Gold Standard
            </p>
            <p
              style={{
                fontSize: "54px",
                fontWeight: 900,
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
                background: "linear-gradient(90deg, #D4AF37, #F5D078, #D4AF37)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              for Digital Truth.
            </p>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: "20px",
              color: "rgba(250,250,250,0.45)",
              margin: 0,
              maxWidth: "700px",
              lineHeight: 1.5,
            }}
          >
            Certifiez l'authenticité de vos fichiers avec une signature cryptographique C2PA.
            Vérifiable publiquement, pour toujours.
          </p>

          {/* Trust pills */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {["Adobe · Microsoft · Google", "BBC · Reuters · AP", "Sony · Nikon · Canon"].map((t) => (
              <div
                key={t}
                style={{
                  padding: "6px 16px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(250,250,250,0.35)",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            right: "40px",
            color: "rgba(212,175,55,0.4)",
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          iron-id.io
        </div>
      </div>
    ),
    { ...size },
  );
}
