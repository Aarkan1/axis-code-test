type IconProps = {
    className?: string
}

const iconProps = {
    'aria-hidden': true,
    fill: 'none',
    height: 24,
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
    width: 24
} as const

export const CameraIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={className}>
        <path d="M4 8.5h3l1.4-2h7.2l1.4 2h3v9.5H4z" />
        <path d="M9 13.2a3 3 0 1 0 6 0 3 3 0 0 0-6 0" />
        <path d="M17.8 11h.2" />
    </svg>
)

export const NetworkIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={className}>
        <path d="M12 5.5v4" />
        <path d="M7 18.5l3.3-4.2" />
        <path d="M17 18.5l-3.3-4.2" />
        <path d="M9.5 11.5h5" />
        <path d="M10 5.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
        <path d="M5 18.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
        <path d="M15 18.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
    </svg>
)

export const ShieldIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={className}>
        <path d="M12 3.5 19 6v5.5c0 4-2.8 7.4-7 9-4.2-1.6-7-5-7-9V6z" />
        <path d="m9.5 12 1.7 1.7 3.7-4" />
    </svg>
)

export const AlertIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={className}>
        <path d="M12 8v5" />
        <path d="M12 17h.01" />
        <path d="M10.3 4.8 3.4 17.1A2 2 0 0 0 5.1 20h13.8a2 2 0 0 0 1.7-2.9L13.7 4.8a2 2 0 0 0-3.4 0" />
    </svg>
)

export const SuccessIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={className}>
        <path d="M20 7 10 17l-5-5" />
    </svg>
)

export const InfoIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={className}>
        <path d="M12 17v-6" />
        <path d="M12 7h.01" />
        <path d="M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0" />
    </svg>
)
