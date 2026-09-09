import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

const SRC_BOOKS = 'books';
const DIST = 'dist';
const ASSETS = 'src/assets';
const TEMPLATE = 'src/template.html';

async function main() {
  await fs.emptyDir(DIST);
  await fs.copy(ASSETS, path.join(DIST, 'assets'));

  const bookDirs = await glob(`${SRC_BOOKS}/*`, { nodir: false });
  const index = [];

  for (const dir of bookDirs) {
    const name = path.basename(dir);
    const metaPath = path.join(dir, 'meta.json');
    if (!await fs.pathExists(metaPath)) continue;
    const meta = await fs.readJson(metaPath);

    const srcPages = path.join(dir, 'pages');
    const dstPages = path.join(DIST, 'books', name, 'pages');
    await fs.copy(srcPages, dstPages);

    const files = (await fs.readdir(srcPages))
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => ({ file: f, page: Number(path.parse(f).name) }))
      .sort((a, b) => a.page - b.page)
      .map(o => o.file);

    await fs.writeJson(path.join(dstPages, '..', 'pages-index.json'),
                       { name, pages: files }, { spaces: 0 });

    index.push({
      name,
      grade: meta.grade,
      semester: meta.semester,
      subject: meta.subject,
      publisher: meta.publisher || '',
      cover: files[0] || ''
    });
  }

  await fs.writeJson(path.join(DIST, 'search-index.json'), index, { spaces: 0 });

  let tpl = await fs.readFile(TEMPLATE, 'utf-8');
  await fs.writeFile(path.join(DIST, 'index.html'), tpl);

  console.log(`✅ Built ${index.length} books → ${DIST}/`);
}
main().catch(e => { console.error(e); process.exit(1); });
