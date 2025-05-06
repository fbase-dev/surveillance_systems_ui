import { Card, ScrollArea } from "@mantine/core";
import DetailsCardTab from "./DetailsCardTab";
import styles from "@/styles/dashboard.module.css"

export default function DetailsCard() {
  return (
    <Card mih={"87vh"} w={"33%"} p={"md"} className={styles.aside}>
      <ScrollArea h={"100%"} w="100%" className={styles.asideScrollbar} scrollbars={"y"} type="never">
        <DetailsCardTab />
      </ScrollArea>
    </Card>
  );
}
