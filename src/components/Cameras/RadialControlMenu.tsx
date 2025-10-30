"use client";

import { useCamera } from "@/contexts/CameraControlContext";
import {
  ActionIcon,
  LoadingOverlay,
  Tooltip,
} from "@mantine/core";
import {
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerStop,
  IconPlayerPlay,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";

export default function RadialControlMenu() {
  const {
    up,
    down,
    left,
    right,
    pause,
    resume,
    status,
    loading,
    position,
    control,
  } = useCamera();

  const zoom = position?.zoom || 0;

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 90);
    control(`zoom:${newZoom}`);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 0);
    control(`zoom:${newZoom}`);
  };

  const isDisabled = loading || status === "active";

  return (
    <div
      style={{
        position: "relative",
        width: 220,
        height: 220,
        borderRadius: "50%",
        backgroundColor: "#030E1BE5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 15px rgba(0,0,0,0.3)",
        margin: "0 auto",
      }}
    >

      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: "xl", blur: 2 }}
        styles={{
          root: { borderRadius: "50%" },
          overlay: { background: "#030E1BE5" },
        }}
      />


      <Tooltip label="Move Up" position="top" withArrow>
        <ActionIcon
          variant="transparent"
          color="white"
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
          }}
          size="lg"
          disabled={isDisabled}
          onClick={up}
        >
          <IconChevronUp size={28} />
        </ActionIcon>
      </Tooltip>


      <Tooltip label="Move Down" position="bottom" withArrow>
        <ActionIcon
          variant="transparent"
          color="white"
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
          }}
          size="lg"
          disabled={isDisabled}
          onClick={down}
        >
          <IconChevronDown size={28} />
        </ActionIcon>
      </Tooltip>


      <Tooltip label="Move Left" position="left" withArrow>
        <ActionIcon
          variant="transparent"
          color="white"
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          size="lg"
          disabled={isDisabled}
          onClick={left}
        >
          <IconChevronLeft size={28} />
        </ActionIcon>
      </Tooltip>

      {/* ➡ RIGHT */}
      <Tooltip label="Move Right" position="right" withArrow>
        <ActionIcon
          variant="transparent"
          color="white"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          size="lg"
          disabled={isDisabled}
          onClick={right}
        >
          <IconChevronRight size={28} />
        </ActionIcon>
      </Tooltip>

      {/* 🔍 ZOOM IN (top-right) */}
      <Tooltip label="Zoom In" position="top-end" withArrow>
        <ActionIcon
          variant="transparent"
          color="white"
          style={{
            position: "absolute",
            top: 35,
            right: 35,
          }}
          size="md"
          disabled={isDisabled || zoom >= 90}
          onClick={handleZoomIn}
        >
          <IconZoomIn size={22} />
        </ActionIcon>
      </Tooltip>


      <Tooltip label="Zoom Out" position="bottom-end" withArrow>
        <ActionIcon
          variant="transparent"
          color="white"
          style={{
            position: "absolute",
            bottom: 35,
            right: 35,
          }}
          size="md"

          onClick={handleZoomOut}
        >
          <IconZoomOut size={22} />
        </ActionIcon>
      </Tooltip>


      <ActionIcon
        variant="transparent"
        color="white"
        radius="50%"
        style={{
          width: 110,
          height: 110,
          border: "2px solid #434b57",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
        disabled={loading}
        onClick={status === "paused" ? resume : pause}
      >
        {status === "paused" ? (
          <IconPlayerStop size={36} />
        ) : (

          <IconPlayerPlay size={36} />
        )}
      </ActionIcon>
    </div>
  );
}
