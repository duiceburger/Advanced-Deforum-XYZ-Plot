// src/constants.js

export const SAMPLER_DETAILS = [
    // Top 5 as requested
    { category: 'Top Picks', name: 'DPM++ 2M Karras', displayName: 'DPM++ 2M Karras', description: 'A highly popular, fast, and high-quality solver. A common "best" choice for general use, balancing speed and detail.' },
    { category: 'Top Picks', name: 'Euler a', displayName: 'Euler a', description: 'The ancestral version of Euler. Very popular for its artistic results, speed, and creative variation between steps.' },
    { category: 'Top Picks', name: 'UniPC', displayName: 'UniPC', description: 'A newer, fast, and efficient sampler that is often recommended as a good all-arounder, similar to DPM++ 2M Karras.' },
    { category: 'Top Picks', name: 'DPM++ SDE Karras', displayName: 'DPM++ SDE Karras', description: 'Uses a Stochastic Differential Equation (SDE) approach. Slower but often produces images with the highest level of detail, excellent at low step counts.' },
    { category: 'Top Picks', name: 'Euler', displayName: 'Euler', description: 'The simplest, fastest, and most consistent (deterministic) solver. A great baseline for predictable animations.' },

    // The rest of the list
    { category: 'DPM Solvers (High Quality)', name: 'DPM++ 2M', displayName: 'DPM++ 2M', description: 'The non-Karras version of the popular 2M solver. Fast and high-quality.' },
    { category: 'DPM Solvers (High Quality)', name: 'DPM++ SDE', displayName: 'DPM++ SDE', description: 'The non-Karras version of the SDE solver. Can produce high detail.' },
    { category: 'DPM Solvers (High Quality)', name: 'DPM++ 2M SDE Karras', displayName: 'DPM++ 2M SDE Karras', description: 'A hybrid solver combining the speed of 2M and detail of SDE, with the Karras noise schedule.' },
    { category: 'DPM Solvers (High Quality)', name: 'DPM2', displayName: 'DPM2', description: 'Second-order DPM-Solver. A solid choice, often improved by its Karras variant.' },
    { category: 'DPM Solvers (High Quality)', name: 'DPM2 Karras', displayName: 'DPM2 Karras', description: 'DPM2 with the Karras noise schedule for improved quality.' },
    { category: 'DPM Solvers (High Quality)', name: 'DPM Fast', displayName: 'DPM Fast', description: 'An aggressive, fast-stepping version of DPM, prioritizing speed.' },
    { category: 'DPM Solvers (High Quality)', name: 'DPM Adaptive', displayName: 'DPM Adaptive', description: 'Adjusts the step size automatically. Can be slow as it ignores the user-defined step count.' },

    { category: 'Ancestral Solvers (Stochastic)', name: 'DPM2 a', displayName: 'DPM2 a', description: 'The ancestral (stochastic) version of DPM2. Adds variation.' },
    { category: 'Ancestral Solvers (Stochastic)', name: 'DPM2 a Karras', displayName: 'DPM2 a Karras', description: 'Ancestral DPM2 with the Karras noise schedule.' },
    { category: 'Ancestral Solvers (Stochastic)', name: 'DPM++ 2S a', displayName: 'DPM++ 2S a', description: 'The ancestral variant of the DPM++ family. Adds high variation.' },
    { category: 'Ancestral Solvers (Stochastic)', name: 'DPM++ 2S a Karras', displayName: 'DPM++ 2S a Karras', description: 'Ancestral DPM++ 2S with the Karras noise schedule.' },

    { category: 'ODE Solvers (Deterministic)', name: 'Heun', displayName: 'Heun', description: 'A second-order improvement over Euler, offering higher accuracy but is about twice as slow per step.' },
    { category: 'ODE Solvers (Deterministic)', name: 'LMS', displayName: 'LMS', description: '(Linear Multi-Step) Uses information from previous steps to be more accurate than Euler.' },
    { category: 'ODE Solvers (Deterministic)', name: 'LMS Karras', displayName: 'LMS Karras', description: 'LMS with the Karras noise schedule for improved quality.' },
    { category: 'ODE Solvers (Deterministic)', name: 'DDIM', displayName: 'DDIM', description: '(Denoising Diffusion Implicit Models) One of the original samplers. Fast and highly consistent, good for video.' },
    { category: 'ODE Solvers (Deterministic)', name: 'PLMS', displayName: 'PLMS', description: '(Pseudo Linear Multi-Step) An improvement over DDIM, though often considered legacy.' },

    { category: 'Specialized Solvers', name: 'LCM', displayName: 'LCM', description: '(Latent Consistency Model) A specialized technique that generates images in very few steps (4-8), sacrificing some quality for extreme speed.' },
];
export const SAMPLERS = SAMPLER_DETAILS.map(s => s.name);
export const SEED_BEHAVIORS = ['iter', 'fixed', 'random'];
export const BORDER_MODES = ['wrap', 'replicate', 'reflect', 'zeros'];
export const NOISE_TYPES = ['uniform', 'perlin'];

