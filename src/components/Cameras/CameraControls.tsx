"use client";

import { Flex, Paper, Stack } from "@mantine/core";
import RadialControlMenu from "./RadialControlMenu";
import PanControl from "./PanControl";
import PositionCard from "./PositionCard";

const CameraControls = () => {

  return (
    <Paper bg={"transparent"} w={"fit-content"} pos={"absolute"} bottom={25} left={25}>
      <Stack justify="space-between" h={"72vh"}>
        <PositionCard />
        <Flex justify="space-between" w={"90vw"} align={"center"}>
          <RadialControlMenu />
          <PanControl />
        </Flex>
      </Stack>
    </Paper>
  );
};

export default CameraControls;
