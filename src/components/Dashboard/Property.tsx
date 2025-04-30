import { SimpleGrid, Text } from "@mantine/core";

type props = {
  title: string;
  value: string;
};
export default function Property({ title, value }: props) {
  return (
    <SimpleGrid cols={2}>
      <Text>{title}:</Text>
      <Text c={"gray.3"}>{value}</Text>
    </SimpleGrid>
  );
}