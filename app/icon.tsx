import { ImageResponse } from "next/og";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";
const teal = "#0E7474";
export default function Icon() {
    return new ImageResponse((<div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: teal,
            borderRadius: "22%",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            letterSpacing: "-0.06em",
        }}>
        FB
      </div>), { ...size });
}
