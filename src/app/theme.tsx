import {
    ActionIcon,
    createTheme,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export const theme = createTheme({
    breakpoints: {
        xs: "30em",
        sm: "48em",
        md: "64em",
        lg: "74em",
        xl: "100em",
    },
    fontFamily: "Core Sans C",
    colors: {
        gray: [
            "#f5f5f5",
            "#e7e7e7",
            "#cdcdcd",
            "#b2b2b2",
            "#FFFFFF40",
            "#8b8b8b",
            "#848484",
            "#717171",
            "#656565",
            "#575757",
        ],
        "deep-blue": [
            "#edf4fd",
            "#d9e5f4",
            "#aec8eb",
            "#80aae3",
            "#5c91dc",
            "#4680d9",
            "#14B8FF",
            "#2e67c0",
            "#255bac",
            "#0E3465",
        ],
        
        blue: [
            "#e1faff",
            "#cef0ff",
            "#a1def9",
            "#70ccf4",
            "#48bcef",
            "#30b2ed",
            "#1baded",
            "#0098d3",
            "#0088bf",
            "#0075a9",
        ],
        red: [
            "#ffeded",
            "#fdd9d9",
            "#fbb5b3",
            "#fa918d",
            "#f76c65",
            "#f64841",
            "#c43932",
            "#942b27",
            "#621c1a",
            "#310d0d",
        ],
        green: [
            "#edfaf1",
            "#dcf5e2",
            "#b8eac5",
            "#95dfaa",
            "#71d58d",
            "#4ecb70",
            "#3ea25a",
            "#2f7944",
            "#1f512c",
            "#102916",
        ],
        yellow: [
            "#fffae7",
            "#fef4d0",
            "#fde9a2",
            "#fdde72",
            "#fcd345",
            "#fbc815",
            "#c9a012",
            "#97780c",
            "#645009",
            "#322804",
        ],
        dark: [
            "#edf4fd",
            "#d9e5f4",
            "#aec8eb",
            "#80aae3",
            "#434b57", //border
            "#4680d9",
            "#1baded1a", //hover bg
            "#030E1BE5",
            "#255bac",
            "#0E3465",
        ],
    },
    primaryColor: "deep-blue",
    headings: {
        fontFamily: "Core Sans C Bold",
    },
    defaultRadius: "xs",
    components: {
        AppShellMain: {
          defaultProps: {
            style: {
              background: "var(--body-bg)",
              backgroundRepeat: "no-repeat",
              backgroundPosition:
                "bottom -14rem left -14rem,top -10rem right -10rem,50%",
              backgroundSize: "40%,30%,100%",
            },
          },
        },
        AppShellNavbar: {
          defaultProps: {
            bg: "#030E1B",
          },
        },
        AppShellHeader: {
          defaultProps: {
            bg: "#030E1BE5",
          },
        },
        ActionIcon:{
            defaultProps:{
                color: "gray.1"
            }
        },
        Text: {
          defaultProps: {
            fz: { xl: "var(--xl-font-size)" },
          },
        },
        Card: {
          defaultProps:{
            bg: "dark.7",
            withBorder: true
          }
        },
        InputLabel: {
          defaultProps: {
            c: "gray.0",
            fz: { base: "md", xl: "var(--xl-font-size)" },
          },
        },
        Badge: {
          defaultProps: {
            radius: "sm",
          },
        },
        ScrollArea: {
          defaultProps: {
            scrollbarSize: 5,
            styles: {
              scrollbar: {
                backgroundColor: "var(--mantine-color-gray-0)",
                padding: 0,
              },
              thumb: {
                borderRadius: 0,
                width: "var(--xl-font-size)",
                backgroundColor: "var(--mantine-color-deep-blue-6)",
              },
            },
          },
        },
        Input: {
          defaultProps: {
            styles: {
              wrapper: {
                "--input-bg": "transparent",
              },
            },
          },
        },
        DateInput: {
          defaultProps: {
            styles: {
              wrapper: {
                "--input-bg": "transparent",
              },
              levelsGroup: {
                background: "#0c1f36",
              },
            },
          },
        },
        TagsInput: {
          defaultProps: {
            styles: {
              wrapper: {
                "--input-bg": "transparent",
              },
            },
          },
        },
        NativeSelect: {
          defaultProps: {
            styles: {
              wrapper: {
                "--input-bg": "#0c1f36",
              },
              section: {
                backgroundColor: "#0c1f36",
              },
            },
          },
        },
        PasswordInput: {
          defaultProps: {
            styles: {
              wrapper: {
                "--input-bg": "transparent",
              },
            },
          },
        },
        Select: {
          defaultProps: {
            styles: {
              wrapper: {
                "--input-bg": "transparent",
              },
              dropdown: {
                backgroundColor: "#0c1f36",
              },
            },
          },
        },
        MultiSelect: {
          defaultProps: {
            styles: {
              wrapper: {
                "--input-bg": "transparent",
              },
            },
          },
        },
        RadioGroup: {
          defaultProps: {
            styles: {
              error: {
                fontSize: "var(--mantine-font-size-lg)",
                paddingTop: "var(--mantine-spacing-sm)",
                textAlign: "center",
              },
            },
          },
        },
        CheckboxGroup: {
          defaultProps: {
            styles: {
              error: {
                fontSize: "var(--mantine-font-size-lg)",
                paddingTop: "var(--mantine-spacing-sm)",
                textAlign: "center",
              },
            },
          },
        },
        Menu: {
          defaultProps: {
            styles: {
              dropdown: {
                backgroundColor: "#0c1f36",
              },
            },
          },
        },
        Chip: {
          defaultProps: {
            size: "sm",
          },
        },
        Pill: {
          defaultProps: {
            fz: { xl: "var(--xl-font-size)" },
            p: { xl: "0.4em 0.8em" },
            h: { xl: "auto" },
          },
        },
        Drawer: {
          defaultProps: {
            styles: {
              root: { color: "white" },
              header: { background: "#030E1BE6" },
              overlay: { background: "rgba(12, 31, 54, 0.7)" },
            },
            closeButtonProps: {
              icon: (
                <ActionIcon variant="filled" size={32} aria-label="close">
                  <IconX />
                </ActionIcon>
              ),
            },
          },
        },
        DrawerContent: {
          defaultProps: {
            px: { base: "md", xl: "lg" },
            bg: "#030E1BE6",
          },
        },
        NavLink: {
          defaultProps: {
            fw: "bold",
            fz: { base: "sm", xl: "var(--xl-font-size)" },
            p: { base: "md", xl: "xl" },
            childrenOffset: 45,
          },
        },
        Modal: {
          defaultProps: {
            zIndex: 300,
            closeButtonProps: {
              icon: (
                <ActionIcon variant="filled" size={32} aria-label="close">
                  <IconX />
                </ActionIcon>
              ),
            },
            styles: {
              overlay: { background: "rgba(12, 31, 54, 0.7)" },
            },
          },
        },
        ModalHeader: {
          defaultProps: {
            style: { borderBottom: "1px solid rgba(14, 52, 101, 0.25)" },
            bg: "#030E1BE6",
          },
        },
        ModalContent: {
          defaultProps: {
            px: { base: "sm", xl: "lg" },
            py: { base: "sm", xl: "lg" },
            bg: "#030E1BE6",
          },
        },
        ModalTitle: {
          defaultProps: {
            fz: "h4",
            fw: "bold",
          },
        },
        PopoverDropdown: {
          defaultProps: {
            bg: "#0c1f36",
          },
        },
        Dropzone: {
          defaultProps: {
            styles: {
              root: {
                backgroundColor: "transparent",
              },
            },
          },
        },
        Table: {
          defaultProps: {
            fz: { xl: "1rem" },
            styles: {
              tr: {
                color: "var(--mantine-color-gray-0)",
              },
            },
          },
        },
        PaginationControl: {
          defaultProps: {
            bg: "transparent",
          },
        },
        List: {
          defaultProps: {
            fz: { xl: "var(--xl-font-size)" },
          },
        },
      }
});