export const PARAM_FRIENDLY_NAMES = {
    "prompts": "Prompts",
    "sampler": "Sampler Algorithm",
    "strength_schedule": "Animation Strength",
    "strength": "Init Image Strength",
    "cfg_scale": "CFG Scale",
    "seed": "Seed",
    "seed_behavior": "Seed Behavior",
    "steps": "Steps",
    "zoom": "Zoom (2D)",
    "translation_x": "Translation X",
    "translation_y": "Translation Y",
    "translation_z": "Translation Z (3D)",
    "rotation_2d": "Rotation (2D)",
    "rotation_3d_x": "Rotation X (3D)",
    "rotation_3d_y": "Rotation Y (3D)",
    "rotation_3d_z": "Rotation Z (3D)",
    "noise_schedule": "Noise Schedule",
    "use_init": "Use Init Image",
    "init_image": "Init Image Path",
    "animation_mode": "Animation Mode",
    "max_frames": "Max Frames",
    "fps": "FPS",
    "color_coherence": "Color Coherence",
    "diffusion_cadence": "Diffusion Cadence",
    "perspective_flip_theta": "Perspective Flip Theta",
    "perspective_flip_phi": "Perspective Flip Phi",
    "perspective_flip_gamma": "Perspective Flip Gamma",
    "perspective_flip_fv": "Perspective Flip Focal Length",
    "use_horizontal_flip": "Use Horizontal Flip",
    "use_vertical_flip": "Use Vertical Flip",
    "optical_flow_cadence": "Optical Flow Cadence",
    "optical_flow_redo_generation": "Optical Flow Redo",
    "noise_type": "Noise Type",
    "perlin_init": "Perlin Noise Init",
    "perlin_mode": "Perlin Noise Mode",
    "perlin_w": "Perlin Noise Width",
    "perlin_h": "Perlin Noise Height",
    "perlin_octaves": "Perlin Noise Octaves",
    "perlin_persistence": "Perlin Noise Persistence",
    "seed_iter_N": "Seed Iterations",
    "seed_resize_from_w": "Seed Resize Width",
    "seed_resize_from_h": "Seed Resize Height",
    "use_mask": "Use Mask",
    "mask_file": "Mask File Path",
    "invert_mask": "Invert Mask",
    "W": "Width",
    "H": "Height",
};

export const PARAMETER_GROUPS = {
    "Special": ["prompts", "sampler"],
    "Favorites": [
        "cfg_scale", 
        "seed", 
        "strength_schedule", 
        "strength", 
        "zoom", 
        "translation_z", 
        "steps"
    ],
    "Core Controls": [
        "animation_mode",
        "max_frames",
        "fps",
        "W", 
        "H"
    ],
    "Camera & Motion (2D)": [
        "zoom",
        "translation_x",
        "translation_y",
        "rotation_2d"
    ],
    "Camera & Motion (3D)": [
        "translation_x",
        "translation_y",
        "translation_z",
        "rotation_3d_x",
        "rotation_3d_y",
        "rotation_3d_z",
        "perspective_flip_theta",
        "perspective_flip_phi",
        "perspective_flip_gamma",
        "perspective_flip_fv"
    ],
    "Image Generation": [
        "cfg_scale",
        "steps",
        "sampler",
        "seed", 
        "seed_behavior", 
        "seed_iter_N",
    ],
    "Cohesion & Style": [
        "strength_schedule",
        "noise_schedule",
        "color_coherence",
        "diffusion_cadence"
    ],
    "Init & Masking": [
        "use_init", 
        "init_image", 
        "strength", 
        "use_mask", 
        "mask_file", 
        "invert_mask"
    ],
     "Advanced Noise": [
        "noise_type", 
        "perlin_init", 
        "perlin_mode", 
        "perlin_w", 
        "perlin_h", 
        "perlin_octaves", 
        "perlin_persistence"
    ],
};


