import React from 'react';
import { Copy, Info } from 'lucide-react';
import Button from './Button';
import { useToast } from './Alert/useToast';
import { HURUF_KELOMPOK, angkaForm, dasarHitungan, formatRealisasi, kelompokkan, salinRealisasi } from '../utils/realisasiSki';

function Identitas({ label, children }) {
  return (
    <div className="flex gap-3 text-xs">
      <dt className="w-20 shrink-0 font-semibold text-text-dark">{label}</dt>
      <dd className="min-w-0 break-words text-text-dark">{children || '-'}</dd>
    </div>
  );
}

/**
 * Lembar SKI berformat form IKI RS: kop, identitas pegawai, lalu kelompok A/B dengan kolom No, Indikator, Satuan,
 * Realisasi. Hanya indikator yang datanya tercatat di AmanPoll yang ditampilkan; nomor urut per kelompok.
 */
export default function LembarSkiTable({ kop, pegawai, indikator }) {
  const { showToast } = useToast();
  const kelompok = kelompokkan(indikator);

  const salin = async (baris) => {
    try {
      await salinRealisasi(baris);
      showToast(`Realisasi ${formatRealisasi(baris)} disalin`, 'success');
    } catch {
      showToast('Gagal menyalin. Salin angkanya secara manual.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-dark">{kop.judul}</h2>
        {kop.rs && <p className="mt-0.5 text-xs uppercase text-text-dark">{kop.rs}</p>}
      </div>

      <dl className="grid gap-x-8 gap-y-1.5 md:grid-cols-[1fr_auto]">
        <div className="space-y-1.5">
          <Identitas label="Nama">{pegawai.nama}</Identitas>
          <Identitas label="Unit Kerja"><span className="uppercase">{pegawai.unit_kerja}</span></Identitas>
        </div>
        <div className="space-y-1.5">
          <Identitas label="Tahun">{pegawai.tahun}</Identitas>
          <Identitas label="Bulan">{pegawai.bulan}</Identitas>
        </div>
      </dl>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[560px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-bg-light text-[10px] font-bold uppercase tracking-wider text-text-gray">
              <th className="w-14 px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Indikator Kinerja</th>
              <th className="w-24 px-3 py-2.5 text-center">Satuan</th>
              <th className="w-44 px-3 py-2.5 text-right">Realisasi</th>
            </tr>
          </thead>
          <tbody>
            {kelompok.map((grup) => (
              <React.Fragment key={grup.nama}>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td colSpan={4} className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-text-dark">
                    {HURUF_KELOMPOK[grup.nama]}. {grup.nama}
                  </td>
                </tr>
                {grup.baris.map((baris, i) => {
                  const kosong = baris.realisasi === null || baris.realisasi === undefined;
                  const dasar = dasarHitungan(baris);

                  return (
                    <tr key={baris.kode} className="border-b border-gray-50 align-top">
                      <td className="px-3 py-2.5 text-text-dark">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <p className="flex items-start gap-1.5 font-medium text-text-dark">
                          <span>{baris.nama}</span>
                          {baris.definisi && (
                            <span title={baris.definisi} className="mt-0.5 shrink-0 cursor-help text-text-gray" aria-label={`Definisi: ${baris.definisi}`}>
                              <Info size={13} />
                            </span>
                          )}
                        </p>
                        {baris.catatan && <p className="mt-0.5 text-[11px] text-amber-700">{baris.catatan}</p>}
                      </td>
                      <td className="px-3 py-2.5 text-center text-text-dark">{baris.satuan}</td>
                      <td className="px-3 py-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div>
                            <p className="font-bold tabular-nums text-text-dark">{kosong ? '-' : angkaForm(baris.realisasi)}</p>
                            {dasar && <p className="text-[11px] text-text-gray">{dasar}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="!px-2"
                            disabled={kosong}
                            onClick={() => salin(baris)}
                            aria-label={`Salin realisasi ${baris.nama}`}
                            title={kosong ? 'Belum ada angka untuk disalin' : 'Salin angka realisasi'}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
