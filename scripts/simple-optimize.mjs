#!/usr/bin/env node
/**
 * Script Simples de Otimização de GIFs
 * Foca apenas no essencial: thumbnails
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

const CONFIG = {
  inputDir: path.join(process.cwd(), 'public', 'assets', 'projects'),
  outputDir: path.join(process.cwd(), 'public', 'assets', 'projects', 'optimized'),
  thumbnailQuality: 85,
  thumbnailWidth: 640
};

class SimpleGifOptimizer {
  constructor() {
    this.stats = {
      originalSize: 0,
      optimizedSize: 0,
      filesProcessed: 0,
      errors: []
    };
  }

  async init() {
    console.log('🚀 Iniciando otimização simples de GIFs...\n');
    
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      console.log(`📁 Diretório criado: ${CONFIG.outputDir}\n`);
    }

    // Verificar se ffmpeg existe
    try {
      await exec('ffmpeg -version');
      console.log('✅ FFmpeg encontrado\n');
    } catch {
      console.log('❌ FFmpeg não encontrado. Instale primeiro.\n');
      process.exit(1);
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

  async createThumbnail(inputPath, outputPath) {
    try {
      const cmd = `ffmpeg -i "${inputPath}" -vframes 1 -vf "scale=${CONFIG.thumbnailWidth}:-1" -q:v ${CONFIG.thumbnailQuality} "${outputPath}" -y -loglevel quiet`;
      await exec(cmd, { timeout: 30000 });
      
      const size = fs.statSync(outputPath).size;
      console.log(`  ✅ Thumbnail: ${this.formatBytes(size)}`);
      return size;
    } catch (error) {
      console.log(`  ❌ Falha thumbnail: ${error.message}`);
      return 0;
    }
  }

  async processGif(gifPath) {
    const fileName = path.basename(gifPath);
    const nameWithoutExt = path.parse(fileName).name;
    const fileSize = fs.statSync(gifPath).size;
    
    this.stats.originalSize += fileSize;
    this.stats.filesProcessed++;

    console.log(`\n📁 ${fileName} (${this.formatBytes(fileSize)})`);
    
    const outputPath = path.join(CONFIG.outputDir, `${nameWithoutExt}_thumb.jpg`);
    const thumbSize = await this.createThumbnail(gifPath, outputPath);
    this.stats.optimizedSize += thumbSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async run() {
    await this.init();
    
    const gifFiles = this.findGifFiles(CONFIG.inputDir);
    
    if (gifFiles.length === 0) {
      console.log('❌ Nenhum GIF encontrado');
      return;
    }

    console.log(`📊 Processando ${gifFiles.length} arquivos:`);
    
    for (const gifPath of gifFiles) {
      await this.processGif(gifPath);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO');
    console.log('='.repeat(50));
    console.log(`📁 Arquivos: ${this.stats.filesProcessed}`);
    console.log(`💾 Original: ${this.formatBytes(this.stats.originalSize)}`);
    console.log(`✨ Thumbnails: ${this.formatBytes(this.stats.optimizedSize)}`);
    
    const savings = this.stats.originalSize - this.stats.optimizedSize;
    const percent = (savings / this.stats.originalSize * 100).toFixed(1);
    console.log(`🎯 Economia: ${this.formatBytes(savings)} (${percent}%)`);
    
    console.log('\n✅ Concluído! Thumbnails criados com sucesso.');
  }
}

const optimizer = new SimpleGifOptimizer();
optimizer.run().catch(console.error);