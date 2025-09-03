#!/usr/bin/env node
/**
 * Script de Otimização de GIFs - Automático
 * Processa todos os GIFs para GIFs otimizados menores
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

const CONFIG = {
  inputDir: path.join(process.cwd(), 'public', 'assets', 'projects'),
  outputDir: path.join(process.cwd(), 'public', 'assets', 'projects', 'optimized'),
  gifOptimizationLevel: 2,
  maxWidth: 1000, // Reduced for better performance
};

class GifOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      skipped: 0,
      errors: 0
    };
  }

  async init() {
    console.log('🚀 Otimizando GIFs automaticamente...\n');
    
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    try {
      await exec('gifsicle --version');
      console.log('✅ Gifsicle encontrado');
    } catch {
      console.log('⚠️ Gifsicle não encontrado - usando FFmpeg');
    }

    try {
      await exec('ffmpeg -version');
      console.log('✅ FFmpeg encontrado\n');
    } catch {
      console.log('❌ FFmpeg não encontrado');
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

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async optimizeGif(inputPath, outputPath) {
    const startTime = Date.now();
    
    try {
      // Try gifsicle first (usually better quality and smaller)
      console.log('  🔧 Usando gifsicle...');
      const cmd = `gifsicle -O${CONFIG.gifOptimizationLevel} --colors 256 --resize-fit ${CONFIG.maxWidth}x${CONFIG.maxWidth} "${inputPath}" -o "${outputPath}"`;
      await exec(cmd, { timeout: 240000 }); // 4 min timeout
      
    } catch (gifsicleError) {
      console.log('  ⚠️ Gifsicle falhou, tentando FFmpeg...');
      
      try {
        // Fallback to ffmpeg
        const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "fps=15,scale=${CONFIG.maxWidth}:-1:flags=lanczos" -y "${outputPath}"`;
        await exec(ffmpegCmd, { timeout: 240000 }); // 4 min timeout
        
      } catch (ffmpegError) {
        throw new Error(`Ambos falharam - Gifsicle: ${gifsicleError.message}, FFmpeg: ${ffmpegError.message}`);
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`  ✅ Concluído em ${duration}s`);
    console.log(`  📊 ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${savings}% menor)\n`);
    
    return { originalSize, optimizedSize, savings: parseFloat(savings) };
  }

  async processGif(gifPath) {
    const fileName = path.basename(gifPath);
    const nameWithoutExt = path.parse(fileName).name;
    
    console.log(`📁 Processando: ${fileName}`);
    
    const outputPath = path.join(CONFIG.outputDir, `${nameWithoutExt}_optimized.gif`);
    
    // Check if already exists
    if (fs.existsSync(outputPath)) {
      console.log('  ⏭️ Já existe - pulando\n');
      this.stats.skipped++;
      return null;
    }

    try {
      const result = await this.optimizeGif(gifPath, outputPath);
      this.stats.processed++;
      return result;
    } catch (error) {
      console.log(`  ❌ Erro: ${error.message}\n`);
      this.stats.errors++;
      return null;
    }
  }

  async run() {
    await this.init();
    
    const gifFiles = this.findGifFiles(CONFIG.inputDir);
    
    if (gifFiles.length === 0) {
      console.log('❌ Nenhum GIF encontrado');
      return;
    }

    console.log(`📊 Encontrados ${gifFiles.length} GIFs para processar:\n`);
    
    const results = [];
    let totalOriginal = 0;
    let totalOptimized = 0;

    for (let i = 0; i < gifFiles.length; i++) {
      console.log(`[${i + 1}/${gifFiles.length}] ${'='.repeat(50)}`);
      
      const result = await this.processGif(gifFiles[i]);
      if (result) {
        results.push(result);
        totalOriginal += result.originalSize;
        totalOptimized += result.optimizedSize;
      }
      
      // Small delay to prevent system overload
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO FINAL');
    console.log('='.repeat(60));
    console.log(`📁 Processados: ${this.stats.processed}`);
    console.log(`⏭️ Pulados: ${this.stats.skipped}`);
    console.log(`❌ Erros: ${this.stats.errors}`);
    
    if (results.length > 0) {
      const totalSavings = ((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1);
      console.log(`💾 Tamanho original: ${this.formatBytes(totalOriginal)}`);
      console.log(`✨ Tamanho otimizado: ${this.formatBytes(totalOptimized)}`);
      console.log(`🎯 Economia total: ${this.formatBytes(totalOriginal - totalOptimized)} (${totalSavings}%)`);
    }
    
    console.log('\n✅ Otimização concluída!');
    console.log(`📂 Arquivos salvos em: ${CONFIG.outputDir}`);
  }
}

const optimizer = new GifOptimizer();
optimizer.run().catch(console.error);