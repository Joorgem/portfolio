#!/usr/bin/env node
/**
 * Script de Otimização de GIFs para Portfolio
 * 
 * Funcionalidades:
 * 1. Converte GIFs para WebP animado (60-70% economia)
 * 2. Cria thumbnails estáticos JPG para preview
 * 3. Otimiza GIFs originais
 * 4. Gera relatório de economia de espaço
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
  webpQuality: 80,
  gifOptimizationLevel: 3,
  maxWidth: 1920,
  maxHeight: 1080,
  thumbnailWidth: 640
};

class GifOptimizer {
  constructor() {
    this.stats = {
      originalSize: 0,
      optimizedSize: 0,
      filesProcessed: 0,
      errors: []
    };
  }

  async init() {
    console.log('🚀 Iniciando otimização de GIFs...\n');
    
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      console.log(`📁 Diretório de saída criado: ${CONFIG.outputDir}`);
    }

    await this.checkDependencies();
  }

  async checkDependencies() {
    const dependencies = [
      { name: 'ffmpeg', check: 'ffmpeg -version', install: 'https://ffmpeg.org/download.html' },
      { name: 'gifsicle', check: 'gifsicle --version', install: 'npm install -g gifsicle' },
      { name: 'imagemagick', check: 'magick -version', install: 'https://imagemagick.org/script/download.php' }
    ];

    console.log('🔍 Verificando dependências...');
    
    for (const dep of dependencies) {
      try {
        await exec(dep.check);
        console.log(`✅ ${dep.name} encontrado`);
      } catch (error) {
        console.log(`❌ ${dep.name} não encontrado. Instale em: ${dep.install}`);
        this.stats.errors.push(`${dep.name} não instalado`);
      }
    }

    if (this.stats.errors.length > 0) {
      console.log('\n⚠️ Algumas dependências estão faltando. O script continuará mas algumas otimizações podem falhar.');
    }
    console.log('');
  }

  async processGifs() {
    const gifFiles = this.findGifFiles(CONFIG.inputDir);
    
    if (gifFiles.length === 0) {
      console.log('❌ Nenhum arquivo GIF encontrado em:', CONFIG.inputDir);
      return;
    }

    console.log(`📊 Encontrados ${gifFiles.length} arquivos GIF para processar:\n`);

    for (const gifPath of gifFiles) {
      await this.processGif(gifPath);
    }

    this.printReport();
  }

  findGifFiles(dir) {
    const files = [];
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

    return files;
  }

  async processGif(gifPath) {
    const fileName = path.basename(gifPath);
    const nameWithoutExt = path.parse(fileName).name;
    const fileSize = fs.statSync(gifPath).size;
    
    this.stats.originalSize += fileSize;
    this.stats.filesProcessed++;

    console.log(`\n🎬 Processando: ${fileName} (${this.formatBytes(fileSize)})`);
    console.log('━'.repeat(50));

    const outputBasePath = path.join(CONFIG.outputDir, nameWithoutExt);

    try {
      // Processar em sequência com tratamento de erro individual
      await this.createThumbnail(gifPath, `${outputBasePath}_thumb.jpg`);
      await this.convertToWebP(gifPath, `${outputBasePath}.webp`);
      await this.optimizeOriginalGif(gifPath, `${outputBasePath}_optimized.gif`);
      
      const optimizedSize = this.getOptimizedSize(outputBasePath);
      this.stats.optimizedSize += optimizedSize;
      
      const savings = fileSize > 0 ? ((fileSize - optimizedSize) / fileSize * 100).toFixed(1) : 0;
      console.log(`💾 Economia total: ${savings}%`);
      console.log(`✅ Concluído: ${fileName}`);
      
    } catch (error) {
      console.error(`❌ Erro geral ao processar ${fileName}:`, error.message);
      this.stats.errors.push(`${fileName}: ${error.message}`);
    }
    
    // Pequena pausa entre arquivos para evitar sobrecarga
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async createThumbnail(inputPath, outputPath) {
    try {
      const cmd = `ffmpeg -i "${inputPath}" -vframes 1 -vf "scale=${CONFIG.thumbnailWidth}:-1" -q:v ${CONFIG.thumbnailQuality} "${outputPath}" -y`;
      await exec(cmd);
      
      const size = fs.statSync(outputPath).size;
      console.log(`✅ Thumbnail criado: ${path.basename(outputPath)} (${this.formatBytes(size)})`);
    } catch (error) {
      console.log(`⚠️ Falha ao criar thumbnail: ${error.message}`);
      throw error;
    }
  }

  async convertToWebP(inputPath, outputPath) {
    try {
      // Comando otimizado para WebP com timeout
      const cmd = `ffmpeg -i "${inputPath}" -c:v libwebp -quality ${CONFIG.webpQuality} -preset default -loop 0 -compression_level 4 "${outputPath}" -y`;
      console.log(`🔄 Convertendo para WebP: ${path.basename(inputPath)}...`);
      
      const { stdout, stderr } = await exec(cmd, { timeout: 120000 }); // 2 min timeout
      
      const originalSize = fs.statSync(inputPath).size;
      const webpSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      
      console.log(`✅ WebP criado: ${path.basename(outputPath)} (${this.formatBytes(webpSize)}) - ${savings}% menor`);
    } catch (error) {
      console.log(`⚠️ Falha ao converter para WebP: ${error.message}`);
      // Não parar o script se WebP falhar
      console.log(`🔄 Continuando sem WebP para ${path.basename(inputPath)}...`);
    }
  }

  async optimizeOriginalGif(inputPath, outputPath) {
    try {
      console.log(`🔄 Otimizando GIF original: ${path.basename(inputPath)}...`);
      const cmd = `gifsicle -O${CONFIG.gifOptimizationLevel} --colors 128 "${inputPath}" -o "${outputPath}"`;
      await exec(cmd, { timeout: 180000 }); // 3 min timeout
      
      const originalSize = fs.statSync(inputPath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      console.log(`✅ GIF otimizado: ${path.basename(outputPath)} (${this.formatBytes(optimizedSize)}) - ${savings}% menor`);
    } catch (error) {
      console.log(`⚠️ Falha ao otimizar GIF com gifsicle: ${error.message}`);
      console.log(`🔄 Tentando método alternativo...`);
      
      try {
        const altCmd = `ffmpeg -i "${inputPath}" -vf "fps=15,scale=${CONFIG.maxWidth}:-1:flags=lanczos" "${outputPath}" -y`;
        await exec(altCmd, { timeout: 180000 });
        
        const optimizedSize = fs.statSync(outputPath).size;
        const savings = ((fs.statSync(inputPath).size - optimizedSize) / fs.statSync(inputPath).size * 100).toFixed(1);
        console.log(`✅ GIF otimizado (ffmpeg): ${path.basename(outputPath)} (${this.formatBytes(optimizedSize)}) - ${savings}% menor`);
      } catch (fallbackError) {
        console.log(`❌ Falha na otimização do GIF: ${fallbackError.message}`);
        console.log(`🔄 Continuando sem otimização para ${path.basename(inputPath)}...`);
      }
    }
  }

  getOptimizedSize(basePath) {
    let totalSize = 0;
    const files = [
      `${basePath}_thumb.jpg`,
      `${basePath}.webp`,
      `${basePath}_optimized.gif`
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        totalSize += fs.statSync(file).size;
      }
    }

    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE OTIMIZAÇÃO');
    console.log('='.repeat(60));
    
    console.log(`\n📁 Arquivos processados: ${this.stats.filesProcessed}`);
    console.log(`💾 Tamanho original total: ${this.formatBytes(this.stats.originalSize)}`);
    console.log(`✨ Tamanho otimizado total: ${this.formatBytes(this.stats.optimizedSize)}`);
    
    const totalSavings = this.stats.originalSize - this.stats.optimizedSize;
    const savingsPercent = (totalSavings / this.stats.originalSize * 100).toFixed(1);
    
    console.log(`🎯 Economia total: ${this.formatBytes(totalSavings)} (${savingsPercent}%)`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n⚠️ Erros encontrados:');
      this.stats.errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n✅ Otimização concluída!');
    console.log(`📂 Arquivos otimizados salvos em: ${CONFIG.outputDir}`);
    
    this.generateIntegrationGuide();
  }

  generateIntegrationGuide() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 GUIA DE INTEGRAÇÃO');
    console.log('='.repeat(60));
    
    console.log('\n1. Importe o componente OptimizedMediaPlayer:');
    console.log('   import OptimizedMediaPlayer from "./components/OptimizedMediaPlayer";');
    
    console.log('\n2. Atualize as referências dos arquivos no constants/index.ts:');
    console.log('   - GIFs originais: /assets/projects/nome.gif');
    console.log('   - WebP otimizado: /assets/projects/optimized/nome.webp');
    console.log('   - Thumbnail: /assets/projects/optimized/nome_thumb.jpg');
    
    console.log('\n3. Use o componente com lazy loading:');
    console.log('   <OptimizedMediaPlayer media={projectMedia} />');
    
    console.log('\n4. Teste a performance com Lighthouse.');
  }

  async run() {
    await this.init();
    await this.processGifs();
  }
}

const optimizer = new GifOptimizer();
optimizer.run().catch(console.error);