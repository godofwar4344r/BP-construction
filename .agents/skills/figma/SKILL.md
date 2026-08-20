---
name: figma
description: Access, inspect, analyze, and extract designs, components, tokens, layout trees, and visual assets from Figma files using Figma MCP / REST API. Triggered whenever the user types /figma or mentions Figma design files.
---

# Figma Design Integration Skill (`/figma`)

This skill enables Antigravity to parse Figma design URLs, extract layout structures (Auto-Layout flex/grid, padding, gap, alignment), fetch color tokens, typography scales, and download component assets into the project.

## Quick Start & Usage

Whenever you type `/figma <Figma URL or File Key>`, Antigravity will execute the Figma workflow:

```bash
/figma https://www.figma.com/design/aBcDeFg12345/My-App-Design?node-id=1-2
```

## Setup (1-Time)

1. Generate a Figma Personal Access Token:
   - Go to **Figma -> Account Settings -> Personal Access Tokens -> Generate new token**.
2. Add your token to `.env` in the workspace:
   ```env
   FIGMA_API_KEY=figd_your_actual_token_here
   ```

## Automated Workflows

### 1. Fetch File / Node Data
```bash
node .agents/skills/figma/scripts/figma_fetch.cjs --url "<Figma-URL-or-File-Key>"
```

### 2. Direct MCP Stdio Fetch
```bash
npx -y figma-developer-mcp fetch --figma-api-key "$FIGMA_API_KEY" "<Figma-URL>"
```

### 3. Extracting Assets to Project
```bash
node .agents/skills/figma/scripts/figma_fetch.cjs --url "<Figma-URL>" --download-images --output-dir "public/figma-assets"
```

## Design-to-Code Mapping Rules
- **Color & Style Tokens**: Map HSL/RGB fills and strokes to CSS variables in `src/index.css`.
- **Layout**: Map Figma Auto-Layout parameters to CSS Flexbox or Grid properties.
- **Typography**: Convert Figma text styles (font size, weight, line-height, letter-spacing) to responsive CSS font rules.
- **Components**: Build reusable React components corresponding to Figma frames & variants.
