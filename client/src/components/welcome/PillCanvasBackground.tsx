import Box from "@mui/material/Box";
import { usePillCanvas } from "./usePillCanvas";

type PillCanvasBackgroundProps = {
  enabled?: boolean;
};

function PillCanvasBackground({ enabled = true }: PillCanvasBackgroundProps) {
  const canvasRef = usePillCanvas(enabled);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      aria-hidden
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "block",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}

export default PillCanvasBackground;