export const PARAM_DESCRIPTIONS = {
    "strength_schedule": "Controls how much the new frame is influenced by the previous one. Higher values mean more change. This is a keyframeable schedule.",
    "strength": "For init images, controls how much the image influences the first frame. A value of 1.0 will not change the image at all.",
    "cfg_scale": "Controls how strongly the prompt influences the image. Higher values mean stricter adherence. This is a keyframeable schedule.",
    "seed": "The starting noise pattern. Different seeds produce different images for the same prompt.",
    "steps": "Number of diffusion steps. More steps can increase detail but also take longer.",
    "zoom": "Simulates camera zoom. Values > 1 zoom in, < 1 zoom out. This is a keyframeable schedule.",
    "translation_x": "Moves the frame left (negative) or right (positive). This is a keyframeable schedule.",
    "translation_y": "Moves the frame up (negative) or down (positive). This is a keyframeable schedule.",
    "translation_z": "Moves the frame forward (positive) or backward (negative) in 3D mode. This is a keyframeable schedule.",
    "rotation_2d": "Rotates the frame clockwise (positive) or counter-clockwise (negative) in 2D mode. This is a keyframeable schedule.",
    "rotation_3d_x": "Rotates the frame around the X-axis (tilts up/down). This is a keyframeable schedule.",
    "rotation_3d_y": "Rotates the frame around the Y-axis (pans left/right). This is a keyframeable schedule.",
    "rotation_3d_z": "Rotates the frame around the Z-axis (rolls clockwise/counter-clockwise). This is a keyframeable schedule.",
    "sampler": "The algorithm used for the diffusion process (e.g., 'euler a', 'dpm++').",
    "animation_mode": "The type of animation, like '2D' or '3D'.",
    "max_frames": "The total number of frames in the animation.",
    "fps": "Frames Per Second. Controls the speed of the final video.",
    "color_coherence": "Tries to maintain consistent colors between frames using a reference image or frame.",
    "noise_schedule": "Controls the amount of noise added at different stages of the animation. This is a keyframeable schedule.",
    "prompts": "The text descriptions for the AI to generate images from. Can be keyframed for animation.",
    "use_init": "Enable or disable the use of an initial image.",
    "init_image": "The file path or URL to the image to use as a starting point for the animation.",
    "seed_behavior": "How the seed is handled between frames. 'iter' adds 1 each frame, 'fixed' stays the same, 'random' changes randomly.",
    "diffusion_cadence": "Runs diffusion every N frames. A value of 2 skips diffusion on every other frame, often creating smoother motion.",
    "perspective_flip_theta": "3D perspective flip effect: controls rotation around the Y-axis. This is a keyframeable schedule.",
    "perspective_flip_phi": "3D perspective flip effect: controls rotation around the X-axis. This is a keyframeable schedule.",
    "perspective_flip_gamma": "3D perspective flip effect: controls rotation around the Z-axis (roll). This is a keyframeable schedule.",
    "perspective_flip_fv": "3D perspective flip effect: controls the focal length (field of view). This is a keyframeable schedule.",
    "use_horizontal_flip": "Flips every generated frame horizontally.",
    "use_vertical_flip": "Flips every generated frame vertically.",
    "optical_flow_cadence": "How often to calculate optical flow for warping. Lower values are smoother but slower.",
    "optical_flow_redo_generation": "Re-runs generation on frames where optical flow is recalculated.",
    "noise_type": "The type of noise to use. 'uniform' is standard, 'perlin' offers more structured noise patterns.",
    "perlin_init": "Initializes Perlin noise for more consistent noise patterns across the animation.",
    "perlin_mode": "The mode for Perlin noise application (e.g., 'color', 'gray').",
    "perlin_w": "The width of the Perlin noise pattern, affecting its scale.",
    "perlin_h": "The height of the Perlin noise pattern, affecting its scale.",
    "perlin_octaves": "Number of layers for Perlin noise, adding complexity. Higher values mean more detail.",
    "perlin_persistence": "Controls the amplitude of each octave in Perlin noise. Affects the roughness of the noise.",
    "seed_iter_N": "Number of times to iterate with the same seed before advancing. Used with 'iter' seed behavior.",
    "seed_resize_from_w": "Resizes the initial noise from this width. Set to 0 to disable.",
    "seed_resize_from_h": "Resizes the initial noise from this height. Set to 0 to disable.",
    "use_mask": "Enables the use of a static or video mask to control which parts of the image are changed.",
    "mask_file": "The file path or URL for the mask image or video.",
    "invert_mask": "Inverts the black and white areas of the mask.",
    "W": "The width of the output image in pixels.",
    "H": "The height of the output image in pixels."
};

export const PARAM_TYPES = {
    BOOLEAN: ['use_horizontal_flip', 'use_vertical_flip', 'normalize_latent_vectors', 'use_init', 'use_mask', 'invert_mask'],
    SAMPLER: ['sampler'],
    PROMPTS: ['prompts'],
};