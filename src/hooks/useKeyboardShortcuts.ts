import { useEffect, useCallback } from 'react';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
    /** Key combination (e.g., "meta+k", "escape", "ctrl+shift+p") */
    keys: string;
    /** Handler function when shortcut is triggered */
    handler: () => void;
    /** Description for help/documentation */
    description?: string;
    /** Whether this shortcut should work in input fields */
    allowInInputs?: boolean;
}

/**
 * Parse a key string into a normalized format
 */
const normalizeKey = (key: string): string => {
    return key.toLowerCase()
        .replace('cmd', 'meta')
        .replace('command', 'meta')
        .replace('ctrl', 'control')
        .replace('option', 'alt');
};

/**
 * Check if the current event matches the shortcut keys
 */
const matchesShortcut = (event: KeyboardEvent, keys: string): boolean => {
    const parts = normalizeKey(keys).split('+').map(p => p.trim());

    const modifiers = {
        meta: parts.includes('meta'),
        control: parts.includes('control'),
        alt: parts.includes('alt'),
        shift: parts.includes('shift'),
    };

    // Get the main key (last part that isn't a modifier)
    const mainKey = parts.find(p =>
        !['meta', 'control', 'alt', 'shift'].includes(p)
    );

    // Check modifiers match
    if (modifiers.meta !== event.metaKey) return false;
    if (modifiers.control !== event.ctrlKey) return false;
    if (modifiers.alt !== event.altKey) return false;
    if (modifiers.shift !== event.shiftKey) return false;

    // Check main key matches
    if (!mainKey) return false;
    return event.key.toLowerCase() === mainKey;
};

/**
 * Check if the event target is an input element
 */
const isInputElement = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;

    const tagName = target.tagName.toLowerCase();
    if (['input', 'textarea', 'select'].includes(tagName)) return true;
    if (target.isContentEditable) return true;

    return false;
};

/**
 * Hook for managing keyboard shortcuts
 * 
 * @description
 * Registers global keyboard shortcuts with proper cleanup.
 * Supports modifier keys (meta/cmd, ctrl, alt, shift).
 * Automatically prevents shortcuts in input fields unless allowed.
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   { keys: 'meta+k', handler: () => setCommandPaletteOpen(true), description: 'Open command palette' },
 *   { keys: 'escape', handler: () => closeAll(), allowInInputs: true },
 *   { keys: 'ctrl+shift+p', handler: () => console.log('Power user!') },
 * ]);
 * ```
 * 
 * @param shortcuts - Array of keyboard shortcut definitions
 * @param enabled - Whether shortcuts are currently active (default: true)
 */
export function useKeyboardShortcuts(
    shortcuts: KeyboardShortcut[],
    enabled: boolean = true
): void {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        for (const shortcut of shortcuts) {
            if (matchesShortcut(event, shortcut.keys)) {
                // Check if we should skip input elements
                if (!shortcut.allowInInputs && isInputElement(event.target)) {
                    continue;
                }

                event.preventDefault();
                event.stopPropagation();
                shortcut.handler();
                break;
            }
        }
    }, [shortcuts, enabled]);

    useEffect(() => {
        if (!enabled) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, enabled]);
}

/**
 * Common shortcuts for admin panels
 */
export const commonShortcuts = {
    /** Open command palette */
    COMMAND_PALETTE: 'meta+k',
    /** Close modal/dialog */
    ESCAPE: 'escape',
    /** Save current form */
    SAVE: 'meta+s',
    /** Navigate back */
    BACK: 'meta+left',
    /** Navigate forward */
    FORWARD: 'meta+right',
    /** New item */
    NEW: 'meta+n',
    /** Search */
    SEARCH: 'meta+f',
    /** Toggle sidebar */
    TOGGLE_SIDEBAR: 'meta+b',
} as const;

export default useKeyboardShortcuts;
