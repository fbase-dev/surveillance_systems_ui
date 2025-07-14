import { useCamera } from "@/contexts/CameraControlContext";
import { ActionIcon, LoadingOverlay } from "@mantine/core";
import { IconChevronUp, IconChevronDown, IconChevronLeft, IconChevronRight, IconPlayerStop, IconPlayerPlay } from "@tabler/icons-react";
import styles from "@/styles/camera.module.css";

export default function RadialControlMenu(){
    const { move, pause, resume,  status, loading } = useCamera();
    
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
          <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} styles={{root:{ borderRadius: "50%"},overlay: {background: "#030E1BE5"}}} />
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
            className={styles.button}
            disabled={status === "active"}
            onClick={() => move("up")}
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
            className={styles.button}
            disabled={status === "active"}
            onClick={() => move("down")}
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
            className={styles.button}
            disabled={status === "active"}
            onClick={() => move("left")}
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
            className={styles.button}
            disabled={status === "active"}
            onClick={() => move("right")}
          >
            <IconChevronRight size={24} />
          </ActionIcon>

          {/* Center circle, stop */}
          {
            status === "paused" ?
              <ActionIcon
                variant="transparent"
                color="white"
                radius={"50%"}
                bd={"2px solid #434b57"}
                  w={110}
                  h={110}
                  className={styles.button}
                  onClick={resume}
                >
                <IconPlayerPlay size={30} />
              </ActionIcon> 
              :
              <ActionIcon
                variant="transparent"
                color="white"
                radius={"50%"}
                bd={"2px solid #434b57"}
                  w={110}
                  h={110}
                  className={styles.button}
                  onClick={pause}
                >
                <IconPlayerStop size={30} />
              </ActionIcon>
          }
          
        </div>
    )
}