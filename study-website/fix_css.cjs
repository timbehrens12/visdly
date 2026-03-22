const fs = require('fs');
const path = 'c:\\Users\\Kortez\\Desktop\\study-website\\study-website\\src\\index.css';

let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

const darkStart = lines.findIndex(line => line.includes('.dark {'));

if (darkStart === -1) {
    console.error("Could not find .dark block");
    process.exit(1);
}

const header = lines.slice(0, darkStart);

const darkContent = [
    ".dark {",
    "  /* Brand Colors - adjusted for dark mode */",
    "  --color-brand-primary: #38bdf8;",
    "  --color-brand-primary-hover: #0ea5e9;",
    "  --color-brand-primary-light: #0c4a6e;",
    "  --color-brand-secondary: #818cf8;",
    "  --color-brand-secondary-hover: #6366f1;",
    "  --color-brand-accent: #a78bfa;",
    "",
    "  /* Background & Surface Colors - Deep Black/Zinc */",
    "  --color-background: #09090b;",
    "  --color-background-card: #0c0c0d;",
    "  --color-background-card-alt: #111112;",
    "  --color-background-elevated: #18181b;",
    "  --color-background-glass: rgba(9, 9, 11, 0.8);",
    "",
    "  --color-surface: #0c0c0d;",
    "  --color-surface-hover: #18181b;",
    "  --color-surface-active: #27272a;",
    "",
    "  /* Text Colors */",
    "  --color-foreground: #fafafa;",
    "  --color-foreground-secondary: #a1a1aa;",
    "  --color-foreground-muted: #71717a;",
    "  --color-foreground-inverse: #09090b;",
    "",
    "  /* Border Colors */",
    "  --color-border: #18181b;",
    "  --color-border-light: #0f172a;",
    "  --color-border-strong: #27272a;",
    "",
    "  /* Semantic Colors */",
    "  --color-success: #34d399;",
    "  --color-warning: #fbbf24;",
    "  --color-error: #f87171;",
    "  --color-info: #60a5fa;",
    "",
    "  /* Shadows - deeper for dark mode */",
    "  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);",
    "  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);",
    "  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);",
    "  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.4);",
    "  --shadow-primary: 0 10px 40px -10px rgba(56, 189, 248, 0.2);",
    "}",
    ""
];

const baseLayer = [
    "@layer base {",
    "    html {",
    "        scroll-behavior: smooth;",
    "    }",
    "",
    "    body {",
    "        @apply bg-background text-foreground antialiased selection:bg-primary/30;",
    "        font-family: 'Plus Jakarta Sans', sans-serif;",
    "        background-attachment: fixed;",
    "        min-height: 100vh;",
    "        transition: background-color 0.3s ease, color 0.3s ease;",
    "    }",
    "",
    "    /* Ensure navbar stays fixed */",
    "    nav[class*=\"fixed\"] {",
    "        position: fixed !important;",
    "        top: 0 !important;",
    "        left: 0 !important;",
    "        right: 0 !important;",
    "        transform: none !important;",
    "        will-change: auto;",
    "    }",
    "",
    "    p, li {",
    "        font-family: 'Inter', sans-serif;",
    "    }",
    "}",
    ""
];

let resumeIdx = lines.findIndex((line, idx) => idx > darkStart && (line.includes('.perspective-1000') || line.includes('.transform-style-3d')));

if (resumeIdx === -1) {
    resumeIdx = lines.findIndex((line, idx) => idx > darkStart && line.includes('.premium-card'));
}

if (resumeIdx === -1) {
    resumeIdx = lines.findIndex((line, idx) => idx > darkStart && line.includes('@layer utilities'));
}

const utilitiesStart = ["@layer utilities {"];

const finalLines = [...header, ...darkContent, ...baseLayer, ...utilitiesStart, ...lines.slice(resumeIdx)];

fs.writeFileSync(path, finalLines.join('\n'));
console.log(`Successfully reconstructed ${path}`);
