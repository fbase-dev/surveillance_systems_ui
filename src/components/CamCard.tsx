import { Card, Title, Center, Loader } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

type CamCardProps = {
  title: string;
  streamUrl?: string;
  height?: string | number;
  onClick?: () => void;
};

export default function CamCard({
  title,
  streamUrl,
  height = "40vh",
  onClick,
}: CamCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImg, setActiveImg] = useState<1 | 2>(1);
  const img1Ref = useRef<HTMLImageElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!streamUrl) return;

    const updateImage = () => {
      const nextRef = activeImg === 1 ? img2Ref.current : img1Ref.current;
      const nextSrc = `${streamUrl}?t=${Date.now()}`;
      if (!nextRef) return;

      const tempImg = new Image();
      tempImg.src = nextSrc;

      tempImg.onload = () => {
        if (nextRef) {
          nextRef.src = nextSrc;
          nextRef.style.opacity = "1"; // fade in
        }

        // Fade out the previous image
        const prevRef = activeImg === 1 ? img1Ref.current : img2Ref.current;
        if (prevRef) prevRef.style.opacity = "0";

        setActiveImg(activeImg === 1 ? 2 : 1);
        setLoading(false);
        setError(false);
      };

      tempImg.onerror = () => {
        console.warn(`${title} stream error — retrying in 3 sec`);
        setError(true);
        setTimeout(() => setError(false), 3000);
      };
    };

    updateImage();
    const interval = setInterval(updateImage, 1000); // reload every second

    return () => clearInterval(interval);
  }, [streamUrl, activeImg]);

  return (
    <Card
      h={height}
      p={0}
      pos="relative"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", overflow: "hidden" }}
    >
      {/* Overlay title */}
      <Title
        order={3}
        pos="absolute"
        bottom={10}
        left={10}
        style={{
          zIndex: 3,
          color: "#fff",
          textShadow: "0 0 3px rgba(0,0,0,0.7)",
        }}
        m={0}
      >
        {title}
      </Title>

      {/* Loader */}
      {loading && !error && (
        <Center
          h="100%"
          w="100%"
          pos="absolute"
          top={0}
          left={0}
          style={{ backgroundColor: "#00000088", zIndex: 2 }}
        >
          <Loader color="white" />
        </Center>
      )}

      {/* Error */}
      {error && (
        <Center
          h="100%"
          w="100%"
          pos="absolute"
          top={0}
          left={0}
          style={{ backgroundColor: "#00000088", zIndex: 2 }}
        >
          <Title order={4} c="white">
            Stream Error — Retrying…
          </Title>
        </Center>
      )}

      {/* Crossfade image layers */}
      <img
        ref={img1Ref}
        alt="Live Stream 1"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.4s ease-in-out",
          opacity: 1,
          zIndex: 1,
        }}
      />

      <img
        ref={img2Ref}
        alt="Live Stream 2"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.4s ease-in-out",
          opacity: 0,
          zIndex: 1,
        }}
      />
    </Card>
  );
}
