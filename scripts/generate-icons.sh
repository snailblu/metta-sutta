#!/bin/bash

# Generate PWA icons

cd /home/node/.openclaw/workspace/metta-sutta/public

# Generate 192x192 icon
echo "Generating 192x192 icon..."
curl -s "http://localhost:3000/icon-192.html" > /tmp/icon-192.html
node -e "
  const { createCanvas, loadImage } = require('canvas');
  const fs = require('fs');

  async function generate() {
    const img = await loadFile('icon-192.html');
    const canvas = createCanvas(192, 192);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('icons/icon-192x192.png', buffer);
    console.log('192x192 icon generated!');
  }
  generate();
" 2>&1

# Generate 512x512 icon
echo "Generating 512x512 icon..."
curl -s "http://localhost:3000/icon-192.html" > /tmp/icon-512.html
node -e "
  const { createCanvas, loadImage } = require('canvas');
  const fs = require('fs');

  async function generate() {
    const img = await loadFile('icon-512.html');
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 512, 512);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('icons/icon-512x512.png', buffer);
    console.log('512x512 icon generated!');
  }
  generate();
" 2>&1

echo "PWA icons generated!"
