"use client";

import { Card, Flex } from "@mantine/core";
import RadialControlMenu from "./RadialControlMenu";

const CameraControls = () => {

  return (
    <Card bg={"transparent"} w={400}>
        <Flex justify="center" align={"center"}>
          <RadialControlMenu />
        </Flex>
    </Card>
  );
};

export default CameraControls;
