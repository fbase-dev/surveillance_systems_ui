"use client"
import { useState } from "react";
import { Box, Button, Group, Text, Stack, Paper, Center } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import CamCards from "@/components/Cameras/CamCards";
import CameraActionGroup from "@/components/Cameras/CameraActionGroup";
import CameraModal from "@/components/Cameras/CameraModal";
import { CameraControlProvider } from "@/contexts/CameraControlContext";

export default function Cameras() {
    const [showFeed, setShowFeed] = useState(false);

    return (
        <CameraControlProvider>
            <CameraModal />
            <CameraActionGroup />

            {showFeed ? (
                <>
                    <Paper p="md" mb="md" withBorder >
                        <Group justify="space-between">
                            <Group gap="sm">
                                <Box w={10} h={10} style={{ borderRadius: '50%',  }} />
                                <Text size="sm" fw={600} c="teal.4">LIVE STREAMING</Text>
                            </Group>

                            <Button
                                size="sm"
                                color="red"
                                variant="light"
                                leftSection={<IconPlayerPause size={18} />}
                                onClick={() => setShowFeed(false)}
                            >
                                Stop Feed
                            </Button>
                        </Group>
                    </Paper>

                    <CamCards />
                </>
            ) : (
                <Paper
                    p={60}
                    radius="lg"
                    withBorder
                   
                >
                    <Stack align="center" gap="xl">
                        <Paper
                            px="xl"
                            py="sm"
                            radius="xl"
                            withBorder
                          
                        >
                            <Text size="xs" c="cyan.4" tt="uppercase" fw={700} style={{ letterSpacing: 2 }}>
                                Camera System Standby
                            </Text>
                        </Paper>

                        <Center>
                            <Button
                                size="xl"
                                radius="xl"
                                onClick={() => setShowFeed(true)}
                                style={{
                                    width: 140,
                                    height: 140,
                                  
                                }}
                            >
                                <IconPlayerPlay size={60} stroke={2.5} />
                            </Button>
                        </Center>

                        <Stack align="center" gap="xs">
                            <Text size="xl" fw={700} c="white">
                                INITIATE SURVEILLANCE
                            </Text>
                            <Text size="sm" c="dimmed" maw={500} ta="center">
                                Activate live video monitoring system to stream real-time feeds from all vessel-mounted cameras
                            </Text>
                        </Stack>

                      
                    </Stack>
                </Paper>
            )}
        </CameraControlProvider>
    )
}