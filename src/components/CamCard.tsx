import { Card, Title, Center, Loader } from "@mantine/core";
import { useEffect, useState } from "react";

type CamCardProps = {
  title: string;
  streamUrl: string;
  height?: string | number;
  onClick?: () => void;
};

export default function CamCard({
  title,
  streamUrl,
  height = "40vh",
  onClick,
}: CamCardProps) {
  const [reloadKey, setReloadKey] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setReloadKey(Date.now());
  }, []);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    console.warn(`${title} stream error — retrying in 3 sec`);
    setLoading(true);
    setError(true);

    setTimeout(() => {
      setError(false);
      setReloadKey(Date.now());
    }, 3000);
  };

  const cursorStyle = onClick ? "pointer" : "default";

  return (
    <Card
      h={height}
      p={0}
      pos="relative"
      onClick={onClick}
      style={{ cursor: cursorStyle }}
    >
      <Title
        order={3}
        pos="absolute"
        bottom={10}
        left={10}
        style={{
          zIndex: 1,
          color: "#fff",
          textShadow: "0 0 3px rgba(0,0,0,0.7)",
        }}
        m={0}
      >
        {title}
      </Title>

      {loading && !error && (
        <Center
          h="100%"
          w="100%"
          pos="absolute"
          top={0}
          left={0}
          style={{ backgroundColor: "#00000088", zIndex: 0 }}
        >
          <Loader color="white" />
        </Center>
      )}

      {error && (
        <Center
          h="100%"
          w="100%"
          pos="absolute"
          top={0}
          left={0}
          style={{ backgroundColor: "#00000088", zIndex: 0 }}
        >
          <Title order={4} c="white">
            Stream Error — Retrying…
          </Title>
        </Center>
      )}

      {reloadKey && (
        <img
          src={streamUrl}
          alt="Live Stream"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: loading || error ? "none" : "block",
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </Card>
  );
}
