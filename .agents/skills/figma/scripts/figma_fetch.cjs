#!/usr/bin/env node

/**
 * Figma Fetch & Helper CLI for Antigravity /figma skill
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Load .env if present
function loadEnv() {
  const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local')
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...vals] = trimmed.split('=');
          const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
    }
  }
}

loadEnv();

const args = process.argv.slice(2);
let figmaUrl = '';
let downloadImages = false;
let outputDir = 'public/figma-assets';
let isJson = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    figmaUrl = args[++i];
  } else if (args[i] === '--download-images') {
    downloadImages = true;
  } else if (args[i] === '--output-dir' && args[i + 1]) {
    outputDir = args[++i];
  } else if (args[i] === '--json') {
    isJson = true;
  } else if (!figmaUrl && !args[i].startsWith('--')) {
    figmaUrl = args[i];
  }
}

const apiKey = process.env.FIGMA_API_KEY || process.env.FIGMA_PERSONAL_ACCESS_TOKEN;

if (!figmaUrl) {
  console.log('Usage: node .agents/skills/figma/scripts/figma_fetch.cjs --url <Figma URL or File Key> [--download-images] [--output-dir public/assets]');
  if (!apiKey || apiKey === 'your_figma_personal_access_token_here') {
    console.log('\nNote: FIGMA_API_KEY is not set in .env yet.');
  }
  process.exit(0);
}

if (!apiKey || apiKey === 'your_figma_personal_access_token_here') {
  console.error('\x1b[31m[Figma Skill Error]\x1b[0m FIGMA_API_KEY is missing or set to placeholder in .env.');
  console.error('Please set FIGMA_API_KEY in your .env file.');
  console.error('To generate a token: Figma -> Account Settings -> Personal Access Tokens.');
  process.exit(1);
}

// Extract file key and node id from Figma URL
function parseFigmaUrl(url) {
  let fileKey = '';
  let nodeId = '';
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const designIndex = parts.findIndex(p => p === 'file' || p === 'design' || p === 'proto');
    if (designIndex !== -1 && parts[designIndex + 1]) {
      fileKey = parts[designIndex + 1];
    } else if (parts.length > 0) {
      fileKey = parts[0];
    }

    const nodeParam = parsed.searchParams.get('node-id');
    if (nodeParam) {
      nodeId = nodeParam.replace('-', ':');
    }
  } catch (e) {
    fileKey = url;
  }
  return { fileKey, nodeId };
}

const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
console.log(`[Figma Skill] Fetching Figma File Key: ${fileKey}${nodeId ? ' (Node: ' + nodeId + ')' : ''}...`);

// Use figma-developer-mcp via npx
const mcpArgs = ['-y', 'figma-developer-mcp', 'fetch', '--figma-api-key', apiKey];
if (isJson) mcpArgs.push('--json');
mcpArgs.push(figmaUrl);

const res = spawnSync('npx', mcpArgs, { encoding: 'utf8', shell: true });

if (res.error) {
  console.error('[Figma Skill Error] Failed to execute figma-developer-mcp:', res.error.message);
  process.exit(1);
}

if (res.status !== 0) {
  console.error('[Figma Skill Output]:', res.stderr || res.stdout);
  process.exit(res.status);
}

console.log(res.stdout);
