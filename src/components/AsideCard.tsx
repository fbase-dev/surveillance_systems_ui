import { Card, ScrollArea } from "@mantine/core";
import styles from "@/styles/dashboard.module.css";

type AsideCardProps = {
  children: React.ReactNode;
};

export default function AsideCard({ children }: AsideCardProps) {
  return (
    <Card mih={"87vh"} w={"33%"} className={styles.aside} p={0}>
      <ScrollArea h={"100%"} w="100%" className={styles.asideScrollbar} scrollbars={"y"} type="never">
        {children}
      </ScrollArea>
    </Card>
  );
}
