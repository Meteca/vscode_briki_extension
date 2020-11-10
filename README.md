# Introduction
Welcome to the Visual Studio Code and PlatformIO extension for Briki MBC-WB!
This extension contains all the tools needed to customize and program the MBC-WB boards (MBC-WB standalone and its development boards: ABC and DBC).
The pack includes:
- The OTA Tool: to perform the firmware update Over-The-Air (Wi-Fi interface only). It works for all the MCU-WBs and the related development boards.
- The Flash Partitioning Tool: that can be used to define ESP32's external flash partitioning (in both FAT32 or SPIFF).
- The Documentation: a link to the web-based documentation, accessible through the OS default web browser.
- The Related Command Palette (`F1` or `Ctrl + Shift + P`) integration for the commands Flash Partitioning Tool and OTA Tool.

## Prerequisites
- PlatformIO IDE. It can be found in the VS Code extensions marketplace.
- PlatformIO's Platforms "Atmel SAM" and "Espressif 32", installed and updated to the last version.
- Internet connection to access the documentation.

## Installation
Open VS Code and press `F1` or `Ctrl + Shift + P` to open command palette, select `Install Extension` and type
`briki-mbcwb-extension`
or launch VS Code Quick Open (`Ctrl + P`) , paste the following command and press enter.
```sh
ext install meteca.briki-mbcwb-extension
```

You can also install directly from the Marketplace within Visual Studio Code, searching for Briki.

## Usage
- Briki: MBC-WB OTA tool allows the user to upload a fresh firmware to a Briki MBC-WB board through the Wi-Fi interface. It works in AP, STA or AP+STA mode and for all the MCUs of the board.
When the tool is invoked, a GUI is showed up allowing the user to choose the platform to update (Microchip’s SAM or Espressif’s ESP32 MCU), the binary to upload, the IP address, the port and eventually the password (if present) of the target device. In AP mode the IP defaults to 192.168.240.1 and port and password fields can be left empty.
![](https://raw.githubusercontent.com/Meteca/vscode-briki-extension/master/images/1.png)
When a PIO project for an MBC-WB board is compiled and the OTA Tool GUI is invoked (both using the Command Palette or the plug-in shortcut), the platform and the related .bin firmware fields are automatically filled on the basis of the project configurations.
![](https://raw.githubusercontent.com/Meteca/vscode-briki-extension/master/images/2.png)

- Briki: MBC-WB Flash Partitioning tool allows the user to define the ESP32's external flash partition strategy. Two file systems are available: the typical SPIFF and a FAT implementation.
To modify the partition table to match the project requirements, please refers to the PIO related guide (https://docs.platformio.org/en/latest/platforms/espressif32.html#partition-tables)
![](https://raw.githubusercontent.com/Meteca/vscode-briki-extension/master/images/2.png)


# Supported Operating Systems
Currently this extension supports the following operating systems:
Windows 7 and later (32-bit and 64-bit)
macOS 10.10 and later
Linux 64-bit

# License
Copyright 2020-present Meteca <support@meteca.org>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Contact Us
[briki.org](https://www.briki.org)
