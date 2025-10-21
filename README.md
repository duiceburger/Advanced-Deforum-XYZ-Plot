<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/11dgWBoi56tDLcxCstFQ6JosDq2sFU375

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# Advanced Deforum X/Y/Z Plot Generator

A powerful, browser-based tool for generating batches of Deforum settings files with parametric variations. This tool streamlines the process of experimenting with different animation settings, allowing you to create complex X/Y/Z plots with ease.

## Overview

Instead of manually creating and editing dozens of settings files to test different parameter combinations, this utility provides a comprehensive UI to:

1.  **Load a base settings file** as a starting point.
2.  **Visually edit common parameters** like animation length, FPS, motion, and cohesion.
3.  **Define X, Y, and an optional Z axis** using almost any Deforum parameter.
4.  **Specify ranges and lists of values** for each axis using a flexible syntax.
5.  **Automatically generate all combinations** of your chosen parameters.
6.  **Download all resulting settings files** in a conveniently named `.zip` archive.

This project is an evolution of the original Deforum-XYZ-Plot tool, rebuilt with a more robust interface and expanded feature set.

## Live Application & Repository

*   **Try the tool live:** [Advanced Deforum XYZ Plot on GitHub Pages](https://duiceburger.github.io/Advanced-Deforum-XYZ-Plot/)
*   **Project Repository:** [https://github.com/duiceburger/Advanced-Deforum-XYZ-Plot](https://github.com/duiceburger/Advanced-Deforum-XYZ-Plot)

## Key Features

-   **Comprehensive UI:** A multi-column layout guides you through a clear, step-by-step process.
-   **Full Settings Control:** Edit common parameters directly (animation, sampling, motion, etc.) after uploading your base file.
-   **Advanced Plotting:** Define X, Y, and optional Z-axis for 3D parameter grids.
-   **Flexible Value Syntax:** Supports comma-separated lists (`1, 2, 5`), simple ranges (`1-5`), ranges with steps (`1-5 (+2)`), and ranges with a specific count of values (`1-10 [5]`).
-   **Smart Parameter Handling:**
    -   Categorized parameter selection for easy navigation.
    -   Special UI for selecting multiple samplers.
    -   Unique options for plotting prompts (override vs. append).
    -   Automatic value suggestions and parameter descriptions to guide you.
-   **Dynamic Prompts:** Easily switch between a simple positive/negative prompt setup and a full keyframe animation editor.
-   **Init Image Control:** Full support for `use_init`, `init_image` (with URL preview), and `strength`.
-   **Customizable Filenames:** A powerful template engine with variables (`{seed}`, `{x_param}`, `{x_value}`, etc.) helps you create descriptive and organized output files.
-   **Batch Operations:** Generate hundreds of settings files and download them in a single `.zip` archive.
-   **Purely Browser-Based:** No data is sent to any server. Your settings and prompts remain private and secure on your machine.

## How to Use

### Step 1: Upload Base Settings
Start by dragging and dropping an existing Deforum settings file (`.txt` or `.json`) onto the upload zone, or click to browse for a file. This will be the template for all generated variations.

### Step 2: Adjust Common Settings
Tweak frequently used parameters like animation length, FPS, sampler, seed, and 2D/3D motion controls. These settings will apply to all generated files unless overridden by a plot axis.

### Step 3: Configure Prompts
Use the simple fixed prompt editor (with positive and negative fields) or switch to the keyframe editor to define prompts that change over the course of the animation.

### Step 4: Define Plot Parameters & Values
This is the core of the tool.
-   Select the parameters you want to test for the **X-Axis**, **Y-Axis**, and optional **Z-Axis**. Parameters are grouped by category for convenience.
-   For each axis, enter the values you want to test. Use the supported formats:
    -   Simple value: `7`
    -   Comma-separated list: `1, 2, 5, 10`
    -   Simple range (integers only): `1-5` (generates 1, 2, 3, 4, 5)
    -   Range with step: `0-1 (+0.2)` (generates 0, 0.2, 0.4, 0.6, 0.8, 1.0)
    -   Range with count: `0-1 [6]` (generates 6 evenly spaced values from 0 to 1)

### Step 5: Configure Init Settings (Optional)
If your animation uses an initial image, enable `use_init` and provide the image path/URL and the desired `strength`. You'll see a preview if you use a valid web URL.

### Step 6: Generate and Download
-   Customize the output filename using the template editor and available variables.
-   Click **"Generate Plot Settings"** to create all the parameter combinations.
-   Review the list of generated files and click **"Download All as .zip"** to save them.

### Step 7: Run in Deforum
-   Unzip the downloaded file.
-   In the Deforum interface, go to the **Batch** tab.
-   Drag and drop the generated settings files into the batch input directory field.
-   Run the batch and analyze your results!

## Example Use Cases

-   Test different `strength_schedule` values against various `cfg_scale` values.
-   Compare different samplers against a range of step counts.
-   Find the optimal combination of 3D motion parameters (`translation_z`, `rotation_3d_y`, etc.).
-   Generate a prompt matrix by plotting a list of subjects on the X-axis and a list of styles on the Y-axis.

## Companion Tool: Deforum Video Renamer

To make organizing your output videos easier, a simple Python script and batch file are available to rename Deforum's numbered video outputs to match the descriptive names of your generated settings files.

1.  **Download the files:**
    -   [deforum_video_renamer.py](https://github.com/duiceburger/Deforum-XYZ-Plot/blob/9c270cb2e6e23691d611738fd96a420ade89b068/batch-renamer/deforum_video_renamer.py)
    -   [rename_deforum_videos.bat](https://github.com/duiceburger/Deforum-XYZ-Plot/blob/9c270cb2e6e23691d611738fd96a420ade89b068/batch-renamer/rename_deforum_videos.bat)
2.  Place both files in your main Deforum output directory (e.g., `stable-diffusion-webui/outputs/deforum`).
3.  Double-click `rename_deforum_videos.bat` to run it.

## Technical Details

This tool is built with HTML, CSS, and modern JavaScript, running entirely in your browser. It uses JSZip for creating the downloadable archive and FileSaver.js for saving files.

## Contributing

Contributions, bug reports, and feature requests are welcome! Please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/duiceburger/Advanced-Deforum-XYZ-Plot).

## Acknowledgments

-   The [Deforum team](https://github.com/deforum-art/deforum-stable-diffusion) for creating the amazing animation system that makes all of this possible.
-   The Stable Diffusion community for its continuous innovation in AI art generation.
