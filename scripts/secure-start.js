#!/usr/bin/env node

/**
 * Script de inicio seguro con Node.js Permissions
 * Proyecto tipo: react
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuración de permisos para react
const permissions = {
  read: [
  "./src",
  "./public",
  "./package.json",
  "./node_modules"
],
  write: [
  "./build",
  "./dist"
],
  net: [
  "localhost:3000",
  "localhost:3001"
],
  childProcess: false
};

// Construir argumentos de permisos para Node.js v22+
function buildPermissionArgs() {
  const args = ['--experimental-permission'];
  
  // Permisos de lectura (sintaxis correcta para v22)
  if (permissions.read.length > 0) {
    permissions.read.forEach(path => {
      args.push(`--allow-fs-read=${path}`);
    });
  }
  
  // Permisos de escritura (sintaxis correcta para v22)
  if (permissions.write.length > 0) {
    permissions.write.forEach(path => {
      args.push(`--allow-fs-write=${path}`);
    });
  }
  
  // Procesos hijo (solo si está permitido)
  if (permissions.childProcess) {
    args.push('--allow-child-process');
  }
  
  // Worker threads (generalmente permitido)
  args.push('--allow-worker');
  
  return args;
}

// Función principal
function startSecure() {
  console.log('🔒 Iniciando con permisos restringidos...');
  console.log('📋 Tipo de proyecto:', 'react');
  console.log('🛡️  Permisos aplicados:');
  console.log('   📖 Lectura:', permissions.read.join(', '));
  console.log('   ✏️  Escritura:', permissions.write.join(', '));
  console.log('   🔧 Procesos hijo:', permissions.childProcess ? 'Permitido' : 'Bloqueado');
  console.log('');
  
  // Configurar NODE_OPTIONS con los permisos
  const permissionArgs = buildPermissionArgs();
  const nodeOptions = permissionArgs.join(' ');
  
  console.log('⚠️  Nota: Las Node.js Permissions están en desarrollo experimental.');
  console.log('🚀 Iniciando Next.js en modo estándar...');
  console.log('');
  
  // Ejecutar npm run dev directamente (Windows compatible)
  const isWindows = process.platform === 'win32';
  const npmCommand = isWindows ? 'npm.cmd' : 'npm';
  
  const child = spawn(npmCommand, ['run', 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_OPTIONS: nodeOptions },
    shell: isWindows
  });
  
  child.on('error', (error) => {
    console.error('❌ Error al iniciar:', error.message);
    if (error.message.includes('permission')) {
      console.log('💡 Sugerencia: Verifica que los permisos sean correctos para tu aplicación');
    }
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code);
  });
}

startSecure();
