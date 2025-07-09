"use client";

import { Card, Title, Center, Loader } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

type CamCardProps = {
  title: string;
  streamUrl: string;
  height?: string | number;
  objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down";
  withBorder?: boolean;
  onClick?: () => void;
  externalReloadKey?: number;
};

export function buildStreamUrl(baseUrl: string, params: Record<string, string | number>) {
  const query = new URLSearchParams(params as Record<string, string>);
  return `${baseUrl}?${query.toString()}`;
}

const CamCard = ({
  title,
  streamUrl,
  height = "40vh",
  objectFit,
  onClick,
  externalReloadKey,
  withBorder = true,
}: CamCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(Date.now());

  const effectiveReloadKey = externalReloadKey ?? reloadKey;

  useEffect(() => {
    const controller = new AbortController();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const fetchStream = async () => {
      try {
        const response = await fetch(buildStreamUrl(streamUrl, { reload: effectiveReloadKey }), {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Stream failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No stream reader");

        let buffer = new Uint8Array();

        setLoading(true);
        setError(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            // Concatenate new chunk
            const tmp = new Uint8Array(buffer.length + value.length);
            tmp.set(buffer);
            tmp.set(value, buffer.length);
            buffer = tmp;

            // Look for JPEG SOI/EOI markers (0xFFD8 to 0xFFD9)
            const start = buffer.indexOf(0xffd8);
            const end = buffer.indexOf(0xffd9, start + 2);

            if (start !== -1 && end !== -1) {
              const frame = buffer.slice(start, end + 2);
              const blob = new Blob([frame], { type: "image/jpeg" });
              const img = new Image();

              img.onload = () => {
                // Draw image to canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // handle objectFit
                const { width: cw, height: ch } = canvas;
                const { width: iw, height: ih } = img;

                if (objectFit === "contain") {
                  const ratio = Math.min(cw / iw, ch / ih);
                  const w = iw * ratio;
                  const h = ih * ratio;
                  const x = (cw - w) / 2;
                  const y = (ch - h) / 2;
                  ctx.drawImage(img, x, y, w, h);
                } else {
                  ctx.drawImage(img, 0, 0, cw, ch);
                }

                setLoading(false);
              };

              img.src = URL.createObjectURL(blob);

              // Remove processed frame
              buffer = buffer.slice(end + 2);
            }
          }
        }
      } catch (err) {
        console.error("Stream error", err);
        setError(true);

        // Retry after 3 sec
        setTimeout(() => {
          setError(false);
          setReloadKey(Date.now());
        }, 3000);
      }
    };

    fetchStream();

    return () => controller.abort();
  }, [streamUrl, effectiveReloadKey, objectFit]);

  const cursorStyle = onClick ? "pointer" : "default";

  return (
    <Card h={height} p={0} pos={"relative"} onClick={onClick} style={{ cursor: cursorStyle }} withBorder={withBorder}>
      <Title
        order={3}
        pos={"absolute"}
        bottom={10}
        left={10}
        style={{ zIndex: 1, color: "#fff", textShadow: "0 0 3px rgba(0,0,0,0.7)" }}
        m={0}
      >
        {title}
      </Title>

      {loading && !error && (
        <Center h="100%" w="100%" pos="absolute" top={0} left={0} style={{ backgroundColor: "#00000088", zIndex: 0 }}>
          <Loader color="white" />
        </Center>
      )}

      {error && (
        <Center h="100%" w="100%" pos="absolute" top={0} left={0} style={{ backgroundColor: "#00000088", zIndex: 0 }}>
          <Title order={4} c="white">
            Stream Error — Retrying…
          </Title>
        </Center>
      )}

      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          width: "100%",
          height: "100%",
          objectFit: objectFit || "cover",
          display: error ? "none" : "block",
        }}
      />
    </Card>
  );
};

export default CamCard;
