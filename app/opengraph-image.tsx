import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Mix, le simulateur du mix électrique de 2050";

/** Un mix d'illustration : les couleurs et proportions de la configuration N3. */
const segments = [
  { couleur: "#818cf8", part: 29 },
  { couleur: "#4f46e5", part: 20 },
  { couleur: "#fbbf24", part: 16 },
  { couleur: "#38bdf8", part: 15 },
  { couleur: "#0284c7", part: 13 },
  { couleur: "#06b6d4", part: 7 },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          backgroundColor: "#FAF8F0",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#66635a",
            marginBottom: 40,
          }}
        >
          mix.climatelab.fr
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1.1,
          }}
        >
          Construisez le mix
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1.1,
          }}
        >
          électrique de 2050
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#66635a",
            marginTop: 20,
          }}
        >
          Dans les bornes industrielles décrites par RTE.
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 44,
            marginTop: 56,
            borderRadius: 9999,
            overflow: "hidden",
            backgroundColor: "#e8e3d6",
          }}
        >
          {segments.map((segment, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                width: `${segment.part}%`,
                backgroundColor: segment.couleur,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
