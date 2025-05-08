import { useCamera } from "@/contexts/CameraControlContext";
import { Flex, Text } from "@mantine/core";

export default function PositionCard() {
  const { position } = useCamera();
    
  return (
    <Flex justify={"center"} bg={"#030E1BE5"} p={"md"} w={"fit-content"} mx={"auto"}>
      <Text fw={"bold"} me={"xs"}>
        Pan:
      </Text>
      <Text me={"md"}>{position.pan === 0 ? position.pan : position.pan||"-- --"}°</Text>

      <Text fw={"bold"} me={"xs"}>
        Tilt:
      </Text>
      <Text me={"md"}>{position.tilt||"-- --"}°</Text>

      <Text fw={"bold"} me={"xs"}>
        Zoom:
      </Text>
      <Text me={"md"}>{position.zoom||"-- --"}</Text>
    </Flex>
  );
}
