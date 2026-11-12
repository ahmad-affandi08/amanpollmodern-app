import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Button from './Button';
import { parseDate, toInputDate } from '../utils/format';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const name = format(new Date(2026, i, 1), 'MMMM', { locale: localeId });
  return name.charAt(0).toUpperCase() + name.slice(1);
});
const TWO_MONTH_MIN_WIDTH = 700; // di bawah ini hanya satu bulan agar muat di HP

const fmt = (value) => format(parseDate(value), 'd MMM yyyy', { locale: localeId });
const selectCls = 'border border-gray-300 rounded-lg bg-white px-1 py-0 text-[11px] font-medium text-[#11142D] outline-none focus:border-brand-primary cursor-pointer';
const dateInputCls = 'w-full px-2 py-1 text-[11px] rounded-lg border border-gray-300 bg-white text-[#11142D] outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20';

/**
 * Pilih rentang tanggal (awal – akhir): kalender dua bulan, dropdown bulan/tahun,
 * input Dari/Sampai, lalu "Selesai" untuk menerapkan atau "Kosongkan" untuk menghapus.
 * Nilai berupa string 'YYYY-MM-DD' ('' bila kosong); onChange({ startDate, endDate }).
 * Klik tanggal yang sama dua kali = rentang satu hari.
 * partial: tanggal akhir boleh kosong (untuk field yang akhirnya opsional).
 * Popup dirender lewat portal + posisi fixed supaya tidak terpotong modal/area scroll.
 */
