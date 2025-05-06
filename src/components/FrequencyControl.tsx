import { Slider, Button, Group, Select, ActionIcon } from "@mantine/core";
import { IconPlayerPlay, IconPlayerSkipForward, IconPlayerSkipBack, IconVolume, IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

export default function FrequencyControl() {
  const [frequency, setFrequency] = useState(100);
  const [mode, setMode] = useState<string|null>("HF");

  const marks = [
    { value: 99, label: "99" },
    { value: 100, label: "100" },
    { value: 101, label: "101" },
    { value: 102, label: "102" },
    { value: 103, label: "103" },
  ];

  return (
    <Group gap="md" align="center" w={"100%"} justify="space-between">
      <ActionIcon size="lg" variant="light" radius="xl" color="blue.6">
        <IconPlayerSkipBack />
      </ActionIcon>

      <ActionIcon size="xl" variant="light" radius="xl" color="blue.6">
        <IconPlayerPlay />
      </ActionIcon>

      <ActionIcon size="lg" variant="light" radius="xl" color="blue.6">
        <IconPlayerSkipForward />
      </ActionIcon>

      <Slider
        value={frequency}
        onChange={setFrequency}
        min={99}
        max={103}
        step={0.1}
        marks={marks}
        label={(value) => `${value.toFixed(1)} MHz`}
        size="sm"
        w={600}
      />

      <ActionIcon size="xl" variant="light" radius="xs">
        <IconVolume />
      </ActionIcon>

      <Select
      size="md"
        value={mode}
        onChange={setMode}
        data={["HF", "VHF", "UHF"]}
        rightSection={<IconChevronDown size={14} />}
        w={80}
      />
    </Group>
  );
}

