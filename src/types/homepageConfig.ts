export interface HomepageConfig {
    id: string;
    is_active: boolean;

    // Hero Section Text
    hero_title_line1: string;
    hero_title_line2: string;
    hero_title_line3: string;
    hero_subtitle: string;
    hero_badge_text: string;

    // Colors
    primary_color: string;
    secondary_color: string;
    accent_color: string;

    // CTA Buttons
    cta_primary_text: string;
    cta_secondary_text: string;

    // Particle Animations (Floating particles)
    enable_particle_animation: boolean;
    particle_count: number;
    particle_size: number;
    particle_speed: number;
    particle_opacity: number;
    particle_color: string;

    // Gradient Animation (Mouse-following holographic gradient)
    enable_gradient_animation: boolean;
    gradient_speed: number;
    gradient_opacity: number;
    gradient_mouse_sensitivity: number; // 0-100, controls spring stiffness

    // Grid Background
    enable_grid: boolean;
    grid_opacity: number;
    grid_color: string;

    // 3D Sphere
    enable_sphere: boolean;
    sphere_opacity: number;
    sphere_rotation_speed: number;

    enable_scroll_indicator: boolean;

    // Background Type
    background_type: 'particles' | 'gradient' | 'none' | 'custom';
    // Layout
    hero_text_alignment: 'left' | 'center' | 'right';

    // Metadata
    created_at: string;
    updated_at: string;
    created_by?: string;
}
