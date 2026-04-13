// src/components/Icon.jsx
export default function Icon({ name, size = 24, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
        >
            <use href={`/sprite.svg#${name}`} />
        </svg>
    );
}
