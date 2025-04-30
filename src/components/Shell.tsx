"use client";

import { ActionIcon, AppShell, Avatar, Burger, Button, Flex, Group, Image, NavLink, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { navItems } from "@/utils/navItems";
import React from "react";
import { usePathname } from 'next/navigation'
import { IconBell, IconVolumeOff } from "@tabler/icons-react";
import Link from "next/link";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const url = usePathname()

  return (
    <AppShell
      header={{ height: {base: 60, xl: 100} }}
      navbar={{
        width: 300,
        breakpoint: "md",
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
          <Group justify="space-between" style={{ flex: 1 }}>
            <Image src={"/Logo.png"} />
            <Flex ml="xl" gap={0} visibleFrom="md">
              {navItems.map(({ name, href }, index) => (
                <NavLink
                  styles={{ label: { fontSize: "1rem" } }}
                  component={Link}
                  className="adminNavLink"
                  active={href.includes(url.split("?")[0])}
                  href={href}
                  label={name}
                  key={index}
                />
              ))}
            </Flex>
            <Flex justify={"space-between"} gap={"lg"} visibleFrom="md">
              <ActionIcon variant="subtle">
                <IconVolumeOff />
              </ActionIcon>
              <ActionIcon variant="subtle">
                <IconBell />
              </ActionIcon>
              <ActionIcon variant="subtle">
                <Avatar radius="xl" />
              </ActionIcon>
            </Flex>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        {navItems.map(({ name, href, icon }, index) => (
          <NavLink
              active={href.includes(url.split("?")[0])}
              component={Link}
              href={href}
              label={name}
              leftSection={icon}
              onClick={toggle}
              key={index}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
