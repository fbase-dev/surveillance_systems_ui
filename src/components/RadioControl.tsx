import { useRadio } from "@/contexts/RadioContext";
import { Slider, Group, ActionIcon, LoadingOverlay, MultiSelect, Stack, NumberInput, Switch, TextInput, Text } from "@mantine/core";
import { IconVolume, IconPower } from "@tabler/icons-react";
import { ModeOptions } from "@/types/ModeMap";

export default function RadioControl() {
  const {status, loading, modes, volumeVisible, volume, frequencyUnit, frequency, setFrequency, setVolume, setVolumeVisibility, onRadio, offRadio, setModes} = useRadio();

  return (
    <Group gap="md" align="center" w={"100%"} justify="space-between" pos={"relative"}>
      <LoadingOverlay visible={loading} m={"-md"} zIndex={1000} overlayProps={{ radius: "sm", blur: 4, color: "rgba(3, 14, 27, 1)" }} loaderProps={{ color: 'blue', type: 'bars' }}/>

      <Stack>
        <Text c={"gray.4"}>
          Power
        </Text>
        <Switch
          size="xl"
          color="green"
          checked={status === "on"}
          onChange={() => status === "on" ? offRadio() : onRadio()}
          onLabel={<IconPower size={16} stroke={2.5} color="white" />}
          offLabel={<IconPower size={16} stroke={2.5} color="red" />}
        />
      </Stack>

      <Stack>
        <Text c={"gray.4"}>Volume</Text>
        <Group pos={"relative"} align="center" justify="center">
          <ActionIcon size="xl" variant="light" radius="xs" onClick={()=>setVolumeVisibility(!volumeVisible)}>
            <IconVolume />
          </ActionIcon>
          <Stack gap={5}>
            <NumberInput
            size="xs"
            value={volume}
            onChange={(value) => setVolume(value as number)}
            min={0}
            max={100}
            clampBehavior="strict"
            allowDecimal
          />

          <Slider
            size="xs"
            color="blue"
            value={volume}
            onChange={setVolume}
            min={0}
            max={100}
            miw={100}
            w="100%"
          />
          </Stack>
        </Group>
      </Stack>

      <Stack>
        <Text c={"gray.4"}>Mode</Text>
        <MultiSelect
          size="md"
          value={modes}
           onChange={setModes}
          data= {ModeOptions}
          maxValues={2}
        />
      </Stack>

      <Stack>
        <Text c={"gray.4"}>Frequency</Text>
          <TextInput
            size="md"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value.replace(/[^0-9.]/g, '')) }
            placeholder={frequencyUnit === 'MHz' ? '145.33345' : '000.33345'}
            w={200}
            rightSection={<Text me={"sm"}>{frequencyUnit}</Text>}
          />
      </Stack>
    </Group>
  );
}

