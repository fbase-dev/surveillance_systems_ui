'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Card,
    Text,
    Group,
    Button,
    Stack,
    Table,
    ActionIcon,
    Modal,
    TextInput,
    Alert,
    Badge,
    Flex,
    Paper,
    Loader,
    Menu,
    rem
} from '@mantine/core';
import {
    IconDownload,
    IconTrash,
    IconEdit,
    IconPlayCard,
    IconFile,
    IconAlertCircle,
    IconRefresh,
    IconDots,
    IconInfoCircle,
    IconCheck,

} from '@tabler/icons-react';

interface FileDetails {
    [key: string]: any;
}

interface HardwareStatus {
    host: string;
    port: number;
    version: string;
    base_directory: string;
    allowed_file_types?: string[];
}

export default function StoragePage() {
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<HardwareStatus | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
    const [error, setError] = useState('');


    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/storage?action=status');
            if (!response.ok) throw new Error('Failed to fetch status');
            const data = await response.json();
            setStatus(data);
        } catch (err) {
            console.error('Failed to fetch status:', err);
        }
    };


    const fetchFiles = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/storage?action=files&path=videoes');
            if (!response.ok) throw new Error('Failed to fetch files');
            const data = await response.json();


            console.log('API Response:', data);
            console.log('Response type:', typeof data);
            console.log('Is array:', Array.isArray(data));


            let fileList = [];
            if (Array.isArray(data)) {
                fileList = data;
            } else if (data.files && Array.isArray(data.files)) {
                fileList = data.files;
            } else if (data.mp4_files && Array.isArray(data.mp4_files)) {
                fileList = data.mp4_files;
            } else if (typeof data === 'object') {

                fileList = Object.keys(data).filter(key => key.endsWith('.mp4'));
                if (fileList.length === 0) {
                    fileList = Object.values(data).filter(val =>
                        typeof val === 'string' && val.endsWith('.mp4')
                    );
                }
            }

            console.log('Final file list:', fileList);
            setFiles(fileList);
        } catch (err) {
            setError('Failed to load files. Please check your connection.');
            console.error('Failed to fetch files:', err);
        } finally {
            setLoading(false);
        }
    };


    const fetchFileDetails = async (fileName: string) => {
        try {
            const response = await fetch(`/api/storage?action=details&path=videoes/${fileName}`);
            if (!response.ok) throw new Error('Failed to fetch file details');
            const data = await response.json();
            setFileDetails(data);
            setDetailsModalOpen(true);
        } catch (err) {
            setError('Failed to fetch file details');
            console.error('Failed to fetch file details:', err);
        }
    };


    const downloadFile = (fileName: string) => {
        if (typeof window !== 'undefined') {
            const url = `/api/storage?action=download&path=videoes/${fileName}`;
            window.open(url, '_blank');
        }
    };


    const confirmDelete = (fileName: string) => {
        setFileToDelete(fileName);
        setDeleteConfirmOpen(true);
    };


    const deleteFile = async () => {
        if (!fileToDelete) return;

        try {
            const response = await fetch(`/api/storage?path=videoes/${fileToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchFiles();
                setError('');
                setDeleteConfirmOpen(false);
                setFileToDelete(null);
            } else {
                throw new Error('Failed to delete file');
            }
        } catch (err) {
            setError('Failed to delete file');
            console.error('Failed to delete file:', err);
        }
    };


    const renameFile = async () => {
        if (!newFileName.trim() || !selectedFile) return;

        try {
            const response = await fetch('/api/files/rename', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_path: `videoes/${selectedFile}`,
                    new_name: newFileName
                }),
            });

            if (response.ok) {
                setRenameModalOpen(false);
                setNewFileName('');
                setSelectedFile(null);
                await fetchFiles();
                setError('');
            } else {
                throw new Error('Failed to rename file');
            }
        } catch (err) {
            setError('Failed to rename file');
            console.error('Failed to rename file:', err);
        }
    };


    const extractDate = (fileName: string): string => {
        const match = fileName.match(/(\d{8}_\d{6})/);
        if (match) {
            const dateStr = match[1];
            const date = dateStr.substring(0, 8);
            const time = dateStr.substring(9);
            return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)} ${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(4, 6)}`;
        }
        return 'Unknown';
    };

    useEffect(() => {
        fetchStatus();
        fetchFiles();
    }, []);

    return (
        <Container size="xl" py="md">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <Title order={2}>Video Storage Management</Title>
                    <Button leftSection={<IconRefresh size={16} />} onClick={fetchFiles} loading={loading}>
                        Refresh
                    </Button>
                </Group>


                {status && (
                    <Paper p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500}>Hardware Status</Text>
                            <Badge color="green" leftSection={<IconCheck size={12} />}>
                                Online
                            </Badge>
                        </Group>
                        <Group gap="lg">
                            <Text size="sm" c="dimmed">Host: {status.host}:{status.port}</Text>
                            <Text size="sm" c="dimmed">Version: {status.version}</Text>
                            <Text size="sm" c="dimmed">Base Directory: {status.base_directory}</Text>
                            <Text size="sm" c="dimmed">
                                Allowed Types: {status.allowed_file_types?.join(', ') || 'N/A'}
                            </Text>
                        </Group>
                    </Paper>
                )}


                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}


                <Card withBorder>
                    <Card.Section p="md" withBorder>
                        <Group justify="space-between">
                            <Text fw={500}>Stored Video Feeds ({files.length})</Text>
                        </Group>
                    </Card.Section>

                    {loading ? (
                        <Flex justify="center" p="xl">
                            <Loader />
                        </Flex>
                    ) : files.length === 0 ? (
                        <Text ta="center" c="dimmed" p="xl">
                            No video files found
                        </Text>
                    ) : (
                        <Table.ScrollContainer minWidth={800}>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>File Name</Table.Th>
                                        {/* <Table.Th>Date Created</Table.Th> */}
                                        <Table.Th>Type</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {files.map((file) => (
                                        <Table.Tr key={file}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    <IconFile size={16} />
                                                    <Text size="sm">{file}</Text>
                                                </Group>
                                            </Table.Td>
                                            {/* <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {extractDate(file)}
                                                </Text>
                                            </Table.Td> */}
                                            <Table.Td>
                                                <Badge variant="light" size="sm">
                                                    {file.split('.').pop()?.toUpperCase() || 'UNKNOWN'}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <ActionIcon
                                                        variant="light"
                                                        color="blue"
                                                        onClick={() => downloadFile(file)}
                                                        title="Download/Play"
                                                    >
                                                        <IconPlayCard size={16} />
                                                    </ActionIcon>

                                                    <Menu shadow="md" width={200}>
                                                        <Menu.Target>
                                                            <ActionIcon variant="light" color="gray">
                                                                <IconDots size={16} />
                                                            </ActionIcon>
                                                        </Menu.Target>

                                                        <Menu.Dropdown>
                                                            <Menu.Item
                                                                leftSection={<IconDownload style={{ width: rem(14), height: rem(14) }} />}
                                                                onClick={() => downloadFile(file)}
                                                            >
                                                                Download
                                                            </Menu.Item>

                                                            <Menu.Item
                                                                leftSection={<IconInfoCircle style={{ width: rem(14), height: rem(14) }} />}
                                                                onClick={() => fetchFileDetails(file)}
                                                            >
                                                                View Details
                                                            </Menu.Item>

                                                            <Menu.Item
                                                                leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                onClick={() => {
                                                                    setSelectedFile(file);
                                                                    setNewFileName(file);
                                                                    setRenameModalOpen(true);
                                                                }}
                                                            >
                                                                Rename
                                                            </Menu.Item>



                                                            <Menu.Item
                                                                color="red"
                                                                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                onClick={() => confirmDelete(file)}
                                                            >
                                                                Delete
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Table.ScrollContainer>
                    )}
                </Card>
                <Modal
                    size="auto"
                    opened={deleteConfirmOpen}
                    onClose={() => {
                        setDeleteConfirmOpen(false);
                        setFileToDelete(null);
                    }}
                    title="Confirm Delete"
                >
                    <Stack>
                        <Text>
                            Are you sure you want to delete {fileToDelete}? This action cannot be undone.
                        </Text>

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="light"
                                onClick={() => {
                                    setDeleteConfirmOpen(false);
                                    setFileToDelete(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button color="red" onClick={deleteFile}>
                                Delete
                            </Button>
                        </Group>
                    </Stack>
                </Modal>


                <Modal
                    size="auto"
                    opened={renameModalOpen}
                    onClose={() => {
                        setRenameModalOpen(false);
                        setNewFileName('');
                        setSelectedFile(null);
                    }}
                    title="Rename File"
                >
                    <Stack>
                        <Text size="sm" c="dimmed">
                            Renaming: {selectedFile}
                        </Text>

                        <TextInput
                            label="New file name"
                            placeholder="Enter new name"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.currentTarget.value)}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={() => setRenameModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={renameFile} disabled={!newFileName.trim()}>
                                Rename
                            </Button>
                        </Group>
                    </Stack>
                </Modal>


                <Modal
                    opened={detailsModalOpen}
                    onClose={() => {
                        setDetailsModalOpen(false);
                        setFileDetails(null);
                    }}
                    title="File Details"
                    size="md"
                >
                    {fileDetails ? (
                        <Stack>
                            {Object.entries(fileDetails).map(([key, value]) => (
                                <Group key={key} justify="space-between">
                                    <Text fw={500} tt="capitalize">{key.replace(/_/g, ' ')}:</Text>
                                    <Text c="dimmed" ta="right" style={{ wordBreak: 'break-all' }}>
                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                    </Text>
                                </Group>
                            ))}
                        </Stack>
                    ) : (
                        <Flex justify="center" p="md">
                            <Loader />
                        </Flex>
                    )}
                </Modal>
            </Stack>
        </Container>
    );
}
