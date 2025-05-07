import { useCamera } from "@/contexts/CameraControlContext";
import { ActionIcon } from "@mantine/core";
import { IconChevronUp, IconChevronDown, IconChevronLeft, IconChevronRight, IconPlayerStop } from "@tabler/icons-react";

export default function RadialControlMenu(){
    const { control } = useCamera();
    return(
        <div
          style={{
            position: "relative",
            width: 200,
            height: 200,
            borderRadius: "50%",
            backgroundColor: "#030E1BE5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Up */}
          <ActionIcon
            variant="transparent"
            color="white"
            style={{
              position: "absolute",
              top: 6,
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onClick={() => control("tilt_up")}
          >
            <IconChevronUp size={24} />
          </ActionIcon>

          {/* Down */}
          <ActionIcon
            variant="transparent"
            color="white"
            style={{
              position: "absolute",
              bottom: 6,
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onClick={() => control("tilt_down")}
          >
            <IconChevronDown size={24} />
          </ActionIcon>

          {/* Left */}
          <ActionIcon
            variant="transparent"
            color="white"
            style={{
              position: "absolute",
              left: 6,
              top: "50%",
              transform: "translateY(-50%)",
            }}
            onClick={() => control("pan_left")}
          >
            <IconChevronLeft size={24} />
          </ActionIcon>

          {/* Right */}
          <ActionIcon
            variant="transparent"
            color="white"
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
            }}
            onClick={() => control("pan_right")}
          >
            <IconChevronRight size={24} />
          </ActionIcon>

          {/* Center circle, stop */}
          <ActionIcon
            variant="transparent"
            color="white"
            radius={"50%"}
            bd={"2px solid #434b57"}
              w={110}
              h={110}
              onClick={() => control("stop")}
            >
            <IconPlayerStop size={30} />
          </ActionIcon>
        </div>
    )
}