#!/usr/bin/env tsx
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Project } from 'ts-morph';
import pc from 'picocolors';

/**
 * 中文化重命名脚本
 * - 读取 scripts/中文化映射.json
 * - 预演(--dry-run)时仅打印计划变更，不落地
 * - 实际执行时：先批量更新 import/export 的 module specifier，再进行文件重命名
 * - 默认不改用 .js 扩展（更稳健），如需可加 --use-js-ext
 * - 默认跳过 *index.ts 的聚合文件重命名，如需可加 --rename-index
 */

interface MappingItem { from: string; to: string }
interface MappingFile { renameFiles: MappingItem[]; notes?: string }

const ROOT = process.cwd();
const MAPPING_PATH = path.resolve(ROOT, 'scripts', '中文化映射.json');
const DRY_RUN = process.argv.includes('--dry-run');
const USE_JS_EXT = process.argv.includes('--use-js-ext');
const RENAME_INDEX = process.argv.includes('--rename-index');

function log(...args: unknown[]) { console.log(...args) }
function rel(p: string) { return path.relative(ROOT, p).replace(/\\/g, '/') }

function loadMapping(): MappingFile {
  if (!fs.existsSync(MAPPING_PATH)) {
    throw new Error(`找不到映射文件: ${MAPPING_PATH}`);
  }
  const raw = fs.readFileSync(MAPPING_PATH, 'utf-8');
  const json = JSON.parse(raw) as MappingFile;
  return json;
}

function normalizeAbs(p: string): string {
  return path.resolve(ROOT, p);
}

function shouldSkip(item: MappingItem): boolean {
  if (RENAME_INDEX) return false;
  const baseFrom = path.basename(item.from).toLowerCase();
  return baseFrom === 'index.ts' || baseFrom === 'index.tsx';
}

function toDesiredSpecifier(fromFileAbs: string, targetAbs: string, importerAbs: string): string {
  const importerDir = path.dirname(importerAbs);
  const relPath = path.relative(importerDir, targetAbs).replace(/\\/g, '/');
  // 去掉 .ts/.tsx 扩展，保持无扩展；或替换为 .js 扩展
  const noExt = relPath.replace(/\.(ts|tsx)$/i, '');
  if (USE_JS_EXT) {
    return noExt + '.js';
  }
  return noExt.startsWith('.') ? noExt : './' + noExt; // 保证相对路径前缀
}

function tryGitMv(fromAbs: string, toAbs: string): boolean {
  try {
    const res = spawnSync('git', ['mv', fromAbs, toAbs], { stdio: 'inherit' });
    return res.status === 0;
  } catch {
    return false;
  }
}

async function fileRename(fromAbs: string, toAbs: string) {
  const toDir = path.dirname(toAbs);
  await fsp.mkdir(toDir, { recursive: true });
  // 优先使用 git mv，保留历史
  const ok = tryGitMv(fromAbs, toAbs);
  if (!ok) {
    await fsp.rename(fromAbs, toAbs);
  }
}

async function main() {
  log(pc.cyan(`工作目录: ${ROOT}`));
  log(pc.cyan(`读取映射: ${rel(MAPPING_PATH)}`));
  const mapping = loadMapping();

  // 解析绝对路径，并过滤被跳过的项
  const entries = mapping.renameFiles
    .filter(it => !shouldSkip(it))
    .map(it => ({
      from: it.from,
      to: it.to,
      fromAbs: normalizeAbs(it.from),
      toAbs: normalizeAbs(it.to),
    }));

  // 校验文件存在性
  let valid = true;
  for (const e of entries) {
    const fromExists = fs.existsSync(e.fromAbs);
    const toExists = fs.existsSync(e.toAbs);
    if (!fromExists) {
      log(pc.red(`缺少源文件: ${rel(e.fromAbs)}`));
      valid = false;
    }
    if (toExists) {
      log(pc.yellow(`目标已存在(将覆盖): ${rel(e.toAbs)}`));
    }
  }
  if (!valid) {
    process.exitCode = 1;
    return;
  }

  // 使用 ts-morph 读取工程
  const project = new Project({ tsConfigFilePath: path.resolve(ROOT, 'tsconfig.json') });
  project.addSourceFilesFromTsConfig(path.resolve(ROOT, 'tsconfig.json'));

  // 建立映射表，方便匹配
  const byFromAbs = new Map<string, { fromAbs: string; toAbs: string }>();
  entries.forEach(e => byFromAbs.set(path.normalize(e.fromAbs), { fromAbs: e.fromAbs, toAbs: e.toAbs }));

  // 统计
  let specifierChanges = 0;

  // 更新 import/export 的 module specifier
  const sourceFiles = project.getSourceFiles();
  for (const sf of sourceFiles) {
    // import 声明
    for (const imp of sf.getImportDeclarations()) {
      const resolved = imp.getModuleSpecifierSourceFile();
      if (!resolved) continue;
      const resolvedPath = path.normalize(resolved.getFilePath());
      const hit = byFromAbs.get(resolvedPath);
      if (!hit) continue;
      const newSpec = toDesiredSpecifier(resolvedPath, hit.toAbs, sf.getFilePath());
      if (!DRY_RUN) imp.setModuleSpecifier(newSpec);
      specifierChanges++;
      log(pc.green(`更新 import: ${rel(sf.getFilePath())} -> '${imp.getModuleSpecifierValue()}' => '${newSpec}'`));
    }
    // export ... from '...'
    for (const exp of sf.getExportDeclarations()) {
      const mod = exp.getModuleSpecifierValue();
      if (!mod) continue;
      const resolved = exp.getModuleSpecifierSourceFile();
      if (!resolved) continue;
      const resolvedPath = path.normalize(resolved.getFilePath());
      const hit = byFromAbs.get(resolvedPath);
      if (!hit) continue;
      const newSpec = toDesiredSpecifier(resolvedPath, hit.toAbs, sf.getFilePath());
      if (!DRY_RUN) exp.setModuleSpecifier(newSpec);
      specifierChanges++;
      log(pc.green(`更新 export: ${rel(sf.getFilePath())} -> '${mod}' => '${newSpec}'`));
    }
  }

  log(pc.cyan(`预计需要更新的引用个数: ${specifierChanges}`));

  if (!DRY_RUN) {
    await project.save();
  }

  // 执行重命名
  for (const e of entries) {
    log(pc.magenta(`${DRY_RUN ? '预演重命名' : '重命名'}: ${rel(e.fromAbs)} => ${rel(e.toAbs)}`));
    if (!DRY_RUN) {
      await fileRename(e.fromAbs, e.toAbs);
    }
  }

  log(pc.bold(pc.green(DRY_RUN ? 'Dry-run 完成（未做任何改动）。' : '中文化重命名与引用修正完成。请执行编译与测试。')));
}

main().catch(err => {
  console.error(pc.red('[中文化重命名] 发生错误:'), err);
  process.exitCode = 1;
});
