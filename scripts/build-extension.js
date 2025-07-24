import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function buildExtension() {
  console.log('🏗️  Building TrendLens Chrome Extension...\n');

  try {
    // Clean dist directory
    console.log('🧹 Cleaning dist directory...');
    await fs.remove(path.join(projectRoot, 'dist'));
    await fs.ensureDir(path.join(projectRoot, 'dist'));

    // Build React app with Vite
    console.log('⚛️  Building React popup...');
    execSync('npm run build', { 
      cwd: projectRoot, 
      stdio: 'inherit' 
    });

    // Copy manifest.json
    console.log('📋 Copying manifest...');
    await fs.copy(
      path.join(projectRoot, 'manifest.json'),
      path.join(projectRoot, 'dist', 'manifest.json')
    );

    // Copy icons
    console.log('🎨 Copying icons...');
    await fs.ensureDir(path.join(projectRoot, 'dist', 'icons'));
    
    // Create placeholder icons if they don't exist
    const iconSizes = [16, 32, 48, 128];
    for (const size of iconSizes) {
      const iconPath = path.join(projectRoot, 'dist', 'icons', `icon-${size}.png`);
      if (!await fs.pathExists(iconPath)) {
        // Create a simple placeholder icon using canvas (in a real project, use actual icon files)
        const iconContent = createPlaceholderIcon(size);
        await fs.writeFile(iconPath, iconContent);
      }
    }

    // Copy and compile content scripts
    console.log('📜 Processing content scripts...');
    await fs.ensureDir(path.join(projectRoot, 'dist', 'content'));
    
    // Transpile TypeScript content scripts to JavaScript
    execSync('npx tsc src/content/overlay.ts --outDir dist/content --target es2020 --module es2020 --moduleResolution bundler --skipLibCheck', {
      cwd: projectRoot,
      stdio: 'inherit'
    });

    // Copy html2canvas library
    console.log('📚 Copying libraries...');
    await fs.ensureDir(path.join(projectRoot, 'dist', 'lib'));
    await fs.copy(
      path.join(projectRoot, 'lib', 'html2canvas.min.js'),
      path.join(projectRoot, 'dist', 'lib', 'html2canvas.min.js')
    );

    // Update manifest with correct file paths
    console.log('🔧 Updating manifest paths...');
    const manifest = await fs.readJson(path.join(projectRoot, 'dist', 'manifest.json'));
    manifest.action.default_popup = 'popup.html';
    await fs.writeJson(path.join(projectRoot, 'dist', 'manifest.json'), manifest, { spaces: 2 });

    console.log('\n✅ Extension built successfully!');
    console.log('\n📦 Extension files are in the "dist" directory');
    console.log('🔧 To install: Open Chrome Extensions page, enable Developer mode, and click "Load unpacked"');
    console.log('📁 Select the "dist" folder to install the extension\n');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

function createPlaceholderIcon(size) {
  // This is a placeholder - in a real project, you'd have actual icon files
  // For now, we'll create a simple text file as a placeholder
  return Buffer.from(`Placeholder icon ${size}x${size}`);
}

buildExtension();