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
  const [activeImg, setActiveImg] = useState<1 | 2>(1);
  const img1Ref = useRef<HTMLImageElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!streamUrl) return;

    let isMounted = true;

    const updateImage = () => {
      const nextRef = activeImg === 1 ? img2Ref.current : img1Ref.current;
      if (!nextRef) return;

   
      const nextSrc = `${streamUrl}?_=${Date.now()}`;

      const tempImg = new Image();
      tempImg.src = nextSrc;

      tempImg.onload = () => {
        if (!isMounted) return;

       
        nextRef.src = nextSrc;
        nextRef.style.opacity = "1";

        const prevRef = activeImg === 1 ? img1Ref.current : img2Ref.current;
        if (prevRef) prevRef.style.opacity = "0";

        setActiveImg(activeImg === 1 ? 2 : 1);
        setLoading(false);
      };

      tempImg.onerror = () => {
        
        console.warn(`${title} — failed to load frame, retrying...`);
      };
    };

    updateImage();
    const interval = setInterval(updateImage, 5000); 

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [streamUrl, activeImg]);

  return (
    <Card
      h={height}
      p={0}
      pos="relative"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* Camera title */}
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

      {/* Loader while first frame is loading */}
      {loading && (
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

      {/* Two alternating <img> tags for smooth transitions */}
      <img
        ref={img1Ref}
        alt={`${title} feed`}
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
        alt={`${title} feed`}
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
