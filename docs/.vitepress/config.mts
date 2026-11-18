import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type DefaultTheme } from 'vitepress'

const akar = path.resolve(__dirname, '..')

// Bagian sidebar: urutan di sini = urutan di menu. Isinya dibaca otomatis dari folder,
// jadi halaman baru cukup diletakkan di folder yang benar (judul dan `urutan` dari frontmatter).
const BAGIAN: { folder: string; judul: string }[] = [
  { folder: 'mulai', judul: 'Mulai di sini' },
  { folder: 'backend/route', judul: 'Backend: route dan pengaturan' },
  { folder: 'backend/support', judul: 'Backend: aturan bisnis (Support)' },
  { folder: 'backend/controller', judul: 'Backend: controller' },
  { folder: 'backend/model', judul: 'Backend: model dan seeder' },
  { folder: 'frontend/dasar', judul: 'Frontend: pintu masuk dan alat bantu' },
  { folder: 'frontend/layout', judul: 'Frontend: layout' },
  { folder: 'frontend/penyewa', judul: 'Halaman penyewa' },
  { folder: 'frontend/admin', judul: 'Halaman Admin' },
  { folder: 'frontend/manager', judul: 'Halaman Manager' },
  { folder: 'frontend/komponen', judul: 'Komponen aplikasi' },
  { folder: 'kelompok', judul: 'File lain (per kelompok)' },
  { folder: 'ds/penyewa', judul: 'Design system: penyewa' },
  { folder: 'ds/administrator', judul: 'Design system: administrator' },
]

function frontmatter(isi: string): Record<string, string> {
  const m = isi.match(/^---\n([\s\S]*?)\n---/)
  const hasil: Record<string, string> = {}
  if (!m) return hasil
  for (const baris of m[1].split('\n')) {
    const i = baris.indexOf(':')
    if (i > 0) hasil[baris.slice(0, i).trim()] = baris.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')
  }
  return hasil
}

function isiBagian(folder: string): DefaultTheme.SidebarItem[] {
  const dir = path.join(akar, folder)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const fm = frontmatter(fs.readFileSync(path.join(dir, f), 'utf8'))
      return {
        text: fm.title ?? f.replace(/\.md$/, ''),
        link: `/${folder}/${f.replace(/\.md$/, '')}`,
        urutan: Number(fm.urutan ?? 100),
      }
    })
    .sort((a, b) => a.urutan - b.urutan || a.text.localeCompare(b.text))
    .map(({ text, link }) => ({ text, link }))
}

export default defineConfig({
  lang: 'id-ID',
  title: 'Dokumentasi Buddhi Sports',
  description: 'Penjelasan kode Buddhi Sports, satu halaman per file.',
  cleanUrls: true,
  lastUpdated: false,
  markdown: { lineNumbers: true },
  themeConfig: {
    nav: [
      { text: 'Mulai di sini', link: '/mulai/cara-membaca' },
      { text: 'Aturan kode', link: '/mulai/aturan-kode' },
      { text: 'Glosarium', link: '/mulai/glosarium' },
      {
        text: 'Design system',
        items: [
          { text: 'Penyewa', link: '/ds/penyewa/ikhtisar' },
          { text: 'Administrator', link: '/ds/administrator/ikhtisar' },
        ],
      },
    ],
    sidebar: BAGIAN.map((b) => ({ text: b.judul, collapsed: b.folder !== 'mulai', items: isiBagian(b.folder) })).filter(
      (b) => b.items.length > 0,
    ),
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Cari', buttonAriaLabel: 'Cari di dokumentasi' },
          modal: {
            noResultsText: 'Tidak ada hasil untuk',
            resetButtonTitle: 'Hapus pencarian',
            footer: { selectText: 'pilih', navigateText: 'pindah', closeText: 'tutup' },
          },
        },
      },
    },
    outline: { level: [2, 3], label: 'Di halaman ini' },
    docFooter: { prev: 'Sebelumnya', next: 'Berikutnya' },
    darkModeSwitchLabel: 'Tema',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Kembali ke atas',
  },
})
