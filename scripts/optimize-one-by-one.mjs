#!/usr/bin/env node
/**
 * Script de Otimização de GIFs - Um por vez
 * Processa cada GIF individualmente para evitar travamentos
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import readline from 'readline';

const exec = promisify(execCallback);

const CONFIG = {
  inputDir: path.join(process.cwd(), 'public', 'assets', 'projects'),
  outputDir: path.join(process.cwd(), 'public', 'assets', 'projects', 'optimized'),
  gifOptimizationLevel: 2, // Reduced for speed
  webpQuality: 75, // Reduced for speed
};

class OneByOneOptimizer {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async init() {
    console.log('🚀 Otimização GIF - Um por vez\n');
    
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      console.log(`📁 Diretório criado: ${CONFIG.outputDir}\n`);
    }

    // Check ffmpeg
    try {
      await exec('ffmpeg -version');
      console.log('✅ FFmpeg encontrado');
    } catch {
      console.log('❌ FFmpeg não encontrado');
      process.exit(1);
    }

    // Check gifsicle
    try {
      await exec('gifsicle --version');
      console.log('✅ Gifsicle encontrado\n');
    } catch {
      console.log('⚠️ Gifsicle não encontrado - usando FFmpeg apenas\n');
    }
  }

  findGifFiles(dir) {
    const files = [];
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && item !== 'optimized') {
          files.push(...this.findGifFiles(fullPath));
        } else if (stat.isFile() && path.extname(item).toLowerCase() === '.gif') {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao ler diretório ${dir}: ${error.message}`);
    }
    return files;
  }

  async askUser(question) {
    return new Promise(resolve => {
      this.rl.question(question, answer => {
        resolve(answer.toLowerCase().trim());
      });
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async optimizeWithGifsicle(inputPath, outputPath) {
    try {
      console.log('  🔄 Tentando com Gifsicle...');
      const cmd = `gifsicle -O${CONFIG.gifOptimizationLevel} --colors 256 "${inputPath}" -o "${outputPath}"`;
      await exec(cmd, { timeout: 120000 }); // 2 min timeout
      
      const originalSize = fs.statSync(inputPath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      console.log(`  ✅ GIF otimizado: ${this.formatBytes(optimizedSize)} (${savings}% menor)`);
      return true;
    } catch (error) {
      console.log(`  ❌ Gifsicle falhou: ${error.message}`);
      return false;
    }
  }

  async optimizeWithFFmpeg(inputPath, outputPath) {
    try {
      console.log('  🔄 Tentando com FFmpeg...');
      const cmd = `ffmpeg -i "${inputPath}" -vf "fps=20,scale=1200:-1:flags=lanczos" -y "${outputPath}"`;
      await exec(cmd, { timeout: 180000 }); // 3 min timeout
      
      const originalSize = fs.statSync(inputPath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      console.log(`  ✅ GIF otimizado (FFmpeg): ${this.formatBytes(optimizedSize)} (${savings}% menor)`);
      return true;
    } catch (error) {
      console.log(`  ❌ FFmpeg falhou: ${error.message}`);
      return false;
    }
  }

  async convertToWebP(inputPath, outputPath) {
    try {
      console.log('  🔄 Convertendo para WebP...');
      const cmd = `ffmpeg -i "${inputPath}" -c:v libwebp -quality ${CONFIG.webpQuality} -preset default -loop 0 -compression_level 4 -y "${outputPath}"`;
      await exec(cmd, { timeout: 120000 }); // 2 min timeout
      
      const originalSize = fs.statSync(inputPath).size;
      const webpSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      
      console.log(`  ✅ WebP criado: ${this.formatBytes(webpSize)} (${savings}% menor)`);
      return true;
    } catch (error) {
      console.log(`  ❌ WebP falhou: ${error.message}`);
      return false;
    }
  }

  async processGif(gifPath) {
    const fileName = path.basename(gifPath);
    const nameWithoutExt = path.parse(fileName).name;
    const fileSize = fs.statSync(gifPath).size;
    
    console.log(`\n📁 ${fileName}`);
    console.log(`📊 Tamanho: ${this.formatBytes(fileSize)}`);
    console.log('─'.repeat(50));

    const optimizedGifPath = path.join(CONFIG.outputDir, `${nameWithoutExt}_optimized.gif`);
    const webpPath = path.join(CONFIG.outputDir, `${nameWithoutExt}.webp`);

    // Check if files already exist
    const gifExists = fs.existsSync(optimizedGifPath);
    const webpExists = fs.existsSync(webpPath);

    if (gifExists && webpExists) {
      console.log('  ✅ Já otimizado - pulando');
      return;
    }

    // Ask what to generate
    console.log('\nO que gerar?');
    console.log('1. GIF otimizado');
    console.log('2. WebP animado');
    console.log('3. Ambos');
    console.log('4. Pular este arquivo');
    
    const choice = await this.askUser('Escolha (1-4): ');

    if (choice === '4') {
      console.log('  ⏭️ Pulando...');
      return;
    }

    // Generate optimized GIF
    if (choice === '1' || choice === '3') {
      if (!gifExists) {
        console.log('\n🎬 Otimizando GIF...');
        const success = await this.optimizeWithGifsicle(gifPath, optimizedGifPath) || 
                       await this.optimizeWithFFmpeg(gifPath, optimizedGifPath);
        
        if (!success) {
          console.log('  ❌ Falha na otimização do GIF');
        }
      } else {
        console.log('  ✅ GIF otimizado já existe');
      }
    }

    // Generate WebP
    if (choice === '2' || choice === '3') {
      if (!webpExists) {
        console.log('\n🌐 Criando WebP...');
        await this.convertToWebP(gifPath, webpPath);
      } else {
        console.log('  ✅ WebP já existe');
      }
    }

    console.log('✅ Concluído!');
    
    // Pause between files
    await this.askUser('\nPressione Enter para continuar...');
  }

  async run() {
    await this.init();
    
    const gifFiles = this.findGifFiles(CONFIG.inputDir);
    
    if (gifFiles.length === 0) {
      console.log('❌ Nenhum GIF encontrado');
      this.rl.close();
      return;
    }

    console.log(`📊 Encontrados ${gifFiles.length} GIFs:\n`);
    gifFiles.forEach((file, i) => {
      console.log(`${i + 1}. ${path.basename(file)}`);
    });

    const startChoice = await this.askUser('\nComeçar do arquivo número (ou "all" para todos): ');
    
    let startIndex = 0;
    if (startChoice !== 'all') {
      startIndex = parseInt(startChoice) - 1;
      if (isNaN(startIndex) || startIndex < 0 || startIndex >= gifFiles.length) {
        console.log('❌ Número inválido');
        this.rl.close();
        return;
      }
    }

    for (let i = startIndex; i < gifFiles.length; i++) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📂 Processando ${i + 1}/${gifFiles.length}`);
      console.log(`${'='.repeat(60)}`);
      
      await this.processGif(gifFiles[i]);
    }

    console.log('\n🎉 Todos os arquivos processados!');
    this.rl.close();
  }
}

const optimizer = new OneByOneOptimizer();
optimizer.run().catch(error => {
  console.error('❌ Erro:', error);
  process.exit(1);
});