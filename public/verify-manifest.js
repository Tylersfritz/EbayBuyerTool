
/**
 * Manifest Verification Script
 * Run this script to check if your manifest.json file exists and is valid
 * Usage: node public/verify-manifest.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking manifest.json files...');

// Check public/manifest.json
const publicManifestPath = path.resolve('./public/manifest.json');
console.log(`\nChecking ${publicManifestPath}`);

if (fs.existsSync(publicManifestPath)) {
  console.log('✅ public/manifest.json exists');
  
  try {
    const manifestContent = fs.readFileSync(publicManifestPath, 'utf8');
    console.log(`📊 File size: ${manifestContent.length} bytes`);
    console.log(`📝 First few characters: ${manifestContent.substring(0, 50)}...`);
    
    try {
      const manifest = JSON.parse(manifestContent);
      console.log('✅ public/manifest.json is valid JSON');
      console.log(`📋 Contains ${Object.keys(manifest).length} top-level properties`);
      console.log('📌 Key properties:');
      console.log(` - name: ${manifest.name || 'MISSING'}`);
      console.log(` - version: ${manifest.version || 'MISSING'}`);
      console.log(` - manifest_version: ${manifest.manifest_version || 'MISSING'}`);
    } catch (jsonError) {
      console.error('❌ public/manifest.json is NOT valid JSON:', jsonError.message);
      console.log('\nInvalid JSON contents:');
      console.log(manifestContent);
    }
  } catch (readError) {
    console.error('❌ Error reading public/manifest.json:', readError.message);
  }
} else {
  console.error('❌ public/manifest.json does NOT exist!');
}

// Check dist/manifest.json
const distManifestPath = path.resolve('./dist/manifest.json');
console.log(`\nChecking ${distManifestPath}`);

if (fs.existsSync(distManifestPath)) {
  console.log('✅ dist/manifest.json exists');
  
  try {
    const manifestContent = fs.readFileSync(distManifestPath, 'utf8');
    console.log(`📊 File size: ${manifestContent.length} bytes`);
    
    try {
      JSON.parse(manifestContent);
      console.log('✅ dist/manifest.json is valid JSON');
    } catch (jsonError) {
      console.error('❌ dist/manifest.json is NOT valid JSON:', jsonError.message);
    }
    
    // Compare with public version
    if (fs.existsSync(publicManifestPath)) {
      const publicContent = fs.readFileSync(publicManifestPath, 'utf8');
      if (publicContent === manifestContent) {
        console.log('✅ dist/manifest.json is identical to public/manifest.json');
      } else {
        console.warn('⚠️ dist/manifest.json is different from public/manifest.json');
      }
    }
  } catch (readError) {
    console.error('❌ Error reading dist/manifest.json:', readError.message);
  }
} else {
  console.error('❌ dist/manifest.json does NOT exist!');
}

console.log('\n🔍 Checking dist directory contents:');
if (fs.existsSync('./dist')) {
  try {
    const distFiles = fs.readdirSync('./dist');
    console.log(`Found ${distFiles.length} files in dist directory:`);
    distFiles.forEach(file => {
      try {
        const stats = fs.statSync(path.join('./dist', file));
        console.log(` - ${file} (${stats.size} bytes)`);
      } catch (err) {
        console.log(` - ${file} (error getting size: ${err.message})`);
      }
    });
  } catch (err) {
    console.error('❌ Error reading dist directory:', err.message);
  }
} else {
  console.error('❌ dist directory does NOT exist!');
}

console.log('\n🔍 Checking if public directory contains required files:');
const requiredFiles = [
  'manifest.json',
  'icon-16.png',
  'icon-48.png',
  'icon-128.png',
  'content.js',
  'background.js'
];

if (fs.existsSync('./public')) {
  requiredFiles.forEach(file => {
    const filePath = path.join('./public', file);
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file} exists (${stats.size} bytes)`);
      } catch (err) {
        console.log(`✅ ${file} exists (error getting size: ${err.message})`);
      }
    } else {
      console.error(`❌ ${file} is MISSING!`);
    }
  });
} else {
  console.error('❌ public directory does NOT exist!');
}
