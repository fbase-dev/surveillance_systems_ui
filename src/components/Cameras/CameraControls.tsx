"use client";

import { Card, Flex } from "@mantine/core";
import RadialControlMenu from "./RadialControlMenu";
import PanControl from "./PanControl";

const CameraControls = () => {

  return (
    <Card bg={"transparent"} w={400}>
        <Flex justify="space-between" align={"center"}>
          <RadialControlMenu />
          <PanControl />
        </Flex>
    </Card>
  );
};

export default CameraControls;
