import { useRadio } from "@/contexts/RadioContext";
import { Slider, Group, ActionIcon, LoadingOverlay, Stack, Switch, TextInput, Text, Select, Badge } from "@mantine/core";
import { IconVolume, IconPower } from "@tabler/icons-react";
import { ModeOptions } from "@/types/ModeMap";

export default function RadioControl() {
  const {status, loading, mode, modes, volumeVisible, volume, frequencyUnit, frequency, setFrequency, setVolume, setVolumeVisibility, onRadio, offRadio, setMode} = useRadio();

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
            {/* <NumberInput
              size="xs"
              value={volume}
              onChange={(value) => {
                const number = value as number;
                if (number % 5 === 0) {
                  setVolume(number);
                }else{
                  setVolume(volume)
                }
              }}
              min={0}
              max={60}
              clampBehavior="strict"
              step={5}
            /> */}

          <Slider
            inverted
            size="lg"
            color="blue"
            value={volume}
            onChange={setVolume}
            min={0}
            max={60}
            miw={200}
            w="100%"
            restrictToMarks
            marks={Array.from({ length: 12 }).map((_, index) => ({ value: index * 5 }))}
          />
          </Stack>
        </Group>
      </Stack>

      <Stack>
        <Group gap={"xs"}>
          <Text c={"gray.4"}>Modes:</Text>
          {modes.map((mode)=><Badge key={mode} color="teal">{mode}</Badge>)}
        </Group>
        <Select
          size="md"
          value={mode}
          onChange={setMode}
          data= {ModeOptions}
          placeholder="Select a mode"
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

