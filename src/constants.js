// src/constants.js

export const SAMPLERS = [
    'euler', 'euler_a', 'lms', 'heun', 'dpm_2', 'dpm_2_a', 'dpmpp_2s_a', 
    'dpmpp_2m', 'dpmpp_sde', 'ddim', 'uni_pc'
];
export const SEED_BEHAVIORS = ['iter', 'fixed', 'random'];
export const BORDER_MODES = ['wrap', 'replicate', 'reflect', 'zeros'];
export const NOISE_TYPES = ['uniform', 'perlin'];

export const PARAM_DESCRIPTIONS = {
    "strength_schedule": "Controls how much the new frame is influenced by the previous one. Higher values mean more change.",
    "cfg_scale": "Controls how strongly the prompt influences the image. Higher values mean stricter adherence to the prompt.",
    "seed": "The starting noise pattern. Different seeds produce different images for the same prompt.",
    "steps": "Number of diffusion steps. More steps can increase detail but also take longer.",
    "zoom": "Simulates camera zoom. Positive values zoom in, negative values zoom out.",
    "translation_x": "Moves the frame left (negative) or right (positive).",
    "translation_y": "Moves the frame up (negative) or down (positive).",
    "translation_z": "Moves the frame forward (positive) or backward (negative) in 3D mode.",
    "rotation_2d": "Rotates the frame clockwise (positive) or counter-clockwise (negative) in 2D mode.",
    "rotation_3d_x": "Rotates the frame around the X-axis (tilts up/down).",
    "rotation_3d_y": "Rotates the frame around the Y-axis (pans left/right).",
    "rotation_3d_z": "Rotates the frame around the Z-axis (rolls clockwise/counter-clockwise).",
    "sampler": "The algorithm used for the diffusion process (e.g., 'euler a', 'dpm++').",
    "animation_mode": "The type of animation, like '2D' or '3D'.",
    "max_frames": "The total number of frames in the animation.",
    "fps": "Frames Per Second. Controls the speed of the final video.",
    "color_coherence": "Tries to maintain consistent colors between frames.",
    "noise_schedule": "Controls the amount of noise added at different stages of the animation.",
    "prompts": "The text descriptions for the AI to generate images from. Can be keyframed for animation."
};

export const PARAMETER_GROUPS = {
    "Prompts": ["prompts"],
    "Special Parameters": ["sampler"],
    "Favorites": [
        "strength_schedule", "cfg_scale", "seed", "seed_behavior", "steps",
        "zoom", "translation_x", "translation_y", "translation_z",
        "rotation_2d", "rotation_3d_x", "rotation_3d_y", "rotation_3d_z", "noise_schedule"
    ],
    "Run & Animation": ["animation_mode", "max_frames", "fps"],
    "2D Motion": [
        "zoom",
        "translation_x",
        "translation_y",
        "rotation_2d"
    ],
    "3D Motion": [
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
    "Cohesion & Consistency": [
        "strength_schedule", "color_coherence", "diffusion_cadence",
        "use_horizontal_flip", "use_vertical_flip", "optical_flow_cadence", "optical_flow_redo_generation"
    ],
    "Noise": ["noise_schedule", "noise_type", "perlin_init", "perlin_mode", "perlin_w", "perlin_h", "perlin_octaves", "perlin_persistence"],
    "Seed": ["seed", "seed_behavior", "seed_iter_N"],
    "CFG & Sampling": ["cfg_scale", "steps", "seed_resize_from_w", "seed_resize_from_h"],
    "Image Dimensions": ["W", "H"],
};

export const PARAM_TYPES = {
    BOOLEAN: ['use_horizontal_flip', 'use_vertical_flip', 'normalize_latent_vectors'],
    SAMPLER: ['sampler'],
    PROMPTS: ['prompts'],
};