export default function DateRangePicker({
  label,
  startDate = '',
  endDate = '',
  onChange,
  placeholder = 'Pilih rentang tanggal',
  size = 'md',
  className = '',
  min,
  max,
  partial = false,
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(parseDate(startDate) || new Date()));
  const [draft, setDraft] = useState({ start: '', end: '' });
  const [pickingEnd, setPickingEnd] = useState(false); // klik berikutnya menentukan tanggal akhir
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState(null);
  const rootRef = useRef(null);
  const popRef = useRef(null);
  const id = useId();

  const months = pos?.months ?? 2;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target) && !popRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Tempatkan popup di bawah tombol; balik ke atas bila kurang ruang, dan jaga tetap di dalam layar.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const r = rootRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const two = vw >= TWO_MONTH_MIN_WIDTH;
      const width = two ? 440 : Math.min(272, vw - 16);
      const height = popRef.current?.offsetHeight || 330;
      const left = Math.min(Math.max(8, r.left), vw - width - 8);
      let top = r.bottom + 8;
      if (top + height > window.innerHeight - 8 && r.top - height - 8 >= 8) top = r.top - height - 8;
      setPos({ top: Math.max(8, top), left, width, months: two ? 2 : 1 });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, month]);

  const toggle = () => {
    if (!open) {
      setDraft({ start: startDate, end: endDate });
      setMonth(startOfMonth(parseDate(startDate) || new Date()));
      setPickingEnd(false);
      setHover(null);
    }
    setOpen(!open);
  };

  const minDate = parseDate(min);
  const maxDate = parseDate(max);
  const disabled = (day) => (minDate && day < minDate) || (maxDate && day > maxDate);

  const start = parseDate(draft.start);
  const end = pickingEnd ? hover : parseDate(draft.end);
  const [from, to] = start && end && end < start ? [end, start] : [start, end];

  const pick = (day) => {
    if (disabled(day)) return;
    if (!pickingEnd) {
      setDraft({ start: toInputDate(day), end: '' });
      setPickingEnd(true);
      setHover(day);
      return;
    }
    const [a, b] = day < start ? [day, start] : [start, day];
    setDraft({ start: toInputDate(a), end: toInputDate(b) });
    setPickingEnd(false);
  };

  // Ketik/pilih lewat input Dari & Sampai; urutan yang terbalik ditukar.
  const typed = (key, value) => {
    setPickingEnd(false);
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      if (next.start && next.end && next.start > next.end) [next.start, next.end] = [next.end, next.start];
      return next;
    });
    if (value) setMonth(startOfMonth(parseDate(value)));
  };

  const apply = () => {
    onChange?.({ startDate: draft.start, endDate: draft.end });
    setOpen(false);
  };

  const clear = (e) => {
    e?.stopPropagation();
    onChange?.({ startDate: '', endDate: '' });
    setOpen(false);
  };

  const canApply = partial ? !!draft.start : !!(draft.start && draft.end);
  const hasValue = !!(startDate || endDate);
  const text = hasValue
    ? `${startDate ? fmt(startDate) : '…'} – ${endDate ? fmt(endDate) : '…'}`
    : placeholder;
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg h-[36px]',
    md: 'px-3 py-2 text-sm rounded-xl',
    lg: 'px-4 py-3 text-base rounded-xl',
  };

  const thisYear = new Date().getFullYear();
  const renderPanel = (offset) => {
    const view = addMonths(month, offset);
    const years = new Set(Array.from({ length: 22 }, (_, i) => thisYear - 15 + i));
    years.add(view.getFullYear());
    const days = eachDayOfInterval({
      start: startOfWeek(startOfMonth(view), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(view), { weekStartsOn: 1 }),
    });
    const go = (m, y) => setMonth(addMonths(new Date(y, m, 1), -offset));
    const first = offset === 0;
    const last = offset === months - 1;

    return (
      <div key={offset} className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1.5 h-6">
          {first ? (
            <button type="button" aria-label="Bulan sebelumnya" onClick={() => setMonth(addMonths(month, -1))} className="p-1 rounded-lg hover:bg-gray-100">
              <ChevronLeft size={12} />
            </button>
          ) : <span className="w-5" />}
          <div className="flex items-center gap-1.5">
            <select aria-label="Bulan" value={view.getMonth()} onChange={(e) => go(Number(e.target.value), view.getFullYear())} className={selectCls}>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select aria-label="Tahun" value={view.getFullYear()} onChange={(e) => go(view.getMonth(), Number(e.target.value))} className={selectCls}>
              {[...years].sort().map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {last ? (
            <button type="button" aria-label="Bulan berikutnya" onClick={() => setMonth(addMonths(month, 1))} className="p-1 rounded-lg hover:bg-gray-100">
              <ChevronRight size={12} />
            </button>
          ) : <span className="w-5" />}
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[#11142D] mb-0.5">
          {WEEKDAYS.map((d) => <span key={d} className="py-0.5">{d}</span>)}
        </div>

        <div className="grid grid-cols-7" onMouseLeave={() => pickingEnd && setHover(start)}>
          {days.map((day) => {
            const outside = !isSameMonth(day, view);
            const isEdge = !outside && ((from && isSameDay(day, from)) || (to && isSameDay(day, to)));
            const inRange = !outside && from && to && day > from && day < to;
            const off = disabled(day);
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={off || outside}
                tabIndex={outside ? -1 : 0}
                onClick={() => pick(day)}
                onMouseEnter={() => pickingEnd && setHover(day)}
                className={`h-7 text-[11px] transition-colors ${
                  outside
                    ? 'invisible'
                    : isEdge
                      ? 'bg-brand-primary text-white font-semibold rounded-lg'
                      : inRange
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-[#11142D] hover:bg-gray-100 rounded-lg'
                } ${isSameDay(day, new Date()) && !isEdge ? 'font-bold underline underline-offset-4' : ''} disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full relative" ref={rootRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-[#808191] mb-2 pl-1">
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full ${sizes[size]} bg-[#F8F9FB] border border-gray-200 font-medium flex items-center gap-2 text-left outline-none focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#11142D] ${className}`}
      >
        <Calendar size={16} className="shrink-0" />
        <span className="flex-1 truncate">{text}</span>
        {hasValue && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Hapus rentang tanggal"
            onClick={clear}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') clear(e); }}
            className="shrink-0 text-gray-400 hover:text-red-500"
          >
            <X size={14} />
          </span>
        )}
      </button>

      {open && ReactDOM.createPortal(
        <div
          ref={popRef}
          role="dialog"
          aria-label="Pilih rentang tanggal"
          style={{ position: 'fixed', top: pos?.top ?? 0, left: pos?.left ?? 0, width: pos?.width, visibility: pos ? 'visible' : 'hidden' }}
          className="z-[70] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-2.5 flex gap-3">
            {Array.from({ length: months }, (_, i) => renderPanel(i))}
          </div>

          <div className="px-2.5 pb-2.5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="block text-[11px] font-semibold text-[#11142D] mb-0.5">Dari</span>
              <input type="date" value={draft.start} min={min} max={max} onChange={(e) => typed('start', e.target.value)} className={dateInputCls} />
            </label>
            <label className="block">
              <span className="block text-[11px] font-semibold text-[#11142D] mb-0.5">Sampai</span>
              <input type="date" value={draft.end} min={min} max={max} onChange={(e) => typed('end', e.target.value)} className={dateInputCls} />
            </label>
          </div>

          <div className="px-2.5 py-1.5 bg-[#F8F9FB] border-t border-gray-100 flex justify-end items-center gap-2">
            <Button type="button" variant="ghost" size="sm" className="!h-7 !text-[11px] !px-2.5" onClick={clear}>Kosongkan</Button>
            <Button type="button" size="sm" className="!h-7 !text-[11px] !px-3" onClick={apply} disabled={!canApply}>Selesai</Button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
