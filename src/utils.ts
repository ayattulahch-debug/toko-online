export function formatRp(angka: number): string {
  return 'Rp' + angka.toLocaleString('id-ID')
}

export function formatSold(sold: number): string {
  return sold >= 1000 ? `${(sold / 1000).toFixed(1)}RB` : String(sold)
}
