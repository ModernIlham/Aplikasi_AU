import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea, ComposedChart, Area, AreaChart, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Bus, Route, Settings, DollarSign, Activity, GitCompare, LayoutDashboard,
  Plus, Trash2, Copy, Save, RotateCcw, Download, Upload, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus,
  MapPin, Clock, Gauge, Users, Fuel, Wrench, Coffee, Moon, Sun, Sunset,
  CalendarClock, ArrowRight, ArrowLeft, BarChart3, RotateCw, Pencil
} from 'lucide-react';

// ============================================================================
// CONSTANTS — BENCHMARKS, DEFAULTS, PERIODE PRESET
// ============================================================================

const BENCHMARK = {
  headway: [
    { min: 0, max: 10, label: 'BAIK', color: 'emerald', emoji: '🟢' },
    { min: 10.01, max: 20, label: 'STANDAR', color: 'amber', emoji: '🟡' },
    { min: 20.01, max: 9999, label: 'PERHATIAN', color: 'rose', emoji: '🔴' },
  ],
  kecepatan: [
    { min: 25, max: 9999, label: 'BAIK', color: 'emerald', emoji: '🟢' },
    { min: 18, max: 24.99, label: 'STANDAR', color: 'amber', emoji: '🟡' },
    { min: 0, max: 17.99, label: 'PERHATIAN', color: 'rose', emoji: '🔴' },
  ],
  frekuensi: [
    { min: 6, max: 9999, label: 'BAIK', color: 'emerald', emoji: '🟢' },
    { min: 3, max: 5.99, label: 'STANDAR', color: 'amber', emoji: '🟡' },
    { min: 0, max: 2.99, label: 'PERHATIAN', color: 'rose', emoji: '🔴' },
  ],
};

const PERIODE_PRESET = [
  { kode: 'P01', jam: '05:00-05:30', nama: 'Sahur / Pra-Operasi', kategori: 'Pre-Peak', on: false, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P02', jam: '05:30-06:00', nama: 'Early Bird', kategori: 'Pre-Peak', on: false, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P03', jam: '06:00-06:30', nama: 'Awal Peak Pagi', kategori: 'Peak', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P04', jam: '06:30-07:00', nama: 'Peak Pagi 1 (Sekolah)', kategori: 'Peak', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P05', jam: '07:00-07:30', nama: 'Peak Pagi 2 (Kantor Awal)', kategori: 'Peak', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P06', jam: '07:30-08:00', nama: 'Peak Pagi 3 (Kantor Utama)', kategori: 'Peak', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P07', jam: '08:00-08:30', nama: 'Peak Pagi 4 (Kantor Akhir)', kategori: 'Peak', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P08', jam: '08:30-09:00', nama: 'Tail Peak Pagi', kategori: 'Transisi', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P09', jam: '09:00-11:00', nama: 'Off-Peak Pagi', kategori: 'Off-Peak', on: true, durasi: 2, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P10', jam: '11:00-11:30', nama: 'Pra-Dzuhur', kategori: 'Transisi', on: false, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P11', jam: '11:30-12:30', nama: 'Window Dzuhur', kategori: 'Break', on: false, durasi: 1, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P12', jam: '12:30-14:00', nama: 'Off-Peak Siang', kategori: 'Off-Peak', on: true, durasi: 1.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P13', jam: '14:00-15:00', nama: 'Pulang Sekolah', kategori: 'Transisi', on: true, durasi: 1, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P14', jam: '15:00-15:30', nama: 'Window Ashar', kategori: 'Break', on: false, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P15', jam: '15:30-16:00', nama: 'Pra-Peak Sore', kategori: 'Transisi', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P16', jam: '16:00-16:30', nama: 'Awal Peak Sore', kategori: 'Peak', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P17', jam: '16:30-17:00', nama: 'Peak Sore 1', kategori: 'Peak', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P18', jam: '17:00-17:30', nama: 'Peak Sore 2 (Pulang Utama)', kategori: 'Peak', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P19', jam: '17:30-18:00', nama: 'Peak Sore 3 (Padat)', kategori: 'Peak', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P20', jam: '18:00-18:30', nama: 'Window Maghrib', kategori: 'Break', on: true, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P21', jam: '18:30-19:30', nama: 'Tail Peak Sore', kategori: 'Transisi', on: true, durasi: 1, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P22', jam: '19:30-21:00', nama: 'Off-Peak Malam', kategori: 'Off-Peak', on: true, durasi: 1.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P23', jam: '21:00-22:00', nama: 'Late Night', kategori: 'Late', on: false, durasi: 1, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P24', jam: '22:00-22:30', nama: 'Last Trip', kategori: 'Late', on: false, durasi: 0.5, sisipan: 0, catatan: '', customHeadway: 0 },
  { kode: 'P25', jam: '22:30-05:00', nama: 'Tutup / Maintenance', kategori: 'Tutup', on: true, durasi: 6.5, sisipan: 0, catatan: '', customHeadway: 0 },
];

const KATEGORI_COLOR = {
  'Peak': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'Off-Peak': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Pre-Peak': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Transisi': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Break': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Late': 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  'Tutup': 'bg-zinc-200/40 text-zinc-500 border-zinc-300/40',
};

const DEFAULT_BIAYA = {
  konsumsiBBM: 4,
  hargaBBM: 23600,
  gajiSopir: 200000,
  gajiAsisten: 100000,
  shiftPerBus: 2,            // BUG #4 FIX: 2 shift/hari utk operasi 16 jam (UU Naker max 8 jam/shift)
  maintenance: 150000,
  setoran: 2000000,          // INFORMASIONAL — bukan biaya operasi (lihat calcCost)
  tarif: 5000,
  avgPax: 25,
  marginPct: 0.10,
  overheadPct: 0.05,
  eskalasiPct: 0.05,
  hariOpsTahun: 365,
  capexPerBus: 1500000000,
  tenor: 15,
  achievementKPI: 0.95,
  bobotKPI: 0.20,
};

// Status operasional per bus per periode (4 status + Active default)
const STATUS_OPS = {
  active:  { dot: '#059669', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', label: 'Aktif',   short: 'A', desc: 'Bus melayani trip sesuai jadwal' },
  break:   { dot: '#2563EB', bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'Break',   short: 'B', desc: 'Istirahat sopir / makan / sholat' },
  service: { dot: '#D97706', bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Service', short: 'S', desc: 'Maintenance preventif / isi BBM' },
  standby: { dot: '#71717A', bg: '#F4F4F5', text: '#3F3F46', border: '#D4D4D8', label: 'Standby', short: 'T', desc: 'Cadangan, siap masuk jika perlu' },
  off:     { dot: '#A1A1AA', bg: '#FAFAFA', text: '#71717A', border: '#E4E4E7', label: 'OFF',     short: '—', desc: 'Tidak operasi (di garasi)' },
};
const STATUS_CYCLE = ['active', 'break', 'service', 'standby', 'off'];

const newRoute = (id, nama) => ({
  id,
  nama,
  tipeRute: 'Loop',
  armada: 3,
  layover: 10,
  jamOps: 16,
  halte: [
    { id: 1, nama: 'Terminal Awal', jarakKum: 0, dwell: 0, travelOverride: 0 },
    { id: 2, nama: 'Halte 1', jarakKum: 1.5, dwell: 0.5, travelOverride: 4 },
    { id: 3, nama: 'Halte 2', jarakKum: 3.0, dwell: 0.5, travelOverride: 4 },
    { id: 4, nama: 'Halte 3', jarakKum: 4.5, dwell: 0.5, travelOverride: 4 },
    { id: 5, nama: 'Terminal Akhir', jarakKum: 6.0, dwell: 0, travelOverride: 4 },
  ],
  periode: PERIODE_PRESET.map(p => ({ ...p, armadaPeriode: p.on ? 3 : 0 })),
  // ── ENGINEERING DATA — passenger capacity & demand ──
  kapasitasBus: 80,        // kursi + standing area (default mid-bus BRT)
  demandPHPDV: 0,          // Peak Hour Peak Direction Volume (pax/jam/arah). 0 = unknown, skip LF calc.
  // ── SISIPAN ARMADA — TIME-RANGE BASED OVERRIDES (NEW MODEL) ──
  // Independent dari periode boundary. Bisa span multiple periodes.
  // Multiple sisipan can stack (additive delta dalam overlap range).
  // { id, startMin, endMin, deltaArmada, customHeadway, catatan }
  sisipanArmada: [],
  busStatus: {}, // [DEPRECATED — kept for backward-compat only. New code uses busStatusEvents (event-based).]
  busStatusEvents: [], // [{ id, busId, status, startMin, endMin, catatan }] — primary status data
  biaya: { ...DEFAULT_BIAYA },
  optimasi: null, // diisi saat user buat skenario optimasi
});

// ============================================================================
// CALCULATION ENGINE — CORE FORMULAS DARI EXCEL
// ============================================================================

function calcMetrics(route) {
  const { tipeRute, armada, halte, layover, jamOps } = route;
  const isPP = tipeRute === 'PP';
  const lastHalte = halte[halte.length - 1];
  const jarakPerArah = lastHalte ? lastHalte.jarakKum : 0;
  const travelTime = halte.reduce((s, h) => s + (Number(h.travelOverride) || 0), 0);
  const totalDwell = halte.reduce((s, h) => s + (Number(h.dwell) || 0), 0);
  const serviceTime = travelTime + totalDwell;
  const rtt = isPP ? serviceTime * 2 : serviceTime;
  // BUG #5 FIX: PP layover terjadi di KEDUA terminal (asal & tujuan); Loop hanya 1× per cycle
  const layoverInput = Number(layover) || 0;
  const layoverTotal = layoverInput * (isPP ? 2 : 1);
  const cycleTime = rtt + layoverTotal;
  const headway = armada > 0 ? cycleTime / armada : 0;
  const freqPerJam = headway > 0 ? 60 / headway : 0;
  const kecKomersial = serviceTime > 0 ? jarakPerArah / (serviceTime / 60) : 0;
  // BUG #2 FIX: untuk PP, 1 cycle = 2 trip (1-arah). Untuk Loop, 1 cycle = 1 trip (loop penuh).
  const cyclePerBus = cycleTime > 0 ? Math.floor((jamOps * 60) / cycleTime) : 0;
  const tripPerBus = cyclePerBus * (isPP ? 2 : 1);
  const totalTrip = tripPerBus * armada;
  // BUG #1 FIX: Loop = 1× jarakPerArah per loop; PP = 1× jarakPerArah per trip 1-arah
  const kmPerTrip = jarakPerArah; // 1 trip Loop = 1 putaran; 1 trip PP = 1 arah
  const totalKm = totalTrip * kmPerTrip;
  // jarakPerCycle untuk display (jarak fisik 1 siklus penuh)
  const jarakPerCycle = jarakPerArah * (isPP ? 2 : 1);
  const jumlahHalteIntermediate = Math.max(0, halte.length - 2);
  const layoverPct = rtt > 0 ? layoverTotal / rtt : 0;
  const dwellPct = cycleTime > 0 ? totalDwell / cycleTime : 0;
  const spasiHalte = jumlahHalteIntermediate > 0 ? jarakPerArah / (jumlahHalteIntermediate + 1) : 0;

  return {
    jarakPerArah, jarakPP: jarakPerCycle, jarakPerCycle, kmPerTrip,
    travelTime, totalDwell, serviceTime,
    rtt, layoverInput, layoverTotal, cycleTime,
    headway, freqPerJam, kecKomersial,
    cyclePerBus, tripPerBus, totalTrip, totalKm,
    jumlahHalteIntermediate, layoverPct, dwellPct, spasiHalte, isPP,
    statusHeadway: bandStatus(headway, BENCHMARK.headway),
    statusKecepatan: bandStatus(kecKomersial, BENCHMARK.kecepatan),
    statusFrekuensi: bandStatus(freqPerJam, BENCHMARK.frekuensi),
  };
}

function bandStatus(value, bands) {
  for (const b of bands) {
    if (value >= b.min && value <= b.max) return b;
  }
  return bands[bands.length - 1];
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSIT ENGINEERING STANDARDS — KPI HELPERS & COMPLIANCE
// References:
// • Permenhub PM 9/2020 (Buy The Service / BTS scheme)
// • Permenhub 27/2015 (Standar Pelayanan Minimum / SPM Angkutan Massal)
// • Permenhub 79/2013 (Hours of Service untuk pengemudi)
// • TCQSM 3rd Edition (Transit Capacity & Quality of Service Manual, TCRP 165)
// • ILO Convention 153 (Hours of Work in Road Transport)
// • ITDP BRT Standard (BRT scoring)
// ═══════════════════════════════════════════════════════════════════════════

// TCQSM Load Factor Service Quality Classes (Exhibit 4-7, 4-8)
// Pax per seat ratio → service quality grade
const SERVICE_LOAD_CLASSES = [
  { max: 0.50, class: 'A', label: 'Excellent',     color: '#059669', tint: '#ECFDF5', desc: 'Semua duduk, kursi kosong banyak — comfort tinggi' },
  { max: 0.75, class: 'B', label: 'Good',          color: '#10B981', tint: '#D1FAE5', desc: 'Semua duduk, beberapa kursi kosong' },
  { max: 1.00, class: 'C', label: 'Acceptable',    color: '#84CC16', tint: '#ECFCCB', desc: 'Hampir semua kursi terisi (target operasional)' },
  { max: 1.25, class: 'D', label: 'Tolerable',     color: '#F59E0B', tint: '#FEF3C7', desc: 'Beberapa penumpang berdiri (peak hour acceptable)' },
  { max: 1.50, class: 'E', label: 'Crowded',       color: '#EF4444', tint: '#FEE2E2', desc: 'Banyak berdiri (uncomfortable, signal tambah armada)' },
  { max: 999,  class: 'F', label: 'Crush',         color: '#991B1B', tint: '#FEE2E2', desc: 'Over capacity (unsafe, butuh interventi)' },
];
const loadFactorClass = (lf) => SERVICE_LOAD_CLASSES.find(c => lf <= c.max) || SERVICE_LOAD_CLASSES[SERVICE_LOAD_CLASSES.length - 1];

// Standards benchmark ranges
const STD_BENCHMARKS = {
  speed: {
    excellent: 30, good: 25, acceptable: 18, // km/h commercial speed
    source: 'TCQSM Exhibit 6-43 (BRT urban arterial)',
  },
  headway: {
    spm_max_peak: 10, spm_max_offpeak: 20, // menit (Permenhub 27/2015)
    excellent: 5, good: 10, acceptable: 20,
    source: 'Permenhub 27/2015 SPM Angkutan Massal',
  },
  loadFactor: {
    target: 0.85,        // TCQSM Class B-C boundary, ideal operasional
    max_acceptable: 1.0, // sebelum penumpang berdiri
    max_crush: 1.5,      // upper limit (E/F boundary)
    source: 'TCQSM Method',
  },
  driverShift: {
    max_daily_hours: 8,        // Permenhub 79/2013, UU 13/2003 Ketenagakerjaan
    max_continuous_hours: 4,   // ILO C153
    min_break_minutes: 30,     // setelah 4h continuous
    source: 'Permenhub 79/2013 + ILO C153',
  },
  busUtilization: {
    target_active_pct: 75,  // bus aktif 75%+ dari jamOps
    source: 'APTA Fleet Productivity Best Practice',
  },
};

// SPM Permenhub 27/2015 — 7 Dimensi Pelayanan
const SPM_DIMENSIONS = [
  { key: 'keamanan',     label: 'Keamanan',      desc: 'CCTV, lampu, tanda darurat' },
  { key: 'keselamatan',  label: 'Keselamatan',   desc: 'Pengemudi sehat, bus laik, SOP' },
  { key: 'kenyamanan',   label: 'Kenyamanan',    desc: 'AC, kursi, kapasitas (LF ≤ 1.0)' },
  { key: 'keterjangkauan', label: 'Keterjangkauan', desc: 'Tarif rasional, integrasi moda' },
  { key: 'kesetaraan',   label: 'Kesetaraan',    desc: 'Akses prioritas (lansia, difabel, ibu hamil)' },
  { key: 'keteraturan',  label: 'Keteraturan',   desc: 'Headway konsisten, kepatuhan jadwal' },
  { key: 'lingkungan',   label: 'Lingkungan',    desc: 'Emisi rendah, kebersihan' },
];

// Compute Load Factor (peak hour, peak direction)
// PHPDV = Peak Hour Peak Direction Volume
// Capacity = (60/headway) trips/hour × kapasitasBus
function calcLoadFactor(armada, headway, kapasitasBus, demandPHPDV) {
  if (headway <= 0 || kapasitasBus <= 0) return { lf: 0, capacity: 0, demand: 0 };
  const tripsPerHour = 60 / headway;
  const capacityPerHour = tripsPerHour * kapasitasBus; // pax/hour/direction
  const lf = capacityPerHour > 0 ? demandPHPDV / capacityPerHour : 0;
  return { lf, capacity: capacityPerHour, demand: demandPHPDV };
}

// Driver Shift Compliance Check
function checkDriverShifts(buses) {
  const violations = [];
  let active = 0;
  buses.forEach(b => {
    if (b.tripCount === 0) return;
    active++;
    // dutyMin = span dari firstDep ke lastArr (proxy untuk waktu kerja)
    const dutyHours = (Number(b.dutyMin) || 0) / 60;
    if (dutyHours > STD_BENCHMARKS.driverShift.max_daily_hours) {
      violations.push({
        busId: b.id,
        type: 'over-duty',
        spanHours: dutyHours.toFixed(2),
        threshold: STD_BENCHMARKS.driverShift.max_daily_hours,
        message: `Bus #${b.id} duty ${dutyHours.toFixed(1)}h melebihi batas 8h — butuh 2 shift sopir`,
      });
    }
  });
  return {
    compliant: violations.length === 0,
    violations,
    activeCount: active,
    requiresMultiShift: violations.length > 0,
  };
}

// Headway Reliability — Coefficient of Variation across periodes
function calcHeadwayCV(ritGroups) {
  if (!ritGroups || ritGroups.length < 2) return { cv: 0, stdev: 0, mean: 0 };
  const headways = ritGroups.filter(g => isFinite(g.headway)).map(g => g.headway);
  if (headways.length < 2) return { cv: 0, stdev: 0, mean: headways[0] || 0 };
  const mean = headways.reduce((a, b) => a + b, 0) / headways.length;
  const variance = headways.reduce((s, h) => s + Math.pow(h - mean, 2), 0) / headways.length;
  const stdev = Math.sqrt(variance);
  const cv = mean > 0 ? stdev / mean : 0;
  return { cv, stdev, mean, count: headways.length };
}

// ── EFFECTIVE HEADWAY — Operations Effective (Layer 2 TCQSM) ──
// Time-weighted average headway across all sched groups (respect actual armada per window).
// Beda dengan m.headway yang pakai static cycle/armada, ini reflect actual operations.
// Returns: { effective, baseline, hasDeviation, breakdownByGroup }
function calcEffectiveHeadway(m, sched, route) {
  const baseline = m.headway || 0;
  if (!sched.ritGroups || sched.ritGroups.length === 0) {
    return { effective: baseline, baseline, hasDeviation: false, deviationPct: 0, totalWindowMin: 0 };
  }
  // Time-weighted average (group durasi × headway)
  let weightedSum = 0;
  let totalWindow = 0;
  let hasDeviation = false;
  const breakdown = [];
  for (const g of sched.ritGroups) {
    if (!isFinite(g.headway) || g.headway <= 0) continue;
    const groupMin = g.endMin - g.startMin;
    weightedSum += g.headway * groupMin;
    totalWindow += groupMin;
    if (Math.abs(g.headway - baseline) > 0.5) hasDeviation = true;
    breakdown.push({
      id: g.id, startMin: g.startMin, endMin: g.endMin,
      durationMin: groupMin, headway: g.headway,
      armada: g.armada, effectiveCount: g.effectiveCount,
    });
  }
  const effective = totalWindow > 0 ? weightedSum / totalWindow : baseline;
  const deviationPct = baseline > 0 ? ((effective - baseline) / baseline) * 100 : 0;
  return { effective, baseline, hasDeviation, deviationPct, totalWindowMin: totalWindow, breakdown };
}

// Service Productivity Index (SPI)
// = Total Trips × Headway / (Armada × jamOps)
// Range 0-1, ideal ~0.85-1.0
function calcServiceProductivity(totalTrip, armada, jamOps, headway) {
  if (armada <= 0 || jamOps <= 0) return 0;
  // Theoretical max trips = armada × (jamOps × 60 / cycleTime)
  // Actual / theoretical ratio
  const tripsPerHourTheoretical = (armada * 60) / (headway * armada); // simplifies to 60/headway
  const totalTheoretical = tripsPerHourTheoretical * jamOps;
  return totalTheoretical > 0 ? totalTrip / totalTheoretical : 0;
}

// Cost per VKM and per VHR
function calcUnitCosts(totalCost, totalKm, totalHours) {
  return {
    perVkm: totalKm > 0 ? totalCost / totalKm : 0,
    perVhr: totalHours > 0 ? totalCost / totalHours : 0,
  };
}

// ── PER-PERIODE DEMAND-SUPPLY ANALYSIS ──
// For every active periode, compute supply (capacity) vs demand to identify mismatch.
// Returns recommendations for armada adjustment per periode.
function calcPerPeriodeAnalysis(route, sched, m) {
  const result = [];
  const kapasitasBus = Number(route.kapasitasBus) || 80;
  const cycleTime = m.cycleTime;
  const targetLF = STD_BENCHMARKS.loadFactor.target; // 0.85

  for (const periode of (route.periode || [])) {
    if (!periode.on || periode.kategori === 'Tutup') continue;
    const demand = Number(periode.demand) || 0;
    // Find ritGroup that covers this periode (for actual armada/headway)
    const groupForPeriode = (sched.ritGroups || []).find(g =>
      (g.periodes || []).some(p => p.kode === periode.kode)
    );
    const armada = groupForPeriode ? groupForPeriode.armada : 0;
    const headway = groupForPeriode ? groupForPeriode.headway : 0;
    const tripsPerHour = headway > 0 ? 60 / headway : 0;
    const supply = tripsPerHour * kapasitasBus;
    const lf = supply > 0 ? demand / supply : 0;
    const lfClass = loadFactorClass(lf);
    // Recommended armada to keep LF ≤ target
    let recommendedArmada = armada;
    if (demand > 0 && cycleTime > 0 && kapasitasBus > 0 && targetLF > 0) {
      const targetSupply = demand / targetLF;
      const targetTripsPerHour = targetSupply / kapasitasBus;
      const targetHeadway = targetTripsPerHour > 0 ? 60 / targetTripsPerHour : Infinity;
      recommendedArmada = isFinite(targetHeadway) ? Math.ceil(cycleTime / targetHeadway) : armada;
    }
    // BUG FIX: armadaDelta harus dideklarasikan sbg local var dulu sebelum
    // dipakai di properti `hasIssue` (object literal property tidak bisa
    // mereferensikan property lain di dalam object yang sama).
    const armadaDelta = recommendedArmada - armada;
    result.push({
      kode: periode.kode, nama: periode.nama, kategori: periode.kategori, jam: periode.jam,
      demand, supply: Math.round(supply), headway, armada,
      lf, lfClass, tripsPerHour,
      recommendedArmada, armadaDelta,
      hasIssue: lf > 1.0 || (demand > 0 && armadaDelta < 0 && Math.abs(armadaDelta) >= 2),
    });
  }
  return result;
}

// ── PVR (Peak Vehicle Requirement) ANALYSIS ──
// Minimum armada required to operate at peak headway. PVR = ⌈Cycle ÷ Headway_peak⌉.
// Spare ratio: (actual − PVR) / PVR. Industry standard: 10-20% spare.
function calcPVRAnalysis(m, sched, route) {
  if (!sched.ritGroups || sched.ritGroups.length === 0) return null;
  // Find peak group (shortest headway = highest demand period)
  const finiteGroups = sched.ritGroups.filter(g => isFinite(g.headway) && g.headway > 0);
  if (finiteGroups.length === 0) return null;
  const peakGroup = finiteGroups.reduce((acc, g) => !acc || g.headway < acc.headway ? g : acc, null);
  const offPeakGroup = finiteGroups.reduce((acc, g) => !acc || g.headway > acc.headway ? g : acc, null);

  const cycleTime = m.cycleTime;
  const pvr = peakGroup && cycleTime > 0 ? Math.ceil(cycleTime / peakGroup.headway) : 0;
  const fleetSize = Number(route.armada) || 0;
  const spare = fleetSize - pvr;
  const sparePct = pvr > 0 ? spare / pvr : 0;

  return {
    pvr,
    peakHeadway: peakGroup ? peakGroup.headway : 0,
    peakKategori: peakGroup && peakGroup.periodes && peakGroup.periodes[0] ? peakGroup.periodes[0].kategori : '—',
    offPeakHeadway: offPeakGroup ? offPeakGroup.headway : 0,
    cycleTime,
    fleetSize,
    spare,
    sparePct,
    spareStatus: sparePct < 0.10 ? 'kurang' : sparePct <= 0.25 ? 'optimal' : 'berlebih',
    recommendation: sparePct < 0.10
      ? 'Spare armada < 10% — risiko jika ada bus breakdown. Tambah 1-2 cadangan.'
      : sparePct <= 0.25
      ? 'Spare armada 10-25% — optimal untuk maintenance + breakdown response.'
      : 'Spare armada > 25% — over-fleet, biaya capital tinggi. Pertimbangkan reduce.',
  };
}

// ── RECOVERY TIME ANALYSIS ──
// Layover% terhadap RTT. Industry standard: 10-20% optimal untuk schedule reliability.
function calcRecoveryAnalysis(m) {
  const lp = m.layoverPct;
  const status = lp < 0.10 ? 'rendah' : lp < 0.20 ? 'optimal' : lp < 0.30 ? 'cukup' : 'berlebih';
  const grades = {
    rendah:   { color: '#DC2626', label: 'KURANG', text: 'Layover < 10% RTT — risiko bunching tinggi saat ada delay (traffic, dwell variance). Rekomendasi: tambah 2-5 menit layover.' },
    optimal:  { color: '#059669', label: 'OPTIMAL', text: 'Layover 10-20% RTT — sweet spot untuk reliability + efisiensi. TCRP 30 best practice.' },
    cukup:    { color: '#D97706', label: 'CUKUP',   text: 'Layover 20-30% RTT — cukup buffer, tapi efisiensi armada mulai turun. Pertimbangkan reduce kalau on-time performance konsisten baik.' },
    berlebih: { color: '#B91C1C', label: 'BERLEBIH', text: 'Layover > 30% RTT — over-engineered. Bus banyak diam, ROI rendah. Reduce layover atau kurangi armada.' },
  };
  return { layoverPct: lp, status, ...grades[status] };
}

// ── BUNCHING PROBABILITY ESTIMATOR ──
// Simplified TCQSM model: P(bunching) ≈ 1 − exp(−CV² × n)
// where CV is dwell-time CV and n is number of stops. Heuristic; for awareness only.
function estimateBunchingRisk(headway, layoverPct, halteCount) {
  // Rough heuristic: shorter headway + lower layover% + more halte = higher risk
  const headwayFactor = headway > 0 ? Math.min(1, 10 / headway) : 1; // <10 min headway = high freq
  const layoverFactor = layoverPct < 0.10 ? 1 : layoverPct < 0.20 ? 0.5 : 0.2;
  const halteFactor = Math.min(1, halteCount / 20);
  const risk = headwayFactor * layoverFactor * halteFactor;
  const level = risk > 0.5 ? 'tinggi' : risk > 0.25 ? 'sedang' : 'rendah';
  return { risk, level, headwayFactor, layoverFactor, halteFactor };
}

// ── SERVICE PRODUCTIVITY INDEX ──
// SPI = (Actual trips × Service time) / (Armada × jamOps × 60)
// Mengukur seberapa efisien armada digunakan untuk revenue service.
function calcSPI(totalTrip, serviceTime, armada, jamOps) {
  if (armada <= 0 || jamOps <= 0) return 0;
  const productiveMin = totalTrip * serviceTime;
  const totalMin = armada * jamOps * 60;
  return totalMin > 0 ? productiveMin / totalMin : 0;
}

// ── DISRUPTION SCENARIO IMPACT CALCULATOR ──
// Compute hypothetical metrics under disruption (armada reduction, cycle change, etc).
function calcDisruptionImpact(baseRoute, baseM, scenario) {
  const newRoute = JSON.parse(JSON.stringify(baseRoute));
  let label = '';
  // Apply scenario
  if (scenario.type === 'armada-reduction') {
    newRoute.armada = Math.max(1, baseRoute.armada - (Number(scenario.busesAffected) || 0));
    label = `−${scenario.busesAffected} bus (breakdown/maintenance)`;
  } else if (scenario.type === 'cycle-increase') {
    // Increase serviceTime via dwell or travel
    const factor = 1 + (Number(scenario.cycleIncreasePct) || 0) / 100;
    newRoute.halte = baseRoute.halte.map(h => ({
      ...h,
      travelOverride: (Number(h.travelOverride) || 0) * factor,
    }));
    label = `Cycle time +${scenario.cycleIncreasePct}% (traffic/detour)`;
  } else if (scenario.type === 'headway-target') {
    // Override is informational; just compute new armada needed
    label = `Target headway = ${scenario.targetHeadway}m`;
  }
  const newM = calcMetrics(newRoute);
  const requiredArmada = scenario.type === 'headway-target' && scenario.targetHeadway > 0
    ? Math.ceil(newM.cycleTime / Number(scenario.targetHeadway))
    : null;
  return {
    label,
    base: baseM,
    new: newM,
    requiredArmada,
    delta: {
      headway:    newM.headway - baseM.headway,
      freqPerJam: newM.freqPerJam - baseM.freqPerJam,
      cycleTime:  newM.cycleTime - baseM.cycleTime,
      tripPerBus: newM.tripPerBus - baseM.tripPerBus,
      totalTrip:  newM.totalTrip - baseM.totalTrip,
      totalKm:    newM.totalKm - baseM.totalKm,
    },
  };
}

// ── ENGINEERING WARNINGS — Integration: warnings tied to scheduler state ──
// Returns prioritized list of issues that affect scheduling validity.
function calcEngineeringWarnings(route, m, sched, buses) {
  const warnings = [];

  // 1. PVR Check (under-fleeted = critical)
  const pvr = calcPVRAnalysis(m, sched, route);
  if (pvr && pvr.fleetSize < pvr.pvr) {
    warnings.push({
      severity: 'critical', category: 'PVR',
      title: 'Under-Fleeted',
      message: `Armada ${pvr.fleetSize} < PVR ${pvr.pvr}. Schedule TIDAK FEASIBLE pada peak headway ${pvr.peakHeadway.toFixed(1)} mnt.`,
      action: `Tambah ${pvr.pvr - pvr.fleetSize} armada (atau gunakan sisipan)`,
      tab: 'fleet',
    });
  } else if (pvr && pvr.sparePct < 0.10 && pvr.fleetSize >= pvr.pvr) {
    warnings.push({
      severity: 'warning', category: 'PVR',
      title: 'Spare Armada Rendah',
      message: `Spare hanya ${(pvr.sparePct * 100).toFixed(0)}% — risiko gangguan jika 1 bus breakdown.`,
      action: 'Pertimbangkan tambah armada cadangan',
      tab: 'fleet',
    });
  }

  // 2. Recovery Time Check
  if (m.layoverPct < 0.10) {
    warnings.push({
      severity: 'warning', category: 'Recovery',
      title: 'Recovery Time Rendah',
      message: `Layover hanya ${(m.layoverPct * 100).toFixed(0)}% RTT (target 10-20%) — risiko bunching saat ada delay.`,
      action: 'Tambah 2-5 menit layover di Setup → Rute',
      tab: 'fleet',
    });
  }

  // 3. Demand-Supply Mismatch (over-capacity)
  const perPeriode = calcPerPeriodeAnalysis(route, sched, m);
  const overloaded = perPeriode.filter(p => p.demand > 0 && p.lf > 1.0);
  if (overloaded.length > 0) {
    warnings.push({
      severity: 'critical', category: 'Capacity',
      title: 'Periode Over-Capacity',
      message: `${overloaded.length} periode dengan LF > 1.0 (Class D-F): ${overloaded.map(p => p.kode + ' (' + (p.lf * 100).toFixed(0) + '%)').join(', ')}.`,
      action: 'Tambah sisipan armada di periode tersebut',
      tab: 'demand',
    });
  }

  // 4. Driver Shift Compliance
  const driverCheck = checkDriverShifts(buses);
  if (!driverCheck.compliant) {
    warnings.push({
      severity: 'warning', category: 'Driver',
      title: 'Driver Shift > 8 Jam',
      message: `${driverCheck.violations.length} bus dengan duty > 8 jam — Permenhub 79/2013 butuh 2 shift sopir.`,
      action: 'Setup shift di Setup → Biaya (shiftPerBus = 2)',
      tab: 'audit',
    });
  }

  // 5. Headway Reliability
  const cv = calcHeadwayCV(sched.ritGroups);
  if (cv.cv > 0.35) {
    warnings.push({
      severity: 'warning', category: 'Reliability',
      title: 'Variasi Headway Tinggi',
      message: `CV = ${(cv.cv * 100).toFixed(0)}% (target ≤ 20%) — pelayanan tidak konsisten antar periode.`,
      action: 'Pertimbangkan smooth transition antar group',
      tab: 'audit',
    });
  }

  // 6. SPM Headway compliance
  if (m.headway > 20) {
    warnings.push({
      severity: 'warning', category: 'SPM',
      title: 'Headway Melebihi SPM',
      message: `Headway ${m.headway.toFixed(1)} mnt > 20 mnt (Permenhub 27/2015 STANDAR).`,
      action: 'Tambah armada atau kurangi cycle time',
      tab: 'audit',
    });
  }

  return warnings;
}

// ── SCHEDULE QUALITY SCORE — Composite KPI from multiple dimensions ──
function calcScheduleQualityScore(route, m, sched, buses) {
  const breakdown = { pvr: 100, recovery: 100, capacity: 100, reliability: 100, driver: 100, spm: 100 };

  const pvr = calcPVRAnalysis(m, sched, route);
  if (pvr) {
    if (pvr.fleetSize < pvr.pvr) breakdown.pvr = 40;
    else if (pvr.sparePct < 0.10) breakdown.pvr = 75;
    else if (pvr.sparePct > 0.30) breakdown.pvr = 85;
    else breakdown.pvr = 100;
  }

  if (m.layoverPct < 0.10) breakdown.recovery = 55;
  else if (m.layoverPct > 0.30) breakdown.recovery = 75;
  else breakdown.recovery = 100;

  const perPeriode = calcPerPeriodeAnalysis(route, sched, m);
  const lfIssuesCount = perPeriode.filter(p => p.demand > 0 && p.lf > 1.0).length;
  const totalWithDemand = perPeriode.filter(p => p.demand > 0).length;
  if (totalWithDemand > 0) {
    breakdown.capacity = Math.max(40, 100 - (lfIssuesCount / totalWithDemand) * 60);
  }

  const cv = calcHeadwayCV(sched.ritGroups);
  if (cv.cv > 0.35) breakdown.reliability = 55;
  else if (cv.cv > 0.20) breakdown.reliability = 75;
  else breakdown.reliability = 100;

  const driverCheck = checkDriverShifts(buses);
  if (!driverCheck.compliant) breakdown.driver = 70;

  if (m.headway > 20) breakdown.spm = 60;
  else if (m.headway > 10) breakdown.spm = 80;

  // Weighted average
  const weights = { pvr: 0.20, recovery: 0.15, capacity: 0.20, reliability: 0.15, driver: 0.15, spm: 0.15 };
  const score = Object.keys(breakdown).reduce((s, k) => s + breakdown[k] * weights[k], 0);

  let grade;
  if (score >= 90) grade = { letter: 'A', label: 'Excellent', color: '#059669', tint: '#ECFDF5' };
  else if (score >= 80) grade = { letter: 'B', label: 'Good', color: '#10B981', tint: '#D1FAE5' };
  else if (score >= 70) grade = { letter: 'C', label: 'Acceptable', color: '#84CC16', tint: '#ECFCCB' };
  else if (score >= 60) grade = { letter: 'D', label: 'Marginal', color: '#F59E0B', tint: '#FEF3C7' };
  else grade = { letter: 'F', label: 'Poor', color: '#DC2626', tint: '#FEE2E2' };

  return { score: Math.round(score), grade, breakdown };
}

function calcCost(route, metrics) {
  const b = route.biaya;
  const biayaBBMPerKm = b.konsumsiBBM > 0 ? b.hargaBBM / b.konsumsiBBM : 0;
  const biayaBBM = metrics.totalKm * biayaBBMPerKm;
  // BUG #4 FIX: kru per bus × jumlah shift (operasi 16 jam butuh 2 shift; UU Naker max 8 jam/shift)
  const shift = Number(b.shiftPerBus) || 2;
  const biayaGaji = (Number(b.gajiSopir) + Number(b.gajiAsisten)) * route.armada * shift;
  const biayaMaintenance = Number(b.maintenance) * route.armada;
  // BUG #3 FIX: "Setoran" adalah TRANSFER INTERNAL dari pendapatan tiket ke kas operator,
  // BUKAN biaya operasi. Pendapatan tiket sudah dihitung di totalPendapatan.
  // Memasukkannya sebagai biaya = double-counting yang menggelembungkan semua skema kontrak.
  const setoranInfo = (Number(b.setoran) || 0) * route.armada; // utk display informasional saja
  const biayaSetoran = 0; // intentional — TIDAK dihitung sbg biaya operasi
  const subtotalBiaya = biayaBBM + biayaGaji + biayaMaintenance;
  const overhead = subtotalBiaya * Number(b.overheadPct);
  const totalBiaya = subtotalBiaya + overhead;
  const totalPax = metrics.totalTrip * Number(b.avgPax);
  const totalPendapatan = totalPax * Number(b.tarif);
  const labaRugi = totalPendapatan - totalBiaya;
  const marginPct = totalBiaya > 0 ? labaRugi / totalBiaya : 0;

  const biayaPerKm = metrics.totalKm > 0 ? totalBiaya / metrics.totalKm : 0;
  const biayaPerTrip = metrics.totalTrip > 0 ? totalBiaya / metrics.totalTrip : 0;
  const biayaPerBusJam = (route.armada * route.jamOps) > 0 ? totalBiaya / (route.armada * route.jamOps) : 0;
  const biayaPerBusHari = route.armada > 0 ? totalBiaya / route.armada : 0;
  const biayaPerPax = totalPax > 0 ? totalBiaya / totalPax : 0;
  const tarifBEP = Math.ceil(biayaPerPax);
  const paxBEPperTrip = Number(b.tarif) > 0 ? Math.ceil(biayaPerTrip / b.tarif) : 0;

  // 5 SKEMA KONTRAK
  // 1. BTS — Buy The Service (Rp/km)
  const btsTarif = biayaPerKm * (1 + Number(b.marginPct));
  const btsHarian = btsTarif * metrics.totalKm;
  const btsTahunan = btsHarian * Number(b.hariOpsTahun);
  const tiketTahunan = totalPendapatan * Number(b.hariOpsTahun);
  const btsNetSubsidi = btsTahunan - tiketTahunan;

  // 2. Sewa/Charter (Rp/bus·hari)
  const sewaTarif = biayaPerBusHari * (1 + Number(b.marginPct));
  const sewaHarian = sewaTarif * route.armada;
  const sewaTahunan = sewaHarian * Number(b.hariOpsTahun);

  // 3. Subsidi Defisit
  const subsBiayaTotal = totalBiaya * (1 + Number(b.marginPct));
  const subsDefisit = Math.max(0, subsBiayaTotal - totalPendapatan);
  const subsTahunan = subsDefisit * Number(b.hariOpsTahun);

  // 4. PBC — Performance Based Contract
  const pbcBase = btsTahunan;
  const pbcAdjustment = pbcBase * Number(b.bobotKPI) * (Number(b.achievementKPI) - 1);
  const pbcFinal = pbcBase + pbcAdjustment;

  // 5. KPBU — Availability Payment
  const tenor = Number(b.tenor);
  const capexAwal = Number(b.capexPerBus) * route.armada;
  const amortisasi = capexAwal / tenor;
  const apTahun1 = btsTahunan + amortisasi;
  let totalKomitmen = 0;
  for (let i = 0; i < tenor; i++) {
    totalKomitmen += apTahun1 * Math.pow(1 + Number(b.eskalasiPct), i);
  }

  return {
    biayaBBMPerKm, biayaBBM, biayaGaji, biayaMaintenance, biayaSetoran, setoranInfo, shift,
    subtotalBiaya, overhead, totalBiaya,
    totalPax, totalPendapatan, labaRugi, marginPct,
    biayaPerKm, biayaPerTrip, biayaPerBusJam, biayaPerBusHari, biayaPerPax,
    tarifBEP, paxBEPperTrip,
    skema: {
      bts: { tarif: btsTarif, harian: btsHarian, tahunan: btsTahunan, tiketTahunan, netSubsidi: btsNetSubsidi },
      sewa: { tarif: sewaTarif, harian: sewaHarian, tahunan: sewaTahunan },
      subsidi: { biayaTotal: subsBiayaTotal, defisit: subsDefisit, tahunan: subsTahunan },
      pbc: { base: pbcBase, adjustment: pbcAdjustment, final: pbcFinal },
      kpbu: { tenor, capexAwal, amortisasi, apTahun1, totalKomitmen },
    }
  };
}

function calcSensitivity(route) {
  const baseHalte = route.halte;
  const lastHalte = baseHalte[baseHalte.length - 1];
  const jarakPerArah = lastHalte ? lastHalte.jarakKum : 0;
  const travelTime = baseHalte.reduce((s, h) => s + (Number(h.travelOverride) || 0), 0);
  const totalDwell = baseHalte.reduce((s, h) => s + (Number(h.dwell) || 0), 0);
  const serviceTime = travelTime + totalDwell;
  const isPP = route.tipeRute === 'PP';
  const rtt = isPP ? serviceTime * 2 : serviceTime;
  // BUG #5 FIX: PP layover di kedua terminal
  const cycleTime = rtt + (Number(route.layover) || 0) * (isPP ? 2 : 1);
  const points = [];
  for (let n = 1; n <= 12; n++) {
    const headway = cycleTime / n;
    const freq = headway > 0 ? 60 / headway : 0;
    points.push({ armada: n, headway: Number(headway.toFixed(2)), frekuensi: Number(freq.toFixed(2)) });
  }
  return points;
}

// ============================================================================
// SCHEDULE & BUS UTILIZATION ENGINE
// ============================================================================

const PERIODE_ICON = {
  'Peak': '🔴',
  'Off-Peak': '🟢',
  'Pre-Peak': '🌅',
  'Transisi': '🟡',
  'Break': '🕌',
  'Late': '🌙',
  'Tutup': '⚫',
};

const KATEGORI_BG = {
  'Peak': 'bg-rose-500/10 border-l-rose-500',
  'Off-Peak': 'bg-emerald-500/10 border-l-emerald-500',
  'Pre-Peak': 'bg-amber-500/10 border-l-amber-500',
  'Transisi': 'bg-amber-500/8 border-l-amber-400',
  'Break': 'bg-blue-500/10 border-l-blue-500',
  'Late': 'bg-violet-500/10 border-l-violet-500',
  'Tutup': 'bg-zinc-200/20 border-l-zinc-400',
};

const parseHM = (s) => {
  if (!s) return 0;
  const [h, m] = s.trim().split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const fmtHM = (mins) => {
  const total = Math.round(mins);
  const h = Math.floor(total / 60) % 24;
  const mm = ((total % 60) + 60) % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

function findPeriodeAt(timeMin, parsedPeriode) {
  for (const p of parsedPeriode) {
    if (timeMin >= p.startMin && timeMin < p.endMin) return p;
  }
  return parsedPeriode[parsedPeriode.length - 1] || { kategori: 'Tutup', kode: '?', nama: 'Luar Jam Ops' };
}

function computeHalteTimes(depMin, halte, direction) {
  // Untuk "berangkat" (Loop & PP): traversal forward titik awal → titik akhir.
  // Untuk "pulang" (PP only): traversal reverse titik akhir → titik awal.
  // travelOverride pada halte[i] = waktu tempuh DARI halte[i-1] KE halte[i] (sesuai konvensi Excel asli).
  const total = halte[halte.length - 1]?.jarakKum || 0;
  const seq = direction === 'pulang' ? [...halte].reverse() : [...halte];
  const times = [];
  let t = depMin;
  for (let i = 0; i < seq.length; i++) {
    const h = seq[i];
    // Untuk halte pertama (titik awal trip), tidak ada travel time
    if (i === 0) {
      const departure = t + (Number(h.dwell) || 0);
      times.push({
        idx: i,
        nama: h.nama,
        arrival: t,
        departure,
        jarakKum: direction === 'pulang' ? total - h.jarakKum : h.jarakKum,
      });
      t = departure;
    } else {
      // Travel time tergantung arah
      let travelTime;
      if (direction === 'pulang') {
        // BUG FIX: Untuk pulang, edge yang ditempuh adalah dari seq[i-1] ke seq[i].
        // Konvensi forward: halte[k].travelOverride = waktu DARI halte[k-1] KE halte[k].
        // Untuk pulang going halte[N-1]→halte[N-2]: edge fisik sama dengan forward halte[N-2]→halte[N-1],
        // travelOverride yang relevan adalah halte[N-1].travelOverride = seq[i-1].travelOverride
        // (BUKAN seq[i].travelOverride yang merepresentasikan edge LAIN).
        // Asumsi: travel time simetris (forward & backward sama).
        // Sebelumnya pakai h.travelOverride yang menyebabkan off-by-one — pulang trip jadi lebih cepat
        // sebanyak halte[last].travelOverride (e.g. 3 mnt pada Koridor 1E), tidak match cycleTime.
        travelTime = Number(seq[i - 1].travelOverride) || 0;
      } else {
        travelTime = Number(h.travelOverride) || 0;
      }
      const arrival = t + travelTime;
      const departure = arrival + (Number(h.dwell) || 0);
      times.push({
        idx: i,
        nama: h.nama,
        arrival,
        departure,
        jarakKum: direction === 'pulang' ? total - h.jarakKum : h.jarakKum,
      });
      t = departure;
    }
  }
  return times;
}

function generateSchedule(route, metrics, options = {}) {
  // respectStatusEvents: true = headway dinamis (window split by status), false = headway statis (base config only)
  const { respectStatusEvents = false } = options;
  const { halte, periode, layover, tipeRute } = route;
  const { cycleTime, serviceTime, isPP } = metrics;
  if (!cycleTime || !halte || halte.length < 2) return { trips: [], ritGroups: [], totalBuses: 0, parsedPeriode: [] };

  // 1. Parse waktu setiap periode
  const parsedPeriode = (periode || []).map(p => {
    const [startStr, endStr] = (p.jam || '00:00-00:00').split('-');
    let startMin = parseHM(startStr);
    let endMin = parseHM(endStr);
    if (endMin <= startMin) endMin = 24 * 60 - 1; // handle midnight wrap (P25)
    return { ...p, startMin, endMin };
  }).sort((a, b) => a.startMin - b.startMin);

  // ── 2. NEW: TIME-RANGE BASED SISIPAN OVERLAYS ──
  // Sisipan armada is INDEPENDENT from periode boundary.
  // Multiple overlays can stack (additive delta in overlap).
  // Last-defined customHeadway wins in overlap.
  const fleetSize = Number(route.armada) || 0;
  const sisipanOverlays = (route.sisipanArmada || [])
    .map(s => ({
      id: s.id,
      startMin: Number(s.startMin) || 0,
      endMin: Number(s.endMin) || 0,
      deltaArmada: Number(s.deltaArmada) || 0,
      customHeadway: (Number(s.customHeadway) || 0) > 0 ? Number(s.customHeadway) : null,
      mode: (s.mode === 'standby') ? 'standby' : 'slot', // default 'slot' for back-compat
      strictHeadway: !!s.strictHeadway, // true = bypass physics clamp (allow customH < physics min)
      catatan: s.catatan || '',
    }))
    .filter(s => s.endMin > s.startMin && (s.deltaArmada !== 0 || s.customHeadway));

  // SPLIT BY MODE: slot affects schedule grid, standby adds extra dispatches separately
  const slotSisipan = sisipanOverlays.filter(s => s.mode === 'slot');
  const standbySisipan = sisipanOverlays.filter(s => s.mode === 'standby' && s.deltaArmada > 0);

  // Active periodes (operating slots) — armada always derives from route.armada
  // (armadaPeriode field exists in legacy data tapi sekarang auto-synced ke route.armada)
  const activePeriodes = parsedPeriode
    .filter(p => p.on && p.kategori !== 'Tutup')
    .map(p => ({ ...p, armadaPeriode: Number(route.armada) || 0 }))
    .filter(p => p.armadaPeriode > 0);
  if (activePeriodes.length === 0) return { trips: [], ritGroups: [], totalBuses: 0, parsedPeriode };

  // ── 3. COMPUTE BREAKPOINTS ──
  // Union of all boundary times (periode start/end + SLOT sisipan start/end). Standby doesn't shift grid.
  const opWindowStart = Math.min(...activePeriodes.map(p => p.startMin));
  const opWindowEnd = Math.max(...activePeriodes.map(p => p.endMin));
  const breakpointSet = new Set([opWindowStart, opWindowEnd]);
  for (const p of activePeriodes) {
    breakpointSet.add(p.startMin);
    breakpointSet.add(p.endMin);
  }
  for (const s of slotSisipan) {
    if (s.startMin >= opWindowStart && s.startMin <= opWindowEnd) breakpointSet.add(s.startMin);
    if (s.endMin   >= opWindowStart && s.endMin   <= opWindowEnd) breakpointSet.add(s.endMin);
  }
  const breakpoints = Array.from(breakpointSet).sort((a, b) => a - b);

  // ── 4. COMPUTE SEGMENTS BETWEEN BREAKPOINTS ──
  // Each segment has: kategori (from periode active in that range), baseArmada,
  // total sisipan delta (sum of overlapping sisipan), effArmada, customHeadway.
  // Inactive segments (no active periode) are skipped.
  const segments = [];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const segStart = breakpoints[i];
    const segEnd = breakpoints[i + 1];
    if (segEnd <= segStart) continue;
    // Find active periode covering midpoint
    const mid = (segStart + segEnd) / 2;
    const activePeriode = activePeriodes.find(p => mid >= p.startMin && mid < p.endMin);
    if (!activePeriode) continue; // gap between active periodes (e.g., Tutup) — skip
    const baseArmada = Number(activePeriode.armadaPeriode) || 0;
    // Sum SLOT-MODE sisipan deltas covering this segment (standby tidak shift grid)
    const coveringSlot = slotSisipan.filter(s =>
      s.startMin < segEnd && s.endMin > segStart
    );
    const sisipanDelta = coveringSlot.reduce((sum, s) => sum + s.deltaArmada, 0);
    const effArmada = Math.max(0, baseArmada + sisipanDelta);

    // Track STANDBY coverage for effective headway display (standby tetap shift effective freq)
    const coveringStandby = standbySisipan.filter(s =>
      s.startMin < segEnd && s.endMin > segStart
    );
    const standbyDelta = coveringStandby.reduce((sum, s) => sum + s.deltaArmada, 0);
    const effArmadaWithStandby = effArmada + standbyDelta;

    // customHeadway: last-defined wins (highest id among covering slot sisipan)
    let customH = null;
    if (coveringSlot.length > 0) {
      const withCustomH = coveringSlot.filter(s => s.customHeadway);
      if (withCustomH.length > 0) {
        const latest = withCustomH.reduce((a, b) => (a.id > b.id ? a : b));
        customH = latest.customHeadway;
      }
    }
    segments.push({
      startMin: segStart,
      endMin: segEnd,
      kategori: activePeriode.kategori,
      kode: activePeriode.kode,
      nama: activePeriode.nama,
      baseArmada,
      sisipanDelta,
      effArmada,
      standbyDelta,                              // ← NEW: standby buses covering segment
      effArmadaWithStandby,                       // ← NEW: total effective armada (slot + standby)
      customHeadway: customH,
      hasSisipan: sisipanDelta !== 0 || customH !== null,
      hasStandby: standbyDelta > 0,               // ← NEW: flag if standby active
      coveringSisipanIds: coveringSlot.map(s => s.id),
      coveringStandbyIds: coveringStandby.map(s => s.id),
      periodeRef: activePeriode,
    });
  }
  if (segments.length === 0) return { trips: [], ritGroups: [], totalBuses: 0, parsedPeriode };

  // ── 5. GROUP CONSECUTIVE SEGMENTS WITH SAME (effArmada, customHeadway) ──
  // This is the new "armada window" — independent of periode kategori boundaries.
  const baseRitGroups = [];
  let curr = null;
  for (const seg of segments) {
    if (curr && curr.armada === seg.effArmada && curr.endMin === seg.startMin && curr.customHeadway === seg.customHeadway) {
      curr.endMin = seg.endMin;
      curr.segments.push(seg);
      // Track unique periodes spanned by this group
      if (!curr.periodes.find(p => p.kode === seg.periodeRef.kode)) {
        curr.periodes.push(seg.periodeRef);
      }
      curr.hasSisipan = curr.hasSisipan || seg.hasSisipan;
    } else {
      if (curr) baseRitGroups.push(curr);
      curr = {
        id: baseRitGroups.length + 1,
        armada: seg.effArmada,
        baseArmada: seg.baseArmada,
        sisipan: seg.sisipanDelta,
        customHeadway: seg.customHeadway,
        startMin: seg.startMin,
        endMin: seg.endMin,
        segments: [seg],
        periodes: [seg.periodeRef], // tracks unique periodes spanned by this group
        hasSisipan: seg.hasSisipan,
      };
    }
  }
  if (curr) baseRitGroups.push(curr);

  // Filter out groups with effArmada=0 (e.g., negative sisipan zeroing out)
  const baseRitGroupsFiltered = baseRitGroups.filter(g => g.armada > 0);
  baseRitGroupsFiltered.forEach((g, i) => g.id = i + 1);
  baseRitGroups.length = 0;
  baseRitGroups.push(...baseRitGroupsFiltered);


  // 3b. Sub-split base groups by status event boundaries.
  // Hanya aktif di mode DINAMIS — di mode STATIS, base groups dipakai langsung
  // (semua bus selalu dianggap available, headway uniform).
  const busStatusEvents = route.busStatusEvents || [];
  const ritGroups = [];

  if (respectStatusEvents && busStatusEvents.length > 0) {
    // ── MODE DINAMIS ──
    for (const g of baseRitGroups) {
      // Kumpulkan boundary times dari status events yang jatuh di dalam group
      const boundariesSet = new Set([g.startMin, g.endMin]);
      for (const e of busStatusEvents) {
        if (e.status === 'active') continue;
        if (Number(e.busId) > g.armada) continue;
        const eStart = Number(e.startMin);
        const eEnd = Number(e.endMin);
        if (eStart > g.startMin && eStart < g.endMin) boundariesSet.add(eStart);
        if (eEnd > g.startMin && eEnd < g.endMin) boundariesSet.add(eEnd);
      }
      const boundaries = Array.from(boundariesSet).sort((a, b) => a - b);

      for (let i = 0; i < boundaries.length - 1; i++) {
        const subStart = boundaries[i];
        const subEnd = boundaries[i + 1];

        const activeBusIds = [];
        for (let b = 1; b <= g.armada; b++) {
          const blocked = busStatusEvents.some(e =>
            e.busId === b && e.status !== 'active' &&
            Number(e.startMin) < subEnd && Number(e.endMin) > subStart
          );
          if (!blocked) activeBusIds.push(b);
        }

        const effectiveCount = activeBusIds.length;
        const hasCustomH = g.customHeadway && g.customHeadway > 0;
        // baseHeadway: parent's UNDISRUPTED headway (used for dispatch grid timing).
        // headway: sub-group's "effective" headway for DISPLAY (cycle/effCount, shows compression).
        const baseHeadway = hasCustomH
          ? g.customHeadway
          : (g.armada > 0 ? cycleTime / g.armada : Infinity);
        const headway = hasCustomH
          ? g.customHeadway
          : (effectiveCount > 0 ? cycleTime / effectiveCount : Infinity);

        ritGroups.push({
          id: ritGroups.length + 1,
          armada: g.armada,
          baseArmada: g.baseArmada,
          sisipan: g.sisipan,
          customHeadway: g.customHeadway,
          startMin: subStart,
          endMin: subEnd,
          periodes: g.periodes,
          activeBusIds,
          effectiveCount,
          baseHeadway,    // NEW: parent's baseline (used by dispatch loop)
          headway,        // adjusted (display)
          headwayIsCustom: !!hasCustomH,
          isStatusAffected: effectiveCount < g.armada,
          parentGroupId: g.id,
        });
      }
    }
  } else {
    // ── MODE STATIS ── (default) — semua bus selalu di rotasi, no splitting
    for (const g of baseRitGroups) {
      const hasCustomH = g.customHeadway && g.customHeadway > 0;
      const headway = hasCustomH
        ? g.customHeadway
        : (g.armada > 0 ? cycleTime / g.armada : Infinity);

      ritGroups.push({
        id: ritGroups.length + 1,
        armada: g.armada,
        baseArmada: g.baseArmada,
        sisipan: g.sisipan,
        customHeadway: g.customHeadway,
        startMin: g.startMin,
        endMin: g.endMin,
        periodes: g.periodes,
        activeBusIds: Array.from({ length: g.armada }, (_, i) => i + 1),
        effectiveCount: g.armada,
        baseHeadway: headway,    // STATIS: same as headway (no split)
        headway,
        headwayIsCustom: !!hasCustomH,
        isStatusAffected: false,
        parentGroupId: g.id,
      });
    }
  }

  // 4. Generate trip per armada window dengan sequential RIT numbering.
  //    DEFINISI RIT: 1 RIT = 1 putaran lengkap dispatch dari Bus#1 → Bus#n → kembali ke Bus#1.
  //    Setiap kali cycleIdx wrap (kembali ke bus pertama dalam cycle), RIT counter increment.
  const trips = [];
  let totalBuses = 0;
  let globalRitCounter = 0; // sequential RIT number across entire day
  let busAvailable = {}; // busId -> earliest minute bus bisa berangkat lagi

  // ── ROTATION CONTINUITY FIX ──
  // cycleIdx, scheduledDep, dan ritOffset di-track di SCOPE LUAR for-loop, dan hanya
  // di-reset saat ENTER NEW PARENT GROUP (bukan sub-group). Untuk DINAMIS mode dimana
  // satu parent group bisa di-split jadi beberapa sub-groups (per event boundary),
  // cycleIdx CONTINUE across sub-groups untuk preserve rotation pattern. Saat bus blocked
  // di sub-group tertentu, scheduler SKIP bus itu (bukan reset cycleIdx) — sehingga
  // bus lain tetap pada posisi rotation yang konsisten dengan parent group.
  //
  // Tanpa fix ini, T16 di Bus #4 akan SHIFT timing-nya antara Perencanaan vs Operasional
  // walau Bus #4 tidak punya event apapun, karena cycleIdx reset ke 0 di setiap sub-group
  // mengubah posisi Bus #4 dalam rotation.
  let cycleIdx = 0;
  let lastParentGroupId = null;
  let lastParentArmada = null;
  let lastParentCustomH = null;
  let scheduledDep = 0;
  let ritOffsetForGroup = 0; // globalRitCounter snapshot saat enter armada change

  for (const group of ritGroups) {
    const headway = group.headway;
    const baseHeadway = group.baseHeadway || group.headway; // fallback for safety
    const activeBusIds = group.activeBusIds;
    const effCount = group.effectiveCount;
    const parentArmada = group.armada; // parent's full armada (with sisipan)
    const parentCustomH = group.customHeadway || null;

    // ── ROTATION CONTINUITY ACROSS GAPS ──
    // cycleIdx HANYA reset saat armada/customHeadway BERUBAH (rotation pattern actually changes).
    // Saat ada gap di operasi (Tutup periode, Dzuhur break, dll) tapi armada sama setelah resume,
    // rotation CONTINUE seamlessly — bus berikutnya dalam urutan dispatched, bukan reset ke Bus#1.
    // scheduledDep selalu di-advance ke group.startMin (skip waktu gap).
    const armadaChanged = parentArmada !== lastParentArmada || parentCustomH !== lastParentCustomH;
    if (armadaChanged) {
      cycleIdx = 0;
      ritOffsetForGroup = globalRitCounter;
    }
    scheduledDep = Math.max(scheduledDep, group.startMin);
    lastParentGroupId = group.parentGroupId;
    lastParentArmada = parentArmada;
    lastParentCustomH = parentCustomH;

    if (effCount === 0 || !isFinite(headway)) {
      // All buses blocked di sub-group ini — advance time, don't reset cycleIdx
      scheduledDep = Math.max(scheduledDep, group.endMin);
      continue;
    }

    // CRITICAL: busAvailable CARRIES OVER across groups. Tanpa carry-over akan terjadi
    // TIME-TRAVEL BUG: Bus#3 dispatch 11:20 arrive 11:49, group N+1 (start 11:30) reset
    // → scheduler thinks Bus#3 free at 11:30 → dispatch sebelum bus kembali. Carry-over
    // memastikan physics respected.

    while (scheduledDep < group.endMin) {
      // ── GAP-BASED ROTATION (FIXED-GRID) ──
      // Bus pada posisi cycleIdx % parentArmada. Jika bus blocked di sub-group ini,
      // SLOT-NYA GAP (no dispatch), advance time pakai BASELINE headway (bukan adjusted).
      // Ini preserve schedule grid yang sama di Perencanaan vs Operasional — bus yang
      // tidak terkena event tetap dispatch di waktu yang sama.
      const candidate = (cycleIdx % parentArmada) + 1;
      const isBlocked = !activeBusIds.includes(candidate);

      if (isBlocked) {
        // Slot gapped: bus blocked → no dispatch, advance grid time, increment cycleIdx
        cycleIdx++;
        scheduledDep += baseHeadway;
        continue;
      }

      const localBus = candidate;
      totalBuses = Math.max(totalBuses, localBus);
      const depTime = Math.max(scheduledDep, busAvailable[localBus] || 0);
      if (depTime >= group.endMin) break;

      // RIT NUMBER: 1 RIT = 1 putaran lengkap rotation (parentArmada positions).
      const ritNumber = ritOffsetForGroup + Math.floor(cycleIdx / parentArmada) + 1;
      if (ritNumber > globalRitCounter) {
        globalRitCounter = ritNumber;
      }

      const periodeBerangkat = findPeriodeAt(depTime, parsedPeriode);
      const halteTimesB = computeHalteTimes(depTime, halte, 'berangkat');
      const arriveLastB = halteTimesB[halteTimesB.length - 1].arrival;

      trips.push({
        ritNumber: ritNumber,
        armadaWindow: group.id,
        ritArmada: effCount,
        ritHeadway: headway,
        ritStatusAffected: !!group.isStatusAffected,
        // SISIPAN FLAG: trip dipatch oleh bus yang melebihi base armadaPeriode
        // (yaitu bus tambahan yang muncul karena sisipan +N di group ini)
        isSisipan: localBus > (group.baseArmada || 0),
        busId: localBus,
        depMinutes: depTime,
        arrMinutes: arriveLastB,
        direction: 'berangkat',
        periode: periodeBerangkat,
        halteTimes: halteTimesB,
      });

      let nextAvailable = arriveLastB + (Number(layover) || 0);

      if (isPP) {
        const pulangDep = arriveLastB + (Number(layover) || 0);
        if (pulangDep < group.endMin + cycleTime) {
          const periodePulang = findPeriodeAt(pulangDep, parsedPeriode);
          const halteTimesP = computeHalteTimes(pulangDep, halte, 'pulang');
          const arriveLastP = halteTimesP[halteTimesP.length - 1].arrival;
          // Pulang trip = same RIT (same bus completing the round)
          trips.push({
            ritNumber: ritNumber,
            armadaWindow: group.id,
            ritArmada: effCount,
            ritHeadway: headway,
            ritStatusAffected: !!group.isStatusAffected,
            isSisipan: localBus > (group.baseArmada || 0),
            busId: localBus,
            depMinutes: pulangDep,
            arrMinutes: arriveLastP,
            direction: 'pulang',
            periode: periodePulang,
            halteTimes: halteTimesP,
          });
          nextAvailable = arriveLastP + (Number(layover) || 0);
        }
      }

      busAvailable[localBus] = nextAvailable;
      // FIXED-GRID: advance pakai BASELINE headway (bukan adjusted sub-group headway).
      // Schedule grid uniform di parent. Bus delayed (depTime > scheduledDep) tetap
      // pakai depTime + baseHeadway untuk preserve order, walau ada minor drift.
      scheduledDep = depTime + baseHeadway;
      cycleIdx++;
    }
  }

  // 5. STANDBY DISPATCHES — extra trips at midpoint of regular grid
  //    Standby buses tersedia di terminal, dispatch tanpa geser grid regular.
  //    Setiap standby bus dispatch setiap cycleTime (physics constraint).
  //    customHeadway (jika di-set): override interval standby dispatch (clamped to physics min).
  if (standbySisipan.length > 0) {
    const baseHeadwayGlobal = cycleTime > 0 && (Number(route.armada) || 0) > 0
      ? cycleTime / Number(route.armada)
      : 0;
    for (const sb of standbySisipan) {
      if (baseHeadwayGlobal <= 0 || cycleTime <= 0 || sb.deltaArmada <= 0) continue;
      // Physics minimum: each standby bus needs cycleTime to return → combined min = cycleTime/delta
      const physicsMinInterval = cycleTime / sb.deltaArmada;
      // customHeadway interpretation: target standby dispatch interval
      // strictHeadway: jika ON, customH dipakai apa adanya (tanpa physics clamp).
      //                jika OFF (default), clamp ke physics min agar feasible.
      const standbyInterval = (sb.customHeadway && Number(sb.customHeadway) > 0)
        ? (sb.strictHeadway ? Number(sb.customHeadway) : Math.max(Number(sb.customHeadway), physicsMinInterval))
        : physicsMinInterval;

      // GRID-ALIGNED PHASE OFFSET — penting untuk avoid collision dengan regular dispatch.
      // Compute first regular dispatch time at-or-after sb.startMin (relatif terhadap opWindowStart grid).
      // Lalu first standby dispatch = midpoint antara firstRegular dan nextRegular.
      // Ini guarantee standby selalu di TENGAH dua regular slots, bukan TUMPANG TINDIH.
      const offsetFromGrid = ((sb.startMin - opWindowStart) % baseHeadwayGlobal + baseHeadwayGlobal) % baseHeadwayGlobal;
      const firstRegularInWindow = offsetFromGrid === 0
        ? sb.startMin
        : sb.startMin + (baseHeadwayGlobal - offsetFromGrid);
      // First standby dispatch: midpoint antara firstRegularInWindow dan dispatch berikutnya.
      let t = firstRegularInWindow + baseHeadwayGlobal / 2;
      // Edge case: kalau firstStandby >= sb.endMin tapi sb.startMin + baseHeadway/2 < sb.endMin,
      // fallback ke offset dari window start (untuk window pendek di awal).
      if (t >= sb.endMin && (sb.startMin + baseHeadwayGlobal / 2) < sb.endMin) {
        t = sb.startMin + baseHeadwayGlobal / 2;
      }

      // Effective combined headway in window
      // = 1 / (regular_rate + standby_rate)
      // = 1 / (1/baseHeadway + 1/standbyInterval)
      const regularRate = 1 / baseHeadwayGlobal;
      const standbyRate = 1 / standbyInterval;
      const effCombinedHeadway = 1 / (regularRate + standbyRate);
      const effCombinedArmada = (Number(route.armada) || 0) + sb.deltaArmada;

      let standbyIdx = 0;
      while (t < sb.endMin) {
        // Standby bus IDs start from route.armada + 1 (after base)
        const standbyBusId = (Number(route.armada) || 0) + (standbyIdx % sb.deltaArmada) + 1;
        const periodeAtT = findPeriodeAt(t, parsedPeriode);

        // Berangkat trip
        const halteTimesB = computeHalteTimes(t, halte, 'berangkat');
        const arriveLastB = halteTimesB[halteTimesB.length - 1].arrival;
        trips.push({
          ritNumber: 0, // standby trips not part of RIT rotation; mark as 0
          armadaWindow: 0,
          ritArmada: effCombinedArmada,           // combined effective armada in window
          ritHeadway: effCombinedHeadway,          // ← FIX: combined effective (not standby's own interval)
          ritStatusAffected: false,
          isSisipan: true,
          isStandby: true,
          busId: standbyBusId,
          depMinutes: t,
          arrMinutes: arriveLastB,
          direction: 'berangkat',
          periode: periodeAtT,
          halteTimes: halteTimesB,
        });
        totalBuses = Math.max(totalBuses, standbyBusId);

        // Pulang trip for PP
        if (isPP) {
          const pulangDep = arriveLastB + (Number(layover) || 0);
          if (pulangDep < sb.endMin + cycleTime) {
            const periodePulang = findPeriodeAt(pulangDep, parsedPeriode);
            const halteTimesP = computeHalteTimes(pulangDep, halte, 'pulang');
            const arriveLastP = halteTimesP[halteTimesP.length - 1].arrival;
            trips.push({
              ritNumber: 0,
              armadaWindow: 0,
              ritArmada: effCombinedArmada,
              ritHeadway: effCombinedHeadway,
              ritStatusAffected: false,
              isSisipan: true,
              isStandby: true,
              busId: standbyBusId,
              depMinutes: pulangDep,
              arrMinutes: arriveLastP,
              direction: 'pulang',
              periode: periodePulang,
              halteTimes: halteTimesP,
            });
          }
        }

        t += standbyInterval;
        standbyIdx++;
      }
    }
  }

  // 6. Sort + nomor urut global
  //    Chronological order: regular dan standby trips diurutkan by depMinutes.
  //    Visual distinction tetap via isStandby flag (green ✦ marker di matrix).
  trips.sort((a, b) => a.depMinutes - b.depMinutes);
  trips.forEach((t, i) => { t.id = i + 1; });

  // 7. Derive sequential RIT cycles from trips (for RitDetailTable)
  //    Standby trips (ritNumber=0) tidak masuk RIT rotation regular.
  const ritsMap = {};
  for (const t of trips) {
    if (t.isStandby || !t.ritNumber || t.ritNumber === 0) continue; // skip standby
    if (!ritsMap[t.ritNumber]) {
      ritsMap[t.ritNumber] = {
        number: t.ritNumber,
        armadaWindow: t.armadaWindow,
        armadaCount: t.ritArmada,
        headway: t.ritHeadway,
        statusAffected: !!t.ritStatusAffected,
        trips: [],
        busIds: new Set(),
        startMin: Infinity,
        endMin: -Infinity,
        kategoriDom: null,
      };
    }
    const r = ritsMap[t.ritNumber];
    r.trips.push(t);
    r.busIds.add(t.busId);
    r.startMin = Math.min(r.startMin, t.depMinutes);
    r.endMin = Math.max(r.endMin, t.arrMinutes);
    if (!r.kategoriDom) r.kategoriDom = t.periode?.kategori;
  }
  const rits = Object.values(ritsMap)
    .sort((a, b) => a.number - b.number)
    .map(r => ({ ...r, busIds: Array.from(r.busIds).sort((a, b) => a - b), tripCount: r.trips.length }));

  return { trips, ritGroups, rits, totalBuses, parsedPeriode };
}

function generateBusUtilization(scheduleData, route, metrics) {
  const { trips, totalBuses, ritGroups } = scheduleData;
  const { kmPerTrip, isPP } = metrics;
  const buses = [];

  // Iterate up to fleet size (route.armada), not just totalBuses,
  // so configured-but-idle buses also appear (status: ALL OFF/SERVICE/dst di semua periode)
  const fleetSize = Math.max(Number(route.armada) || 0, totalBuses);

  for (let b = 1; b <= fleetSize; b++) {
    const busTrips = trips.filter(t => t.busId === b).sort((a, b2) => a.depMinutes - b2.depMinutes);
    if (busTrips.length === 0) {
      buses.push({
        id: b, trips: [], tripCount: 0, berangkatCount: 0, pulangCount: 0,
        firstDep: 0, lastArr: 0,
        dutyMin: 0, activeMin: 0, idleMin: 0, utilizationPct: 0, totalKm: 0, ritsActive: [],
      });
      continue;
    }
    const firstDep = busTrips[0].depMinutes;
    const lastArr = busTrips[busTrips.length - 1].arrMinutes;
    const dutyMin = lastArr - firstDep;
    const activeMin = busTrips.reduce((s, t) => s + (t.arrMinutes - t.depMinutes), 0);
    const idleMin = Math.max(0, dutyMin - activeMin);
    const utilizationPct = dutyMin > 0 ? activeMin / dutyMin : 0;
    const totalKm = busTrips.length * (kmPerTrip || 0);
    const ritsActive = [...new Set(busTrips.map(t => t.ritNumber))];
    const berangkatCount = busTrips.filter(t => t.direction === 'berangkat').length;
    const pulangCount = busTrips.filter(t => t.direction === 'pulang').length;

    buses.push({
      id: b,
      trips: busTrips,
      tripCount: busTrips.length,
      berangkatCount,
      pulangCount,
      firstDep,
      lastArr,
      dutyMin,
      activeMin,
      idleMin,
      utilizationPct,
      totalKm,
      ritsActive,
      // Mark this bus as standby if ALL its trips are standby trips
      isStandby: busTrips.length > 0 && busTrips.every(t => !!t.isStandby),
      // Mark as sisipan-only (slot) if all trips are isSisipan but not standby
      isSlotSisipan: busTrips.length > 0 && busTrips.every(t => !!t.isSisipan && !t.isStandby),
    });
  }
  return buses;
}

// ============================================================================
// FORMATTER UTILS
// ============================================================================
const fmtRp = (n) => {
  if (n === 0 || n == null || isNaN(n)) return 'Rp 0';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `Rp ${(n / 1e9).toFixed(2)} M`;
  if (abs >= 1e6) return `Rp ${(n / 1e6).toFixed(2)} Jt`;
  if (abs >= 1e3) return `Rp ${(n / 1e3).toFixed(0)} rb`;
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
};
const fmtRpFull = (n) => {
  if (n == null || isNaN(n)) return 'Rp 0';
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
};
const fmtNum = (n, d = 1) => {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toFixed(d).replace('.', ',');
};
const fmtPct = (n, d = 1) => {
  if (n == null || isNaN(n)) return '0%';
  return `${(n * 100).toFixed(d).replace('.', ',')}%`;
};
// Format durasi dari MINUTES → "Xj Ym" (or "Ym" if < 60min, "Xj" if exact hours)
const fmtDurMin = (mins) => {
  if (mins == null || isNaN(mins) || mins === 0) return '0m';
  const total = Math.round(Number(mins));
  const sign = total < 0 ? '-' : '';
  const abs = Math.abs(total);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}j`;
  return `${sign}${h}j ${m}m`;
};
// Format durasi dari HOURS (decimal) → "Xj Ym"
const fmtDurH = (hours) => {
  if (hours == null || isNaN(hours)) return '0m';
  return fmtDurMin(Number(hours) * 60);
};
// Format durasi full-word: "X jam Y menit" (lebih readable untuk user-facing labels)
const fmtJamMenit = (hours) => {
  if (hours == null || isNaN(hours)) return '0 menit';
  const totalMin = Math.round(Number(hours) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0 && m === 0) return '0 menit';
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
};

// ============================================================================
// REUSABLE UI ELEMENTS
// ============================================================================

const StatusPill = ({ band, size = 'sm' }) => {
  const colorMap = {
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  };
  const sz = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 ${sz} rounded border font-mono uppercase tracking-wide ${colorMap[band.color]}`}>
      {band.emoji} {band.label}
    </span>
  );
};

const Card = ({ children, className = '' }) => (
  <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8 }} className={className}>
    {children}
  </div>
);

const Section = ({ title, icon: Icon, children, action }) => (
  <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
    <div className="flex items-center justify-between" style={{ padding: '10px 16px', borderBottom: '1px solid #E4E4E7', background: '#FAFAFA' }}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={13} style={{ color: '#71717A' }} />}
        <h3 style={{ fontSize: 11, fontWeight: 600, color: '#52525B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>{title}</h3>
      </div>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const KpiCard = ({ label, value, unit, sub, status, icon: Icon, accent = 'cyan' }) => {
  const accentColor = {
    cyan: '#0EA5E9', emerald: '#059669', amber: '#D97706', rose: '#DC2626', violet: '#7C3AED',
  }[accent] || '#0EA5E9';
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 14 }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span style={{ width: 4, height: 12, borderRadius: 2, background: accentColor, display: 'inline-block' }} />
          <span style={{ fontSize: 10, color: '#71717A', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
        </div>
        {Icon && <Icon size={12} style={{ color: '#A1A1AA' }} />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span style={{ fontSize: 22, fontWeight: 600, color: '#18181B', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontSize: 11, color: '#71717A' }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#71717A', marginTop: 4 }}>{sub}</div>}
      {status && <div className="mt-1.5"><StatusPill band={status} /></div>}
    </div>
  );
};

const NumInput = ({ value, onChange, step = 1, min = 0, max, suffix, className = '' }) => (
  <div className="relative">
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={{
        width: '100%', background: '#FFFFFF', border: '1px solid #D4D4D8', borderRadius: 5,
        padding: suffix ? '6px 36px 6px 10px' : '6px 10px', fontSize: 13,
        color: '#18181B', outline: 'none', fontVariantNumeric: 'tabular-nums',
      }}
      className={className}
      onFocus={e => e.target.style.borderColor = '#047857'}
      onBlur={e => e.target.style.borderColor = '#D4D4D8'}
    />
    {suffix && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#71717A', pointerEvents: 'none' }}>{suffix}</span>}
  </div>
);

const TextInput = ({ value, onChange, className = '' }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{ width: '100%', background: '#FFFFFF', border: '1px solid #D4D4D8', borderRadius: 5, padding: '6px 10px', fontSize: 13, color: '#18181B', outline: 'none' }}
    className={className}
    onFocus={e => e.target.style.borderColor = '#047857'}
    onBlur={e => e.target.style.borderColor = '#D4D4D8'}
  />
);

// Inline editable text — click to edit, Enter/blur to save, Esc to cancel.
// Used for editing items in-place (e.g., route name in page header).
const InlineEditableText = ({ value, onChange, style = {}, className = '', placeholder = '' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);

  const commit = () => {
    const trimmed = (draft || '').trim();
    if (trimmed && trimmed !== value) onChange(trimmed);
    else setDraft(value);
    setEditing(false);
  };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
        placeholder={placeholder}
        style={{
          ...style,
          background: '#FFFFFF',
          border: '1px solid #047857',
          borderRadius: 4,
          padding: '2px 8px',
          outline: 'none',
          width: '100%',
          maxWidth: 'fit-content',
          minWidth: 200,
        }}
        className={className}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Klik untuk edit"
      style={{
        ...style,
        cursor: 'text',
        padding: '2px 8px',
        margin: '-2px -8px',
        borderRadius: 4,
        display: 'inline-block',
        transition: 'background 0.1s',
      }}
      className={className}
      onMouseEnter={e => e.currentTarget.style.background = '#F4F4F5'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {value || <span style={{ color: '#A1A1AA', fontStyle: 'italic' }}>{placeholder}</span>}
    </span>
  );
};

const Btn = ({ children, onClick, variant = 'default', icon: Icon, size = 'md', disabled }) => {
  const variants = {
    default: { bg: '#FFFFFF', color: '#3F3F46', border: '#D4D4D8', hoverBg: '#FAFAFA' },
    primary: { bg: '#047857', color: '#FFFFFF', border: '#047857', hoverBg: '#065F46' },
    danger:  { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', hoverBg: '#FEE2E2' },
    ghost:   { bg: 'transparent', color: '#52525B', border: 'transparent', hoverBg: '#F4F4F5' },
    success: { bg: '#059669', color: '#FFFFFF', border: '#059669', hoverBg: '#047857' },
  };
  const sizes = {
    sm: { px: 9, py: 4, fs: 11, ic: 11 },
    md: { px: 12, py: 6, fs: 12.5, ic: 13 },
    lg: { px: 16, py: 8, fs: 13, ic: 14 },
  };
  const v = variants[variant] || variants.default;
  const sz = sizes[size] || sizes.md;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: `${sz.py}px ${sz.px}px`, fontSize: sz.fs, fontWeight: 500,
        background: v.bg, color: v.color, border: `1px solid ${v.border}`,
        borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hoverBg; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.bg; }}
    >
      {Icon && <Icon size={sz.ic} />}
      {children}
    </button>
  );
};

const Row = ({ label, value, unit, tone = 'default', mono = true }) => {
  const colors = {
    default: '#18181B', pos: '#059669', neg: '#DC2626', warn: '#D97706', muted: '#71717A',
  };
  return (
    <div className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '1px solid #F4F4F5' }}>
      <span style={{ fontSize: 12, color: '#52525B' }}>{label}</span>
      <span style={{ fontSize: 13, color: colors[tone], fontVariantNumeric: mono ? 'tabular-nums' : 'normal' }}>
        {value}{unit && <span style={{ fontSize: 10, color: '#71717A', marginLeft: 4 }}>{unit}</span>}
      </span>
    </div>
  );
};

// ─── Drawer ─────────────────────────────────────────────────────────────────
// Slide-in panel from the right. Used to host configuration & analysis tools
// without losing context of the main schedule visualization.
const Drawer = ({ open, onClose, title, subtitle, icon: Icon, width = 720, children }) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(24, 24, 27, 0.32)',
          zIndex: 40, backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.15s ease-out',
        }}
      />
      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: width,
          background: '#FFFFFF', borderLeft: '1px solid #E4E4E7',
          boxShadow: '-12px 0 24px rgba(24, 24, 27, 0.08)',
          zIndex: 50, display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.18s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', background: '#FAFAFA', flexShrink: 0 }}>
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#ECFDF5', color: '#047857', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} />
              </div>
            )}
            <div className="min-w-0">
              <div style={{ fontSize: 14.5, fontWeight: 600, color: '#18181B', letterSpacing: '-0.01em' }}>{title}</div>
              {subtitle && <div style={{ fontSize: 11.5, color: '#71717A', marginTop: 1 }}>{subtitle}</div>}
            </div>
          </div>
          <button
            onClick={onClose}
            title="Tutup (Esc)"
            style={{
              width: 32, height: 32, borderRadius: 6, border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: '#71717A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F4F5'; e.currentTarget.style.color = '#18181B'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717A'; }}
          >
            <XCircle size={18} />
          </button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#FFFFFF' }}>
          {children}
        </div>
      </div>
      {/* Animation styles */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

// ─── ToolButton ─────────────────────────────────────────────────────────────
// Compact button used in the action bar to launch tool drawers
const ToolButton = ({ icon: Icon, label, onClick, active = false, badge = null, accent = '#047857' }) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 11px', fontSize: 12, fontWeight: active ? 600 : 500,
      background: active ? '#ECFDF5' : '#FFFFFF',
      color: active ? accent : '#52525B',
      border: `1px solid ${active ? accent + '60' : '#E4E4E7'}`,
      borderRadius: 6, cursor: 'pointer',
      transition: 'all 0.1s', position: 'relative',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#A1A1AA'; e.currentTarget.style.background = '#FAFAFA'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#E4E4E7'; e.currentTarget.style.background = '#FFFFFF'; } }}
  >
    {Icon && <Icon size={13} />}
    <span>{label}</span>
    {badge !== null && badge !== 0 && (
      <span style={{
        background: '#DC2626', color: '#FFFFFF',
        fontSize: 9, fontWeight: 700,
        minWidth: 16, height: 16, borderRadius: 8,
        padding: '0 4px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginLeft: 2,
      }}>{badge}</span>
    )}
  </button>
);

// ============================================================================
// TABS
// ============================================================================

function TabParameter({ route, updateRoute, mode }) {
  const m = useMemo(() => calcMetrics(route), [route]);
  const updateField = (field, val) => updateRoute({ ...route, [field]: val });
  const updateHalte = (id, field, val) => {
    const next = route.halte.map(h => h.id === id ? { ...h, [field]: val } : h);
    updateRoute({ ...route, halte: next });
  };
  const addHalte = () => {
    const lastId = Math.max(0, ...route.halte.map(h => h.id));
    const lastJarak = route.halte.length > 0 ? route.halte[route.halte.length - 1].jarakKum : 0;
    const newH = { id: lastId + 1, nama: `Halte ${lastId + 1}`, jarakKum: lastJarak + 1, dwell: 0.5, travelOverride: 3 };
    // sisip sebelum terminal akhir
    const next = [...route.halte.slice(0, -1), newH, route.halte[route.halte.length - 1]];
    // re-calculate jarakKum agar terurut
    updateRoute({ ...route, halte: next });
  };
  const removeHalte = (id) => {
    if (route.halte.length <= 2) return;
    updateRoute({ ...route, halte: route.halte.filter(h => h.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Input Parameter */}
        <div className="col-span-5">
          <Section title="Parameter Operasi" icon={Settings}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Tipe Rute</label>
                <div className="flex gap-2">
                  {['Loop', 'PP'].map(t => (
                    <button
                      key={t}
                      onClick={() => updateField('tipeRute', t)}
                      className={`flex-1 px-3 py-1.5 rounded border text-sm font-mono ${route.tipeRute === t ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}
                    >
                      {t === 'Loop' ? 'LOOP (1 arah melingkar)' : 'PP (Pulang-Pergi)'}
                    </button>
                  ))}
                </div>

                {/* ── EDUCATIONAL INFO PANEL — what's the difference + live preview ── */}
                {(() => {
                  // Compute alternative metrics (what would happen if user switched type)
                  const altRoute = { ...route, tipeRute: route.tipeRute === 'PP' ? 'Loop' : 'PP' };
                  const altM = calcMetrics(altRoute);
                  const isCurrentPP = route.tipeRute === 'PP';
                  const altLabel = isCurrentPP ? 'Loop' : 'PP';

                  return (
                    <div style={{ marginTop: 10, padding: '10px 12px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 6 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#0C4A6E', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
                        ℹ️ Beda Loop vs PP — Pengaruh ke Semua Perhitungan
                      </div>

                      {/* Visual diagram */}
                      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 10 }}>
                        <div style={{ background: '#FFFFFF', border: route.tipeRute === 'Loop' ? '2px solid #10B981' : '1px solid #E0F2FE', borderRadius: 4, padding: '8px 10px' }}>
                          <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: route.tipeRute === 'Loop' ? '#047857' : '#0369A1' }}>LOOP</span>
                            {route.tipeRute === 'Loop' && (
                              <span style={{ fontSize: 9, fontWeight: 700, color: '#FFFFFF', background: '#10B981', padding: '1px 6px', borderRadius: 3 }}>AKTIF</span>
                            )}
                          </div>
                          <svg width="100%" height="44" viewBox="0 0 140 44" style={{ marginBottom: 6 }}>
                            <ellipse cx="70" cy="22" rx="50" ry="14" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3,2" />
                            <circle cx="20" cy="22" r="4" fill="#047857" />
                            <text x="20" y="22" textAnchor="middle" dy="-7" style={{ fontSize: 8, fill: '#047857', fontWeight: 700 }}>Terminal</text>
                            <circle cx="70" cy="36" r="2.5" fill="#10B981" />
                            <circle cx="120" cy="22" r="2.5" fill="#10B981" />
                            <circle cx="70" cy="8" r="2.5" fill="#10B981" />
                            <polygon points="68,8 73,8 70,4" fill="#10B981" />
                          </svg>
                          <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
                            • <strong>1 terminal</strong> (titik awal = titik akhir)<br/>
                            • Bus kembali sendiri (sirkular)<br/>
                            • <strong>Layover ×1</strong> per cycle<br/>
                            • 1 cycle = <strong>1 trip</strong><br/>
                            • Direction: 1 arah saja
                          </div>
                          <div style={{ fontSize: 10, color: '#0369A1', marginTop: 4, fontStyle: 'italic' }}>
                            Contoh: TransJakarta sirkular kampus, BRT lingkar
                          </div>
                        </div>

                        <div style={{ background: '#FFFFFF', border: route.tipeRute === 'PP' ? '2px solid #10B981' : '1px solid #E0F2FE', borderRadius: 4, padding: '8px 10px' }}>
                          <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: route.tipeRute === 'PP' ? '#047857' : '#0369A1' }}>PP (Pulang-Pergi)</span>
                            {route.tipeRute === 'PP' && (
                              <span style={{ fontSize: 9, fontWeight: 700, color: '#FFFFFF', background: '#10B981', padding: '1px 6px', borderRadius: 3 }}>AKTIF</span>
                            )}
                          </div>
                          <svg width="100%" height="44" viewBox="0 0 140 44" style={{ marginBottom: 6 }}>
                            <line x1="20" y1="14" x2="120" y2="14" stroke="#10B981" strokeWidth="1.5" />
                            <line x1="20" y1="30" x2="120" y2="30" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3,2" />
                            <polygon points="118,11 124,14 118,17" fill="#10B981" />
                            <polygon points="22,33 16,30 22,27" fill="#10B981" />
                            <circle cx="20" cy="22" r="4" fill="#047857" />
                            <text x="20" y="22" textAnchor="middle" dy="14" style={{ fontSize: 8, fill: '#047857', fontWeight: 700 }}>A</text>
                            <circle cx="120" cy="22" r="4" fill="#047857" />
                            <text x="120" y="22" textAnchor="middle" dy="14" style={{ fontSize: 8, fill: '#047857', fontWeight: 700 }}>B</text>
                            <circle cx="55" cy="14" r="2" fill="#10B981" />
                            <circle cx="85" cy="14" r="2" fill="#10B981" />
                            <circle cx="55" cy="30" r="2" fill="#10B981" />
                            <circle cx="85" cy="30" r="2" fill="#10B981" />
                          </svg>
                          <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
                            • <strong>2 terminal</strong> (Terminal A & B)<br/>
                            • Bus harus kembali (bolak-balik)<br/>
                            • <strong>Layover ×2</strong> (di kedua terminal)<br/>
                            • 1 cycle = <strong>2 trip</strong> (berangkat + pulang)<br/>
                            • Direction: berangkat & pulang
                          </div>
                          <div style={{ fontSize: 10, color: '#0369A1', marginTop: 4, fontStyle: 'italic' }}>
                            Contoh: TransJakarta koridor lurus, AKAP, feeder
                          </div>
                        </div>
                      </div>

                      {/* Live impact preview */}
                      <div style={{ background: '#FFFFFF', border: '1px dashed #38BDF8', borderRadius: 4, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#0C4A6E', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                          🔮 Preview: Jika Switch ke {altLabel} (config sama)
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', fontSize: 10.5, fontVariantNumeric: 'tabular-nums', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #E0F2FE', color: '#475569' }}>
                                <th style={{ textAlign: 'left', padding: '4px 6px', fontWeight: 600 }}>Metric</th>
                                <th style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 600 }}>{route.tipeRute} (saat ini)</th>
                                <th style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 600, color: '#0C4A6E' }}>{altLabel} (alternatif)</th>
                                <th style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 600, color: '#0369A1' }}>Δ Delta</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { name: 'Cycle Time', curr: m.cycleTime, alt: altM.cycleTime, unit: 'mnt' },
                                { name: 'RTT', curr: m.rtt, alt: altM.rtt, unit: 'mnt' },
                                { name: 'Layover Total', curr: m.layoverTotal, alt: altM.layoverTotal, unit: 'mnt' },
                                { name: 'Headway', curr: m.headway, alt: altM.headway, unit: 'mnt' },
                                { name: 'Trip per Bus', curr: m.tripPerBus, alt: altM.tripPerBus, unit: '' },
                                { name: 'Total Trip', curr: m.totalTrip, alt: altM.totalTrip, unit: '' },
                                { name: 'Total KM', curr: m.totalKm, alt: altM.totalKm, unit: 'km' },
                              ].map((row, i) => {
                                const delta = row.alt - row.curr;
                                const sign = delta > 0 ? '+' : '';
                                return (
                                  <tr key={i} style={{ borderBottom: '1px solid #F0F9FF' }}>
                                    <td style={{ padding: '3px 6px', color: '#1E293B' }}>{row.name}</td>
                                    <td style={{ padding: '3px 6px', textAlign: 'right', color: '#475569' }}>{Number(row.curr).toFixed(row.unit === '' ? 0 : 1)} {row.unit}</td>
                                    <td style={{ padding: '3px 6px', textAlign: 'right', color: '#0C4A6E', fontWeight: 600 }}>{Number(row.alt).toFixed(row.unit === '' ? 0 : 1)} {row.unit}</td>
                                    <td style={{ padding: '3px 6px', textAlign: 'right', color: delta === 0 ? '#94A3B8' : delta > 0 ? '#DC2626' : '#059669', fontWeight: 600 }}>
                                      {Math.abs(delta) < 0.01 ? '—' : `${sign}${Number(delta).toFixed(row.unit === '' ? 0 : 1)}`}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 9.5, color: '#475569', fontStyle: 'italic' }}>
                          {isCurrentPP
                            ? '💡 Switch ke Loop biasanya membuat cycle/headway lebih pendek (×½) karena tidak butuh waktu pulang.'
                            : '💡 Switch ke PP biasanya membuat cycle/headway lebih panjang (×2) karena bus harus pulang ke terminal awal.'}
                        </div>
                      </div>

                      {/* Verification checklist */}
                      <div style={{ marginTop: 10, padding: '7px 10px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 4, fontSize: 10, color: '#9A3412', lineHeight: 1.5 }}>
                        <strong>✓ Pastikan tipe rute sesuai realita di lapangan:</strong>
                        <ul style={{ marginTop: 3, paddingLeft: 14, marginBottom: 0 }}>
                          <li>Halte awal & akhir <strong>lokasi sama?</strong> → pilih <strong>LOOP</strong></li>
                          <li>Halte awal & akhir <strong>berbeda lokasi?</strong> → pilih <strong>PP</strong></li>
                          <li>Salah pilih = headway & cost akan miss-calculate sampai ~50%</li>
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Jumlah Armada</label>
                  <NumInput value={route.armada} onChange={v => updateField('armada', v)} suffix="bus" min={1} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Layover per Terminal</label>
                  <NumInput value={route.layover} onChange={v => updateField('layover', v)} suffix="mnt" />
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                    {route.tipeRute === 'PP' ? 'PP: ×2 (di kedua terminal)' : 'Loop: ×1 (kembali ke titik awal)'}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Jam Operasi/Hari <span style={{ color: '#A16207' }} title="Auto-computed dari periode aktif">(auto)</span></label>
                  <div style={{
                    width: '100%', padding: '7px 10px',
                    border: `1px solid ${TOKENS.border}`, borderRadius: 6,
                    fontSize: 13, fontVariantNumeric: 'tabular-nums', color: TOKENS.textPrimary,
                    background: TOKENS.surfaceMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontWeight: 600 }}>{fmtJamMenit(route.jamOps)}</span>
                    <span style={{ fontSize: 10.5, color: TOKENS.textMuted, fontStyle: 'italic' }}>
                      dari {(route.periode || []).filter(p => p.on && p.kategori !== 'Tutup' && (Number(route.armada) || 0) > 0).length} periode aktif
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: TOKENS.textMuted, marginTop: 4, fontStyle: 'italic' }}>
                    Atur periode di drawer <strong>Periode Operasi</strong>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Nama Rute</label>
                  <TextInput value={route.nama} onChange={v => updateField('nama', v)} />
                </div>
              </div>
            </div>
          </Section>

          <div className="mt-4">
            <Section title="Hasil Perhitungan Otomatis" icon={Activity}>
              <Row label="Jarak per Arah" value={fmtNum(m.jarakPerArah, 2)} unit="km" />
              <Row label={`Jarak per Cycle (${m.isPP ? 'PP' : 'Loop'})`} value={fmtNum(m.jarakPerCycle, 2)} unit="km" />
              <Row label="Total Travel Time" value={fmtNum(m.travelTime, 0)} unit="mnt" />
              <Row label="Total Dwell Time" value={fmtNum(m.totalDwell, 1)} unit="mnt" />
              <Row label="Service Time per Arah" value={fmtDurMin(m.serviceTime)} unit="" />
              <Row label={`Round Trip Time (RTT) ${m.isPP ? '×2' : ''}`} value={fmtNum(m.rtt, 1)} unit="mnt" />
              <Row label={`Layover Total ${m.isPP ? `(${m.layoverInput}×2 terminal)` : '(Loop ×1)'}`} value={fmtDurMin(m.layoverTotal)} unit="" />
              <Row label="Cycle Time (RTT + Layover Total)" value={fmtDurMin(m.cycleTime)} unit="" />
              <Row label="Cycle per Bus per Hari" value={m.cyclePerBus} unit="cycle" tone="muted" />
              <Row label={`Trip per Bus (${m.isPP ? '1-arah' : '1-loop'})`} value={m.tripPerBus} unit="trip" />
              <Row label="Total Trip per Hari" value={m.totalTrip} unit="trip" />
              <Row label="Total km/Hari" value={fmtNum(m.totalKm, 1)} unit="km" />
              <Row label="Spasi antar Halte" value={fmtNum(m.spasiHalte, 2)} unit="km" tone="muted" />
              <Row label="% Layover dari RTT" value={fmtPct(m.layoverPct)} tone={m.layoverPct > 0.3 ? 'warn' : (m.layoverPct < 0.10 ? 'warn' : 'default')} />
              <Row label="% Dwell dari Cycle" value={fmtPct(m.dwellPct)} tone={m.dwellPct > 0.2 ? 'warn' : 'default'} />
            </Section>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="col-span-7">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <KpiCard label="Headway" value={fmtNum(m.headway, 1)} unit="mnt" status={m.statusHeadway} icon={Clock} accent="cyan" />
            <KpiCard label="Frekuensi" value={fmtNum(m.freqPerJam, 1)} unit="bus/jam" status={m.statusFrekuensi} icon={Activity} accent="emerald" />
            <KpiCard label="Kec. Komersial" value={fmtNum(m.kecKomersial, 1)} unit="km/jam" status={m.statusKecepatan} icon={Gauge} accent="violet" />
          </div>

          <Section
            title={`Tabel Halte (${route.halte.length} titik)`}
            icon={MapPin}
            action={<Btn icon={Plus} size="sm" onClick={addHalte}>Tambah Halte</Btn>}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-200">
                    <th className="text-left py-1.5 px-2 font-mono">No</th>
                    <th className="text-left py-1.5 px-2 font-mono">Nama Titik Henti</th>
                    <th className="text-right py-1.5 px-2 font-mono">Jarak Kum (km)</th>
                    <th className="text-right py-1.5 px-2 font-mono">Travel (mnt)</th>
                    <th className="text-right py-1.5 px-2 font-mono">Dwell (mnt)</th>
                    <th className="text-right py-1.5 px-2 font-mono">Service</th>
                    <th className="text-right py-1.5 px-2 font-mono">Tiba Kum</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {route.halte.map((h, idx) => {
                    const cum = route.halte.slice(0, idx + 1).reduce((s, hh) => s + (Number(hh.travelOverride) || 0) + (Number(hh.dwell) || 0), 0);
                    const isTerminal = idx === 0 || idx === route.halte.length - 1;
                    return (
                      <tr key={h.id} className="border-b border-zinc-200 hover:bg-zinc-100/40">
                        <td className="py-1 px-2 font-mono text-zinc-500">{idx + 1}</td>
                        <td className="py-1 px-1">
                          <input
                            value={h.nama}
                            onChange={(e) => updateHalte(h.id, 'nama', e.target.value)}
                            className={`w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-emerald-700 px-1.5 py-1 rounded text-xs ${isTerminal ? 'text-emerald-700 font-medium' : 'text-zinc-800'} focus:outline-none`}
                          />
                        </td>
                        <td className="py-1 px-1">
                          <input
                            type="number"
                            step="0.1"
                            value={h.jarakKum}
                            onChange={(e) => updateHalte(h.id, 'jarakKum', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-emerald-700 px-1 py-1 rounded text-xs text-right font-mono text-zinc-800 focus:outline-none"
                          />
                        </td>
                        <td className="py-1 px-1">
                          <input
                            type="number"
                            step="0.5"
                            value={h.travelOverride}
                            onChange={(e) => updateHalte(h.id, 'travelOverride', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-emerald-700 px-1 py-1 rounded text-xs text-right font-mono text-zinc-800 focus:outline-none"
                          />
                        </td>
                        <td className="py-1 px-1">
                          <input
                            type="number"
                            step="0.1"
                            value={h.dwell}
                            onChange={(e) => updateHalte(h.id, 'dwell', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-emerald-700 px-1 py-1 rounded text-xs text-right font-mono text-zinc-800 focus:outline-none"
                          />
                        </td>
                        <td className="py-1 px-2 text-right font-mono text-xs text-zinc-500">{fmtNum((Number(h.travelOverride) || 0) + (Number(h.dwell) || 0), 1)}</td>
                        <td className="py-1 px-2 text-right font-mono text-xs text-emerald-700">{fmtNum(cum, 1)}</td>
                        <td className="py-1 px-1">
                          {!isTerminal && (
                            <button
                              onClick={() => removeHalte(h.id)}
                              className="text-zinc-400 hover:text-rose-700 transition-colors p-1"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-[10px] text-zinc-500 font-mono">
              💡 Travel Override = waktu jalan murni dari halte sebelumnya ke halte ini. Dwell = waktu berhenti di halte ini.
            </div>
          </Section>

          <div className="mt-4">
            <PeringatanOtomatis metrics={m} route={route} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PeringatanOtomatis({ metrics: m, route }) {
  const checks = [
    {
      ok: m.headway <= 20,
      msgOk: `Headway sehat (${fmtNum(m.headway, 1)} mnt)`,
      msgWarn: `Headway terlalu lama (${fmtNum(m.headway, 1)} mnt) — tambah armada`,
    },
    {
      ok: m.layoverPct <= 0.30,
      msgOk: `Rasio layover sehat (${fmtPct(m.layoverPct)})`,
      msgWarn: `Layover ${fmtPct(m.layoverPct)} dari RTT — boros, bus banyak menganggur`,
    },
    {
      ok: m.layoverPct >= 0.10,
      msgOk: `Recovery time cukup (${fmtPct(m.layoverPct)} dari RTT)`,
      msgWarn: `Layover hanya ${fmtPct(m.layoverPct)} dari RTT — tidak cukup utk recovery & toilet break (target ≥10%)`,
    },
    {
      ok: m.kecKomersial >= 18,
      msgOk: `Kecepatan komersial wajar (${fmtNum(m.kecKomersial, 1)} km/jam)`,
      msgWarn: `Kecepatan komersial lambat (${fmtNum(m.kecKomersial, 1)} km/jam) — review dwell/travel`,
    },
    {
      ok: m.dwellPct <= 0.20,
      msgOk: `Utilisasi dwell sehat (${fmtPct(m.dwellPct)})`,
      msgWarn: `${fmtPct(m.dwellPct)} cycle dihabiskan di halte — pertimbangkan boarding cepat`,
    },
    {
      ok: route.armada >= 2,
      msgOk: `Jumlah armada cukup (${route.armada} bus)`,
      msgWarn: `Hanya ${route.armada} armada — risiko layanan terhenti saat 1 bus rusak`,
    },
  ];
  const warns = checks.filter(c => !c.ok);
  return (
    <Section title={`Peringatan Otomatis (${warns.length} dari ${checks.length} cek)`} icon={AlertTriangle}>
      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <div key={i} className={`flex items-start gap-2 text-xs py-1 px-2 rounded ${c.ok ? 'bg-emerald-500/5' : 'bg-amber-500/10'}`}>
            {c.ok ? <CheckCircle2 size={14} className="text-emerald-700 flex-shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="text-amber-700 flex-shrink-0 mt-0.5" />}
            <span className={c.ok ? 'text-zinc-700' : 'text-amber-200'}>{c.ok ? c.msgOk : c.msgWarn}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TabSensitivitas({ route }) {
  const data = useMemo(() => calcSensitivity(route), [route]);
  const m = useMemo(() => calcMetrics(route), [route]);
  const [targetHeadway, setTargetHeadway] = useState(10);
  const cycleTime = m.cycleTime;
  const armadaButuh = targetHeadway > 0 ? Math.ceil(cycleTime / targetHeadway) : 0;
  const headwayActual = armadaButuh > 0 ? cycleTime / armadaButuh : 0;
  const selisih = armadaButuh - route.armada;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-7">
        <Section title="Kurva Sensitivitas: Headway vs Jumlah Armada" icon={TrendingDown}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#E4E4E7" strokeDasharray="3 3" />
                <XAxis dataKey="armada" stroke="#71717A" tick={{ fontSize: 11, fontFamily: 'monospace' }} label={{ value: 'Jumlah Armada', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#047857" tick={{ fontSize: 11, fontFamily: 'monospace' }} label={{ value: 'Headway (mnt)', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11, fontFamily: 'monospace' }} label={{ value: 'Frek (bus/jam)', angle: 90, position: 'insideRight', fill: '#10b981', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #D4D4D8', borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="headway" fill="#047857" name="Headway (mnt)" opacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="frekuensi" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Frekuensi (bus/jam)" />
                <ReferenceLine yAxisId="left" x={route.armada} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Aktual: ${route.armada}`, fill: '#f59e0b', fontSize: 11 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <div className="mt-4">
          <Section title="Tabel Sensitivitas Lengkap" icon={Activity}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="text-left py-1.5 px-2 font-mono">Armada</th>
                  <th className="text-right py-1.5 px-2 font-mono">Headway (mnt)</th>
                  <th className="text-right py-1.5 px-2 font-mono">Freq (/jam)</th>
                  <th className="text-left py-1.5 px-2 font-mono">Kategori Layanan</th>
                </tr>
              </thead>
              <tbody>
                {data.map(r => {
                  const status = bandStatus(r.headway, BENCHMARK.headway);
                  const isCurrent = r.armada === route.armada;
                  const isRecommended = r.armada === armadaButuh;
                  return (
                    <tr key={r.armada} className={`border-b border-zinc-200 ${isCurrent ? 'bg-amber-500/10' : isRecommended ? 'bg-emerald-50' : ''} hover:bg-zinc-100/40`}>
                      <td className="py-1 px-2 font-mono text-zinc-700">
                        {r.armada} {isCurrent && <span className="text-amber-700 ml-1">←aktual</span>} {isRecommended && !isCurrent && <span className="text-emerald-700 ml-1">←rekomendasi</span>}
                      </td>
                      <td className="py-1 px-2 text-right font-mono text-zinc-800">{r.headway}</td>
                      <td className="py-1 px-2 text-right font-mono text-zinc-800">{r.frekuensi}</td>
                      <td className="py-1 px-2"><StatusPill band={status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>
        </div>
      </div>

      <div className="col-span-5">
        <Section title="Rekomendasi Armada Otomatis" icon={Bus}>
          <div className="mb-4">
            <label className="text-xs text-zinc-500 mb-1 block">Target Headway yang Diinginkan</label>
            <NumInput value={targetHeadway} onChange={setTargetHeadway} suffix="mnt" />
          </div>
          <div className="space-y-3 mt-4">
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded">
              <div className="text-[10px] uppercase text-emerald-700 font-mono mb-1">Armada yang dibutuhkan</div>
              <div className="text-3xl font-bold text-emerald-700 font-mono">{armadaButuh}<span className="text-sm text-emerald-700/70 ml-1">unit bus</span></div>
              <div className="text-xs text-zinc-500 mt-1">
                {selisih > 0 && <span className="text-amber-700">⚠ Tambah {selisih} bus dari kondisi sekarang ({route.armada} bus)</span>}
                {selisih === 0 && <span className="text-emerald-700">✅ Armada saat ini sudah pas</span>}
                {selisih < 0 && <span className="text-emerald-700">✅ Bisa kurangi {Math.abs(selisih)} bus dan masih capai target</span>}
              </div>
            </div>
            <div className="p-3 bg-zinc-100/60 rounded">
              <div className="text-[10px] uppercase text-zinc-500 font-mono mb-1">Headway Aktual dengan rekomendasi</div>
              <div className="text-xl font-mono text-zinc-800">{fmtNum(headwayActual, 1)} <span className="text-xs text-zinc-500">mnt</span></div>
              <div className="text-xs text-zinc-500 mt-1">
                Selisih dari target: {fmtNum(headwayActual - targetHeadway, 1)} mnt
              </div>
            </div>
            <div className="p-3 bg-zinc-100/60 rounded text-xs space-y-1">
              <div className="text-zinc-500">Cycle Time saat ini: <span className="font-mono text-zinc-800">{fmtDurMin(cycleTime)}</span></div>
              <div className="text-zinc-500">Rumus: ⌈Cycle ÷ Target Headway⌉</div>
              <div className="text-zinc-500 font-mono">= ⌈{fmtDurMin(cycleTime)} ÷ {targetHeadway}m⌉ = {armadaButuh}</div>
            </div>
          </div>
        </Section>

        <div className="mt-4">
          <Section title="Rumus Inti Headway" icon={Settings}>
            <div className="space-y-2 text-xs">
              {[
                ['Service Time', '= Travel Time + Dwell Time'],
                ['RTT (Loop)', '= Service Time'],
                ['RTT (PP)', '= Service Time × 2'],
                ['Layover Total', '= Layover input × (PP: 2, Loop: 1)'],
                ['Cycle Time', '= RTT + Layover Total'],
                ['HEADWAY', '= Cycle Time ÷ Jumlah Armada'],
                ['Frekuensi', '= 60 ÷ Headway'],
                ['Kec. Komersial', '= Jarak ÷ (Service Time ÷ 60)'],
                ['Cycle per Bus', '= ⌊Jam Ops × 60 ÷ Cycle⌋'],
                ['Trip per Bus', '= Cycle/Bus × (PP: 2, Loop: 1)'],
                ['Total km', '= Trip × Jarak per Arah'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-zinc-200">
                  <span className="text-zinc-500">{k}</span>
                  <span className="font-mono text-emerald-700">{v}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB KEBIJAKAN OPERASI — Periode + Sisipan Armada + Status Operasi per Bus
// Filosofi: Observasi → Preview Dampak → Edit
// ============================================================================

// ═══════════════════════════════════════════════════════════════════════════
// TAB DISRUPTION SIMULATOR — What-if analysis untuk operational disruption
// • Armada Reduction: simulasi bus breakdown / driver shortage
// • Cycle Time Increase: simulasi traffic congestion / detour
// • Headway Target: simulasi policy change atau demand surge response
// ═══════════════════════════════════════════════════════════════════════════
function TabDisruption({ route, updateRoute, setOpenDrawer }) {
  const [scenarioType, setScenarioType] = useState('armada-reduction');
  const [busesAffected, setBusesAffected] = useState(1);
  const [cycleIncreasePct, setCycleIncreasePct] = useState(20);
  const [targetHeadway, setTargetHeadway] = useState(8);

  const m = useMemo(() => calcMetrics(route), [route]);
  const scenario = { type: scenarioType, busesAffected, cycleIncreasePct, targetHeadway };
  const impact = useMemo(() => calcDisruptionImpact(route, m, scenario), [route, m, scenarioType, busesAffected, cycleIncreasePct, targetHeadway]);

  const fmtDelta = (v, unit) => {
    if (Math.abs(v) < 0.01) return '— tetap';
    const sign = v > 0 ? '+' : '';
    return `${sign}${v.toFixed(2)}${unit ? ' ' + unit : ''}`;
  };
  const deltaColor = (v, lowerIsBetter = true) => {
    if (Math.abs(v) < 0.01) return '#71717A';
    const isBetter = lowerIsBetter ? v < 0 : v > 0;
    return isBetter ? '#059669' : '#DC2626';
  };

  return (
    <div className="space-y-4">
      <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '12px 14px' }}>
        <div style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.5 }}>
          <strong>🔥 Disruption Scenario Simulator</strong> — What-if analysis tools untuk anticipate operational disruptions: bus breakdown, traffic delay, demand surge. Simulasi tidak mengubah konfigurasi rute aktual — hanya preview dampaknya.
        </div>
      </div>

      {/* Scenario Type Selector */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Pilih Skenario Disruption
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { key: 'armada-reduction', label: '🚌 Bus Breakdown', desc: 'Armada berkurang sementara (breakdown, maintenance)' },
            { key: 'cycle-increase',   label: '🚦 Traffic / Detour', desc: 'Cycle time meningkat (kemacetan, jalan ditutup)' },
            { key: 'headway-target',   label: '⏱️ Demand Surge', desc: 'Butuh headway lebih pendek (acara khusus, peak demand)' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setScenarioType(s.key)}
              style={{
                padding: '10px 12px', fontSize: 12,
                background: scenarioType === s.key ? '#FEE2E2' : '#FFFFFF',
                border: `1px solid ${scenarioType === s.key ? '#FCA5A5' : '#E4E4E7'}`,
                borderRadius: 6, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 700, color: scenarioType === s.key ? '#991B1B' : '#18181B', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10.5, color: '#71717A', lineHeight: 1.4 }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Parameters */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Parameter Skenario
        </div>

        {scenarioType === 'armada-reduction' && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', display: 'block', marginBottom: 4 }}>
              Jumlah Bus Terkena Dampak
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={route.armada}
                value={busesAffected}
                onChange={e => setBusesAffected(Math.min(route.armada, Math.max(1, Number(e.target.value) || 1)))}
                style={{ width: 80, padding: '7px 10px', fontSize: 14, fontWeight: 600, border: '1px solid #D4D4D8', borderRadius: 6, fontVariantNumeric: 'tabular-nums', outline: 'none' }}
              />
              <span style={{ fontSize: 12, color: '#52525B' }}>dari {route.armada} bus aktual</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#71717A', marginTop: 4 }}>
              Skenario: bus rusak, in-service maintenance, atau driver no-show. Sisa armada: <strong>{route.armada - busesAffected}</strong> bus.
            </div>
          </div>
        )}

        {scenarioType === 'cycle-increase' && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', display: 'block', marginBottom: 4 }}>
              Persentase Peningkatan Travel Time
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                value={cycleIncreasePct}
                onChange={e => setCycleIncreasePct(Math.max(0, Number(e.target.value) || 0))}
                style={{ width: 80, padding: '7px 10px', fontSize: 14, fontWeight: 600, border: '1px solid #D4D4D8', borderRadius: 6, fontVariantNumeric: 'tabular-nums', outline: 'none' }}
              />
              <span style={{ fontSize: 12, color: '#52525B' }}>% (e.g., 20 = travel time +20%)</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#71717A', marginTop: 4 }}>
              Skenario: kemacetan, demonstrasi, jalan rusak, detour. Travel time per halte naik {cycleIncreasePct}%.
            </div>
          </div>
        )}

        {scenarioType === 'headway-target' && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', display: 'block', marginBottom: 4 }}>
              Target Headway Baru (menit)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                step="0.5"
                value={targetHeadway}
                onChange={e => setTargetHeadway(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: 80, padding: '7px 10px', fontSize: 14, fontWeight: 600, border: '1px solid #D4D4D8', borderRadius: 6, fontVariantNumeric: 'tabular-nums', outline: 'none' }}
              />
              <span style={{ fontSize: 12, color: '#52525B' }}>menit (saat ini: {m.headway.toFixed(1)} mnt)</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#71717A', marginTop: 4 }}>
              Skenario: acara konser, hari libur nasional, demand surge. App akan hitung armada minimum yang dibutuhkan.
            </div>
          </div>
        )}
      </div>

      {/* Impact Analysis */}
      <div style={{ background: '#FFFFFF', border: '2px solid #DC2626', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ background: '#FEE2E2', padding: '10px 14px', borderBottom: '1px solid #FCA5A5' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            🔥 Dampak Disruption: {impact.label}
          </span>
        </div>

        <table className="w-full" style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAFAFA', color: '#52525B' }}>
              <th className="text-left py-2 px-3" style={{ fontWeight: 600 }}>Metric</th>
              <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Baseline</th>
              <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Disruption</th>
              <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Δ Delta</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Headway',    base: impact.base.headway,    new: impact.new.headway,    unit: 'mnt', lowerBetter: true },
              { name: 'Frekuensi',  base: impact.base.freqPerJam, new: impact.new.freqPerJam, unit: 'bus/jam', lowerBetter: false },
              { name: 'Cycle Time', base: impact.base.cycleTime,  new: impact.new.cycleTime,  unit: 'mnt', lowerBetter: true },
              { name: 'Trip per Bus', base: impact.base.tripPerBus, new: impact.new.tripPerBus, unit: 'trip', lowerBetter: false },
              { name: 'Total Trip Harian', base: impact.base.totalTrip, new: impact.new.totalTrip, unit: 'trip', lowerBetter: false },
              { name: 'Total KM Harian', base: impact.base.totalKm, new: impact.new.totalKm, unit: 'km', lowerBetter: false },
              { name: 'Kec. Komersial', base: impact.base.kecKomersial, new: impact.new.kecKomersial, unit: 'km/jam', lowerBetter: false },
            ].map((row, i) => {
              const delta = row.new - row.base;
              return (
                <tr key={i} style={{ borderTop: '1px solid #F4F4F5' }}>
                  <td className="py-2 px-3" style={{ fontWeight: 500 }}>{row.name}</td>
                  <td className="py-2 px-3 text-right" style={{ color: '#52525B' }}>{row.base.toFixed(2)} <span style={{ fontSize: 10, color: '#A1A1AA' }}>{row.unit}</span></td>
                  <td className="py-2 px-3 text-right" style={{ color: '#18181B', fontWeight: 600 }}>{row.new.toFixed(2)} <span style={{ fontSize: 10, color: '#A1A1AA' }}>{row.unit}</span></td>
                  <td className="py-2 px-3 text-right" style={{ color: deltaColor(delta, row.lowerBetter), fontWeight: 600 }}>
                    {fmtDelta(delta, row.unit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Special: required armada for target headway */}
        {scenarioType === 'headway-target' && impact.requiredArmada !== null && (
          <div style={{ padding: '14px 16px', background: '#FFFBEB', borderTop: '1px solid #FDE68A' }}>
            <div style={{ fontSize: 12, color: '#92400E' }}>
              <strong>📊 Armada yang Dibutuhkan untuk Headway {targetHeadway} mnt:</strong>
              <span style={{ display: 'block', marginTop: 4, fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
                Required = ⌈Cycle ÷ Target Headway⌉ = ⌈{impact.new.cycleTime.toFixed(1)} ÷ {targetHeadway}⌉ = <strong style={{ fontSize: 14, color: '#7F1D1D' }}>{impact.requiredArmada}</strong> bus
              </span>
              <div style={{ marginTop: 6, fontSize: 11.5 }}>
                {impact.requiredArmada > route.armada
                  ? <>⚠ Armada saat ini ({route.armada}) <strong>kurang {impact.requiredArmada - route.armada} bus</strong>. Gunakan Sisipan armada untuk top-up sementara.</>
                  : impact.requiredArmada === route.armada
                  ? <>✓ Armada saat ini ({route.armada}) tepat untuk target headway.</>
                  : <>✓ Armada saat ini ({route.armada}) sudah cukup, bahkan ada spare {route.armada - impact.requiredArmada} bus.</>
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* APPLY SCENARIO TO ROUTE — closes feedback loop from simulator to scheduler */}
      {updateRoute && (
        <div style={{ background: '#FFF7ED', border: '2px dashed #FB923C', borderRadius: 8, padding: '12px 14px' }}>
          <div className="flex items-baseline gap-2 flex-wrap" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9A3412' }}>🛠️ Apply Skenario ke Route (Live Mode)</span>
            <span style={{ fontSize: 10.5, color: '#9A3412', fontStyle: 'italic' }}>Konversi what-if jadi konfigurasi aktual</span>
          </div>
          <div style={{ fontSize: 11, color: '#7C2D12', lineHeight: 1.5, marginBottom: 8 }}>
            {scenarioType === 'armada-reduction' && (
              <>Akan auto-create <strong>busStatusEvent</strong> dengan status "OFF" untuk {busesAffected} bus, durasi 60 menit dari sekarang. Schedule otomatis re-generate (dinamis mode).</>
            )}
            {scenarioType === 'cycle-increase' && (
              <>Akan update <strong>travelOverride</strong> di semua halte (×{(1 + cycleIncreasePct/100).toFixed(2)}). Cycle time naik permanen sampai diundo manual.</>
            )}
            {scenarioType === 'headway-target' && (
              <>Akan auto-create <strong>sisipanArmada</strong> dengan customHeadway = {targetHeadway} mnt, time-range full ops (06:00-22:00). Boleh edit time-range setelah apply.</>
            )}
          </div>
          <button
            onClick={() => {
              if (scenarioType === 'armada-reduction') {
                // Create busStatusEvents for first N buses
                const nowMin = (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); })();
                const newEvents = Array.from({ length: busesAffected }, (_, i) => ({
                  id: `BREAKDOWN-${Date.now()}-${i}`,
                  busId: i + 1,
                  status: 'off', // BUG FIX: harus lowercase agar match STATUS_OPS keys
                  startMin: nowMin,
                  endMin: Math.min(24 * 60 - 1, nowMin + 60),
                  catatan: `Breakdown simulation (Disruption Sim)`,
                }));
                updateRoute({
                  ...route,
                  busStatusEvents: [...(route.busStatusEvents || []), ...newEvents],
                });
                if (setOpenDrawer) setOpenDrawer('status');
              } else if (scenarioType === 'cycle-increase') {
                const factor = 1 + cycleIncreasePct / 100;
                const newHalte = route.halte.map(h => ({
                  ...h,
                  travelOverride: (Number(h.travelOverride) || 0) * factor,
                }));
                updateRoute({ ...route, halte: newHalte });
                if (setOpenDrawer) setOpenDrawer('rute');
              } else if (scenarioType === 'headway-target') {
                const newSisipan = {
                  id: `DEMAND-SURGE-${Date.now()}`,
                  startMin: 6 * 60,
                  endMin: 22 * 60,
                  deltaArmada: 0,
                  customHeadway: targetHeadway,
                  catatan: `Demand surge: target headway ${targetHeadway}m (Disruption Sim)`,
                };
                updateRoute({
                  ...route,
                  sisipanArmada: [...(route.sisipanArmada || []), newSisipan],
                });
                if (setOpenDrawer) setOpenDrawer('sisipan');
              }
            }}
            style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 700,
              background: '#EA580C', color: '#FFFFFF',
              border: 'none', borderRadius: 5, cursor: 'pointer',
            }}
          >
            ⚡ Apply Skenario ke Route
          </button>
          <span style={{ fontSize: 10.5, color: '#9A3412', marginLeft: 10, fontStyle: 'italic' }}>
            (Setelah apply, drawer setup akan terbuka untuk review)
          </span>
        </div>
      )}

      {/* Recommendations */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', marginBottom: 6 }}>
          💡 Mitigation Strategy (Senior Engineer Advice)
        </div>
        <div style={{ fontSize: 11.5, color: '#1E40AF', lineHeight: 1.5 }}>
          {scenarioType === 'armada-reduction' && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Aktifkan <strong>spare bus dari pool</strong> sebagai cadangan langsung.</li>
              <li>Komunikasikan ke penumpang via PIS (Passenger Information System) tentang headway extended.</li>
              <li>Pantau dispatcher control: jaga jangan sampai bunching saat sisa bus diparkir.</li>
              <li>Bila reduction berlanjut &gt; 1 jam, gunakan <strong>Sisipan armada</strong> untuk inject bus dari rute lain.</li>
            </ul>
          )}
          {scenarioType === 'cycle-increase' && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Set "headway extended" untuk match new cycle. Jangan paksa headway lama dengan armada terbatas.</li>
              <li>Gunakan <strong>Sisipan armada +1 atau +2</strong> untuk mempertahankan headway target.</li>
              <li>Monitor on-time performance — recovery time meningkat untuk stabilize schedule.</li>
              <li>Jika detour permanent, update <strong>travelOverride</strong> di halte yang affected.</li>
            </ul>
          )}
          {scenarioType === 'headway-target' && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Gunakan <strong>Sisipan armada time-range</strong> dengan custom headway untuk window peak demand.</li>
              <li>Bila armada tidak cukup ({impact.requiredArmada > route.armada ? '+' + (impact.requiredArmada - route.armada) + ' bus dibutuhkan' : 'sudah cukup'}): pinjam dari rute lain atau aktifkan armada cadangan.</li>
              <li>Pertimbangkan <strong>express service</strong>: skip beberapa halte untuk reduce service time.</li>
              <li>Coordinate dengan pengaturan signal lalu lintas (priority signal) untuk speed up bus.</li>
            </ul>
          )}
        </div>
      </div>

      {/* Educational footer */}
      <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 6, padding: '10px 14px', fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
        <strong style={{ color: '#1E293B' }}>📐 Cara perhitungan:</strong> Disruption simulator menerapkan transformasi pada konfigurasi rute, lalu re-run formula <code style={{ background: '#E2E8F0', padding: '1px 4px', borderRadius: 2 }}>calcMetrics()</code> untuk hitung metrics baru. Angka yang ditampilkan adalah hasil hitung ulang, bukan estimasi heuristik. Konfigurasi asli rute TIDAK berubah.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB WAWASAN & STANDAR — Engineering audit + educational reference
// Comprehensive engineering dashboard:
// • A: Self-Audit Compliance (auto-check current route vs standards)
// • B: Capacity & Demand input + Load Factor analysis (TCQSM Method)
// • C: KPI Breakdown with formulas (educational)
// • D: Standards Reference (Indonesia + International citations)
// • E: Glossary (transit terminology)
// ═══════════════════════════════════════════════════════════════════════════
function TabWawasan({ route, updateRoute }) {
  const [section, setSection] = useState('audit'); // 'audit' | 'kapasitas' | 'kpi' | 'standar' | 'glosarium'
  const m = useMemo(() => calcMetrics(route), [route]);
  const sched = useMemo(() => generateSchedule(route, m), [route, m]);
  const buses = useMemo(() => generateBusUtilization(sched, route, m), [sched, route, m]);

  // Compute compliance metrics
  const lf = calcLoadFactor(route.armada, m.headway, route.kapasitasBus || 80, Number(route.demandPHPDV) || 0);
  const lfClass = loadFactorClass(lf.lf);
  const driverCheck = checkDriverShifts(buses);
  const headwayCV = calcHeadwayCV(sched.ritGroups);
  const totalServiceHours = buses.reduce((s, b) => s + (b.activeMin || 0) / 60, 0);

  // Compliance scoring
  const checks = [
    {
      key: 'speed',
      label: 'Kecepatan Komersial',
      status: m.kecKomersial >= 25 ? 'pass' : m.kecKomersial >= 18 ? 'warn' : 'fail',
      value: `${m.kecKomersial.toFixed(1)} km/jam`,
      target: '≥ 25 km/jam (BAIK), ≥ 18 km/jam (STANDAR)',
      reference: 'TCQSM Exhibit 6-43 (BRT urban)',
      explanation: m.kecKomersial >= 25
        ? 'Kecepatan optimal untuk BRT urban — menunjukkan dedicated lane bekerja baik.'
        : m.kecKomersial >= 18
        ? 'Kecepatan moderate — review apakah ada delay halte atau traffic light.'
        : 'KECEPATAN RENDAH — investigate dwell time, traffic congestion, atau jarak halte terlalu rapat.',
    },
    {
      key: 'headway',
      label: 'Headway Statis',
      status: m.headway <= 10 ? 'pass' : m.headway <= 20 ? 'warn' : 'fail',
      value: `${m.headway.toFixed(2)} menit`,
      target: '≤ 10 menit (BAIK SPM), ≤ 20 menit (STANDAR SPM)',
      reference: 'Permenhub 27/2015 Standar Pelayanan Minimum',
      explanation: m.headway <= 10
        ? 'Frekuensi tinggi — sesuai standar BAIK untuk angkutan massal urban.'
        : m.headway <= 20
        ? 'Frekuensi cukup — masih dalam standar minimum, tapi bisa ditingkatkan.'
        : 'FREKUENSI TERLALU RENDAH — penumpang menunggu lama, tambah armada atau kurangi cycle.',
    },
    {
      key: 'driverShift',
      label: 'Compliance Jam Kerja Sopir',
      status: driverCheck.compliant ? 'pass' : 'fail',
      value: driverCheck.compliant
        ? `Semua ${driverCheck.activeCount} bus compliant`
        : `${driverCheck.violations.length} dari ${driverCheck.activeCount} bus melanggar`,
      target: 'Maks 8 jam/hari (Permenhub 79/2013) + 4 jam continuous (ILO C153)',
      reference: 'Permenhub 79/2013 + ILO C153 + UU 13/2003',
      explanation: driverCheck.compliant
        ? 'Operasi dapat dilakukan dengan 1 shift sopir per bus.'
        : 'BUTUH 2 SHIFT SOPIR — operasi >8 jam memerlukan rotasi sopir untuk compliance.',
      detail: driverCheck.violations,
    },
    {
      key: 'loadFactor',
      label: 'Load Factor (Service Quality)',
      status: route.demandPHPDV > 0
        ? (lf.lf <= 0.85 ? 'pass' : lf.lf <= 1.0 ? 'warn' : 'fail')
        : 'unset',
      value: route.demandPHPDV > 0 ? `${(lf.lf * 100).toFixed(0)}% — Class ${lfClass.class} (${lfClass.label})` : 'Demand belum di-set',
      target: 'Class A-C (LF ≤ 1.0) untuk passenger comfort',
      reference: 'TCQSM Exhibit 4-7 (Service Quality Class)',
      explanation: route.demandPHPDV > 0
        ? lfClass.desc
        : 'Set demandPHPDV (Peak Hour Peak Direction Volume) di tab "Kapasitas & Demand" untuk analisis ini.',
    },
    {
      key: 'reliability',
      label: 'Headway Reliability (CV)',
      status: headwayCV.cv <= 0.20 ? 'pass' : headwayCV.cv <= 0.35 ? 'warn' : 'fail',
      value: `CV = ${(headwayCV.cv * 100).toFixed(1)}% (${headwayCV.count} groups)`,
      target: 'CV ≤ 20% (excellent), ≤ 35% (acceptable)',
      reference: 'TCQSM Exhibit 4-9 (Service Frequency Reliability)',
      explanation: headwayCV.cv <= 0.20
        ? 'Headway konsisten antar periode — pelayanan reliable.'
        : headwayCV.cv <= 0.35
        ? 'Variasi headway moderate — masih dapat diterima penumpang.'
        : 'VARIASI HEADWAY TINGGI — penumpang sulit memprediksi, signal untuk smooth transition.',
    },
    {
      key: 'busUtilization',
      label: 'Bus Utilization',
      status: 'info',
      value: `Avg ${buses.length > 0 ? Math.round(buses.reduce((s, b) => s + (b.utilizationPct || 0) * 100, 0) / buses.length) : 0}%`,
      target: '≥ 75% target produktivitas',
      reference: 'APTA Best Practice',
      explanation: 'Persentase waktu bus aktif beroperasi (productive time / total operating window).',
    },
  ];

  const passedChecks = checks.filter(c => c.status === 'pass').length;
  const totalChecks = checks.filter(c => c.status !== 'unset' && c.status !== 'info').length;

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="inline-flex flex-wrap items-center gap-1" style={{ background: TOKENS.surfaceMuted, border: `1px solid ${TOKENS.border}`, borderRadius: 6, padding: 3 }}>
        {[
          { key: 'audit',     label: '🔍 Audit Kepatuhan' },
          { key: 'audit-trip', label: '🎯 Audit Trip' },
          { key: 'demand',    label: '👥 Demand Profile' },
          { key: 'fleet',     label: '🚌 Fleet & Recovery' },
          { key: 'kpi',       label: '📐 Rumus KPI' },
          { key: 'standar',   label: '📚 Standar' },
          { key: 'glosarium', label: 'ℹ️ Glosarium' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSection(tab.key)}
            style={{
              padding: '5px 12px', fontSize: 12, fontWeight: section === tab.key ? 600 : 500,
              background: section === tab.key ? TOKENS.surface : 'transparent',
              color: section === tab.key ? TOKENS.brand : TOKENS.textMuted,
              border: 'none', borderRadius: 4, cursor: 'pointer',
              boxShadow: section === tab.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ─── A. AUDIT KEPATUHAN ─── */}
      {section === 'audit' && (
        <div className="space-y-4">
          {/* Summary Banner */}
          <div style={{
            background: passedChecks === totalChecks ? '#ECFDF5' : passedChecks >= totalChecks * 0.6 ? '#FFFBEB' : '#FEF2F2',
            border: `1px solid ${passedChecks === totalChecks ? '#6EE7B7' : passedChecks >= totalChecks * 0.6 ? '#FCD34D' : '#FCA5A5'}`,
            borderRadius: 8, padding: '14px 18px',
          }}>
            <div className="flex items-baseline gap-3 flex-wrap">
              <div style={{ fontSize: 22, fontWeight: 700, color: passedChecks === totalChecks ? '#065F46' : passedChecks >= totalChecks * 0.6 ? '#92400E' : '#991B1B' }}>
                {passedChecks}/{totalChecks}
              </div>
              <div style={{ fontSize: 13, color: '#52525B' }}>
                Standar engineering compliant. {passedChecks === totalChecks ? '🎉 Excellent!' : passedChecks >= totalChecks * 0.6 ? '⚠ Beberapa area butuh perbaikan' : '🚨 Perlu evaluasi serius'}
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#71717A', marginTop: 4 }}>
              Audit otomatis berdasarkan TCQSM, Permenhub 27/2015, Permenhub 79/2013, ILO C153, dan APTA Best Practice.
            </div>
          </div>

          {/* Compliance Checks */}
          <div className="space-y-2.5">
            {checks.map(c => {
              const statusConfig = {
                pass:  { icon: '✓', color: '#059669', tint: '#ECFDF5', border: '#6EE7B7', label: 'COMPLIANT' },
                warn:  { icon: '⚠', color: '#D97706', tint: '#FFFBEB', border: '#FCD34D', label: 'WARNING' },
                fail:  { icon: '✗', color: '#DC2626', tint: '#FEF2F2', border: '#FCA5A5', label: 'NON-COMPLIANT' },
                unset: { icon: '—', color: '#71717A', tint: '#FAFAFA', border: '#E4E4E7', label: 'BELUM DIATUR' },
                info:  { icon: 'ℹ', color: '#2563EB', tint: '#EFF6FF', border: '#BFDBFE', label: 'INFO' },
              }[c.status];
              return (
                <div key={c.key} style={{ background: statusConfig.tint, border: `1px solid ${statusConfig.border}`, borderRadius: 8, padding: '12px 14px' }}>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span style={{ background: statusConfig.color, color: '#FFFFFF', width: 22, height: 22, borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {statusConfig.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.textPrimary }}>{c.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: statusConfig.color, letterSpacing: '0.06em', background: statusConfig.color + '20', padding: '1px 6px', borderRadius: 3 }}>{statusConfig.label}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: statusConfig.color, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{c.value}</div>
                      <div style={{ fontSize: 11, color: '#52525B', marginTop: 4 }}>
                        <strong style={{ color: TOKENS.textSecondary }}>Target:</strong> {c.target}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#52525B', marginTop: 4, lineHeight: 1.5 }}>
                        💡 {c.explanation}
                      </div>
                      <div style={{ fontSize: 10, color: '#A1A1AA', marginTop: 4, fontStyle: 'italic' }}>
                        Referensi: {c.reference}
                      </div>
                      {c.detail && c.detail.length > 0 && (
                        <div style={{ marginTop: 6, padding: '6px 10px', background: '#FFFFFF', border: '1px solid #FCA5A5', borderRadius: 4 }}>
                          {c.detail.map((d, i) => (
                            <div key={i} style={{ fontSize: 10.5, color: '#991B1B', fontFamily: 'ui-monospace, monospace' }}>
                              • {d.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── B. KAPASITAS & DEMAND ─── */}
      {section === 'demand' && (
        <div className="space-y-4">
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.5 }}>
              <strong>📐 Load Factor Analysis</strong> — Mengukur tingkat keterisian bus relatif terhadap kapasitas. Kunci untuk planning: bila Load Factor &gt; 1.0, penumpang berdiri (uncomfortable); &gt; 1.5 = unsafe crush load. Standard TCQSM mengelompokkan ke Class A (excellent) hingga F (crush).
            </div>
          </div>

          {/* Input Form */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Input Data Kapasitas & Demand
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', display: 'block', marginBottom: 4 }}>
                  Kapasitas Bus (penumpang/bus)
                </label>
                <input
                  type="number"
                  value={route.kapasitasBus || 80}
                  onChange={e => updateRoute({ ...route, kapasitasBus: Number(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #D4D4D8', borderRadius: 6, fontVariantNumeric: 'tabular-nums', outline: 'none' }}
                />
                <div style={{ fontSize: 10.5, color: '#71717A', marginTop: 4 }}>
                  Total kapasitas (kursi + standing area). Default 80 untuk medium bus BRT.<br/>
                  Referensi: bus kecil 30, medium 60-80, articulated 120-160, bi-articulated 200+.
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', display: 'block', marginBottom: 4 }}>
                  Demand PHPDV (pax/jam/arah pada jam puncak)
                </label>
                <input
                  type="number"
                  value={route.demandPHPDV || 0}
                  onChange={e => updateRoute({ ...route, demandPHPDV: Number(e.target.value) || 0 })}
                  placeholder="0 (belum di-set)"
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #D4D4D8', borderRadius: 6, fontVariantNumeric: 'tabular-nums', outline: 'none' }}
                />
                <div style={{ fontSize: 10.5, color: '#71717A', marginTop: 4 }}>
                  <strong>PHPDV</strong> = Peak Hour Peak Direction Volume.<br/>
                  Estimasi cara: hitung penumpang yang masuk ke titik halte tersibuk pada jam paling padat, hanya satu arah.<br/>
                  Sumber: data ridership BRT/koridor, atau survei OD.
                </div>
              </div>
            </div>
          </div>

          {/* Result Panel */}
          {(route.demandPHPDV > 0) && (
            <div style={{ background: lfClass.tint, border: `1px solid ${lfClass.color}40`, borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Hasil Analisis Load Factor (TCQSM Method)
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <Stat label="Demand PHPDV" value={`${lf.demand}`} unit="pax/jam" />
                <Stat label="Kapasitas Bus × Trip" value={`${Math.round(lf.capacity)}`} unit="pax/jam" />
                <Stat label="Load Factor" value={`${(lf.lf * 100).toFixed(0)}%`} color={lfClass.color} />
                <Stat label="Class TCQSM" value={lfClass.class} color={lfClass.color} sub={lfClass.label} />
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: 6, padding: 12, border: `1px solid ${lfClass.color}20` }}>
                <div style={{ fontSize: 12, color: '#52525B', lineHeight: 1.5 }}>
                  <strong style={{ color: lfClass.color, fontSize: 13 }}>Class {lfClass.class} — {lfClass.label}</strong>
                  <br/>{lfClass.desc}
                </div>
              </div>

              <div style={{ marginTop: 10, padding: '10px 12px', background: '#FFFFFF', border: '1px dashed #D4D4D8', borderRadius: 6, fontSize: 11.5, color: '#52525B', lineHeight: 1.5 }}>
                <strong style={{ color: TOKENS.textSecondary }}>Cara perhitungan:</strong><br/>
                <code style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', background: '#F4F4F5', padding: '1px 4px', borderRadius: 2 }}>
                  Trip per jam = 60 ÷ headway = 60 ÷ {m.headway.toFixed(2)} = {(60/m.headway).toFixed(2)}
                </code><br/>
                <code style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', background: '#F4F4F5', padding: '1px 4px', borderRadius: 2 }}>
                  Kapasitas = trip/jam × kapasitasBus = {(60/m.headway).toFixed(2)} × {route.kapasitasBus} = {Math.round(lf.capacity)} pax/jam
                </code><br/>
                <code style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', background: '#F4F4F5', padding: '1px 4px', borderRadius: 2 }}>
                  Load Factor = Demand ÷ Kapasitas = {lf.demand} ÷ {Math.round(lf.capacity)} = {lf.lf.toFixed(3)}
                </code>
              </div>
            </div>
          )}

          {/* TCQSM Class Reference Table */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: '#FAFAFA', padding: '8px 14px', borderBottom: '1px solid #E4E4E7' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TCQSM Service Quality Classes (Reference)
              </span>
            </div>
            <table className="w-full" style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', color: '#52525B' }}>
                  <th className="text-left py-2 px-3" style={{ fontWeight: 600 }}>Class</th>
                  <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Max LF</th>
                  <th className="text-left py-2 px-3" style={{ fontWeight: 600 }}>Label</th>
                  <th className="text-left py-2 px-3" style={{ fontWeight: 600 }}>Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {SERVICE_LOAD_CLASSES.map(c => (
                  <tr key={c.class} style={{ borderTop: '1px solid #F4F4F5', background: c.class === lfClass.class ? c.tint : '#FFFFFF' }}>
                    <td className="py-2 px-3" style={{ fontWeight: 700, color: c.color }}>{c.class}</td>
                    <td className="py-2 px-3 text-right" style={{ color: '#52525B' }}>{c.max === 999 ? '∞' : c.max}</td>
                    <td className="py-2 px-3" style={{ color: c.color, fontWeight: 600 }}>{c.label}</td>
                    <td className="py-2 px-3" style={{ color: '#71717A' }}>{c.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── A2. AUDIT TRIP — Verifikasi jumlah RIT/Trip transparency ─── */}
      {section === 'audit-trip' && (() => {
        const isPP = m.isPP;
        const namaTerminalAwal = route.halte[0]?.nama || 'Terminal Awal';
        const namaTerminalAkhir = route.halte[route.halte.length - 1]?.nama || 'Terminal Akhir';

        // Compute totals from actual sched
        const totalTrips = sched.trips.length;
        const berangkatTrips = sched.trips.filter(t => t.direction === 'berangkat');
        const pulangTrips = sched.trips.filter(t => t.direction === 'pulang');

        // Per terminal activity
        const awalDepartures = berangkatTrips.length; // dispatch berangkat keluar dari awal
        const awalArrivals = pulangTrips.length;       // pulang trip arrives di awal (PP only)
        const akhirArrivals = berangkatTrips.length;   // berangkat trip arrives di akhir
        const akhirDepartures = pulangTrips.length;    // dispatch pulang keluar dari akhir

        // Per bus breakdown
        const perBus = {};
        sched.trips.forEach(t => {
          if (!perBus[t.busId]) perBus[t.busId] = { berangkat: 0, pulang: 0, total: 0 };
          perBus[t.busId][t.direction]++;
          perBus[t.busId].total++;
        });

        // Operating window
        const winStart = sched.ritGroups[0]?.startMin || 0;
        const winEnd = sched.ritGroups[sched.ritGroups.length - 1]?.endMin || 0;
        const winMin = winEnd - winStart;
        const winHrs = winMin / 60;

        // Per-group breakdown
        const groupBreakdown = sched.ritGroups.map(g => {
          const groupTrips = sched.trips.filter(t => t.armadaWindow === g.id);
          const berangkat = groupTrips.filter(t => t.direction === 'berangkat').length;
          const pulang = groupTrips.filter(t => t.direction === 'pulang').length;
          const groupMin = g.endMin - g.startMin;
          const expectedDispatches = isFinite(g.headway) && g.headway > 0
            ? Math.ceil(groupMin / g.headway)
            : 0;
          return {
            id: g.id, startMin: g.startMin, endMin: g.endMin, groupMin,
            armada: g.armada, headway: g.headway, expectedDispatches,
            berangkat, pulang, total: berangkat + pulang,
          };
        });

        return (
          <div className="space-y-4">
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.5 }}>
                <strong>🎯 Audit Jumlah RIT/Trip</strong> — Verifikasi transparan jumlah trip dari schedule generator. Untuk validasi: bandingkan jumlah aktual dengan formula teoritis.
              </div>
            </div>

            {/* Big Numbers Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#71717A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total Trip</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: TOKENS.brand, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>{totalTrips}</div>
                <div style={{ fontSize: 10.5, color: '#71717A' }}>{isPP ? 'trip 1-arah (gabungan B+P)' : 'putaran loop'}</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#71717A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Berangkat →</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#10B981', fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>{berangkatTrips.length}</div>
                <div style={{ fontSize: 10.5, color: '#71717A' }}>dispatch dari Awal</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#71717A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Pulang ←</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#8B5CF6', fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>{pulangTrips.length}</div>
                <div style={{ fontSize: 10.5, color: '#71717A' }}>{isPP ? 'dispatch dari Akhir' : 'N/A (Loop)'}</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#71717A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total RIT</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0EA5E9', fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>{(sched.rits || []).length}</div>
                <div style={{ fontSize: 10.5, color: '#71717A' }}>full rotation armada</div>
              </div>
            </div>

            {/* Terminal Activity Detail */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                📍 Aktivitas per Terminal (06:00 - 22:00)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46', marginBottom: 6 }}>
                    🅰 {namaTerminalAwal}
                  </div>
                  <div style={{ fontSize: 12, color: '#065F46', lineHeight: 1.7 }}>
                    <strong style={{ fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{awalDepartures}</strong> dispatch keluar (berangkat →)<br/>
                    {isPP && <><strong style={{ fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{awalArrivals}</strong> arrival masuk (← pulang)</>}
                  </div>
                  <div style={{ fontSize: 11, color: '#047857', marginTop: 6, paddingTop: 6, borderTop: '1px dashed #6EE7B7' }}>
                    Total aktivitas: <strong>{awalDepartures + awalArrivals}</strong> {isPP ? '(berangkat dispatch + pulang arrival)' : '(berangkat dispatch saja)'}
                  </div>
                </div>

                <div style={{ background: isPP ? '#F5F3FF' : '#FAFAFA', border: `1px solid ${isPP ? '#C4B5FD' : '#E4E4E7'}`, borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isPP ? '#5B21B6' : '#71717A', marginBottom: 6 }}>
                    🅱 {namaTerminalAkhir} {!isPP && <span style={{ fontWeight: 400 }}>(Loop: sama dengan Awal)</span>}
                  </div>
                  {isPP ? (
                    <>
                      <div style={{ fontSize: 12, color: '#5B21B6', lineHeight: 1.7 }}>
                        <strong style={{ fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{akhirArrivals}</strong> arrival masuk (berangkat tiba →)<br/>
                        <strong style={{ fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{akhirDepartures}</strong> dispatch keluar (← pulang)
                      </div>
                      <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 6, paddingTop: 6, borderTop: '1px dashed #C4B5FD' }}>
                        Total aktivitas: <strong>{akhirArrivals + akhirDepartures}</strong>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 11, color: '#71717A' }}>
                      Untuk Loop, semua dispatch & arrival di terminal yang sama. Lihat data Terminal Awal.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Per Group Breakdown */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: '#FAFAFA', padding: '8px 14px', borderBottom: '1px solid #E4E4E7' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  📊 Breakdown per Armada Window ({groupBreakdown.length} group)
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="w-full" style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA', color: '#52525B' }}>
                      <th className="text-left py-2 px-3" style={{ fontWeight: 600 }}>Group</th>
                      <th className="text-left py-2 px-3" style={{ fontWeight: 600 }}>Window</th>
                      <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Durasi</th>
                      <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Armada</th>
                      <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Headway</th>
                      <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Berangkat</th>
                      {isPP && <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Pulang</th>}
                      <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Total</th>
                      <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Theoretical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupBreakdown.map(g => {
                      const matches = g.berangkat === g.expectedDispatches;
                      return (
                        <tr key={g.id} style={{ borderTop: '1px solid #F4F4F5' }}>
                          <td className="py-2 px-3" style={{ fontWeight: 600 }}>G{g.id}</td>
                          <td className="py-2 px-3" style={{ color: '#52525B' }}>{fmtHM(g.startMin)}-{fmtHM(g.endMin)}</td>
                          <td className="py-2 px-3 text-right" style={{ color: '#52525B' }}>{g.groupMin}m</td>
                          <td className="py-2 px-3 text-right" style={{ fontWeight: 600 }}>{g.armada}</td>
                          <td className="py-2 px-3 text-right" style={{ color: '#52525B' }}>{isFinite(g.headway) ? g.headway.toFixed(2) : '∞'}m</td>
                          <td className="py-2 px-3 text-right" style={{ color: '#10B981', fontWeight: 600 }}>{g.berangkat}</td>
                          {isPP && <td className="py-2 px-3 text-right" style={{ color: '#8B5CF6', fontWeight: 600 }}>{g.pulang}</td>}
                          <td className="py-2 px-3 text-right" style={{ fontWeight: 700 }}>{g.total}</td>
                          <td className="py-2 px-3 text-right" style={{ color: matches ? '#059669' : '#D97706' }}>
                            {g.expectedDispatches} {matches ? '✓' : `(Δ${g.berangkat - g.expectedDispatches})`}
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ borderTop: '2px solid #E4E4E7', background: '#FAFAFA', fontWeight: 700 }}>
                      <td className="py-2 px-3" colSpan={isPP ? 5 : 5}>TOTAL</td>
                      <td className="py-2 px-3 text-right" style={{ color: '#10B981' }}>{berangkatTrips.length}</td>
                      {isPP && <td className="py-2 px-3 text-right" style={{ color: '#8B5CF6' }}>{pulangTrips.length}</td>}
                      <td className="py-2 px-3 text-right">{totalTrips}</td>
                      <td className="py-2 px-3 text-right" style={{ color: '#52525B' }}>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Per Bus Breakdown */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: '#FAFAFA', padding: '8px 14px', borderBottom: '1px solid #E4E4E7' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  🚌 Breakdown per Bus
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6" style={{ padding: 10, gap: 6 }}>
                {Object.entries(perBus).sort((a, b) => Number(a[0]) - Number(b[0])).map(([id, c]) => {
                  const isSisipan = Number(id) > Number(route.armada);
                  return (
                    <div key={id} style={{ background: isSisipan ? '#FFFBEB' : '#F8FAFC', border: `1px solid ${isSisipan ? '#FDE68A' : '#E2E8F0'}`, borderRadius: 5, padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1E293B' }}>
                        Bus #{id}{isSisipan && <span style={{ color: '#D97706', marginLeft: 3 }}>⭐</span>}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: TOKENS.brand, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                        {c.total}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#64748B' }}>
                        {c.berangkat}→ {isPP && `· ${c.pulang}←`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formula Transparency */}
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0C4A6E', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                📐 Formula & Verifikasi Math
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E0F2FE', borderRadius: 6, padding: '10px 12px', marginBottom: 8, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#0F172A', lineHeight: 1.7 }}>
                <strong style={{ color: '#0369A1' }}>Untuk single periode konstan:</strong><br/>
                Total Berangkat = ⌈WindowDuration ÷ Headway⌉<br/>
                {isPP && <>Total Pulang = Total Berangkat (1:1 dengan berangkat)<br/></>}
                Total Trip = Berangkat {isPP && '+ Pulang'}<br/>
                <br/>
                <strong style={{ color: '#0369A1' }}>Untuk multi-periode (sched aktual):</strong><br/>
                Total = Σ ⌈Group_Duration ÷ Group_Headway⌉ untuk setiap group<br/>
                <br/>
                <strong style={{ color: '#0369A1' }}>Verifikasi math current:</strong><br/>
                Window: {winHrs.toFixed(1)} jam ({winMin} mnt, {fmtHM(winStart)}-{fmtHM(winEnd)})<br/>
                Berangkat: <strong>{berangkatTrips.length}</strong> trip<br/>
                {isPP && <>Pulang:    <strong>{pulangTrips.length}</strong> trip<br/></>}
                Total:     <strong>{totalTrips}</strong> trip<br/>
                RIT:       <strong>{(sched.rits || []).length}</strong> ({(berangkatTrips.length / Math.max(1, route.armada)).toFixed(1)} per bus)
              </div>
              <div style={{ fontSize: 10.5, color: '#475569', lineHeight: 1.5 }}>
                <strong>Catatan:</strong> Scheduler menggunakan rule <code style={{ background: '#E0F2FE', padding: '0 4px', borderRadius: 2 }}>scheduledDep &lt; group.endMin</code> (strict less-than). Dispatch terakhir harus &lt; jam akhir periode. Bila bus delayed (carry-over dari group sebelumnya), depTime aktual di-adjust untuk respect physics.
              </div>
            </div>

            {/* Diagnostic — Common Misconceptions */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                ⚠ Common Misconceptions
              </div>
              <div style={{ fontSize: 11, color: '#7C2D12', lineHeight: 1.6 }}>
                <div style={{ marginBottom: 6 }}>
                  <strong>1. "Berapa trip di Terminal Awal?"</strong> — ambigu untuk PP. Bisa berarti:
                  <ul style={{ paddingLeft: 18, marginTop: 2, marginBottom: 0 }}>
                    <li>Departures saja: <strong>{awalDepartures}</strong> (berangkat dispatch keluar)</li>
                    {isPP && <li>Total visits: <strong>{awalDepartures + awalArrivals}</strong> (berangkat dispatch + pulang arrival)</li>}
                  </ul>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>2. Formula <code>floor(960/headway)</code> sering miss-by-1.</strong> Yang benar adalah <code>ceil(960/headway)</code> karena dispatch pertama at t=0 dihitung sebagai trip ke-1.
                </div>
                <div>
                  <strong>3. Multi-periode mengubah perhitungan.</strong> Aktual sched dihitung per group (yang bisa span multi-periode). Lihat tabel "Breakdown per Armada Window" di atas.
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── B2. PER-PERIODE DEMAND ANALYSIS (sub-section of demand tab) ─── */}
      {section === 'demand' && (() => {
        const perPeriode = calcPerPeriodeAnalysis(route, sched, m);
        const totalIssues = perPeriode.filter(p => p.hasIssue).length;
        return (
          <div className="space-y-4">
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                <strong>📊 Per-Periode Demand Profile</strong> — Input demand (pax/jam) untuk setiap periode aktif. App akan auto-calculate Load Factor per periode dan rekomendasi armada.
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: '#FAFAFA', padding: '8px 14px', borderBottom: '1px solid #E4E4E7' }} className="flex items-center justify-between">
                <span style={{ fontSize: 10, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Demand Profile — Per Periode Aktif ({perPeriode.length} periode)
                </span>
                {totalIssues > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: 3 }}>
                    ⚠ {totalIssues} periode butuh perhatian
                  </span>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="w-full" style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA', color: '#52525B' }}>
                      <th className="text-left py-2 px-3" style={{ fontWeight: 600 }}>Periode</th>
                      <th className="text-left py-2 px-3" style={{ fontWeight: 600 }}>Jam</th>
                      <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Demand<br/><span style={{ fontSize: 9, fontWeight: 400 }}>(pax/jam)</span></th>
                      <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Supply<br/><span style={{ fontSize: 9, fontWeight: 400 }}>(pax/jam)</span></th>
                      <th className="text-right py-2 px-3" style={{ fontWeight: 600 }}>Headway<br/><span style={{ fontSize: 9, fontWeight: 400 }}>(menit)</span></th>
                      <th className="text-center py-2 px-3" style={{ fontWeight: 600 }}>LF / Class</th>
                      <th className="text-center py-2 px-3" style={{ fontWeight: 600 }}>Armada<br/><span style={{ fontSize: 9, fontWeight: 400 }}>(saat ini → ideal)</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {perPeriode.map(p => {
                      const c = p.lfClass;
                      const issueIndicator = p.hasIssue;
                      return (
                        <tr key={p.kode} style={{ borderTop: '1px solid #F4F4F5', background: issueIndicator ? '#FEF2F2' : '#FFFFFF' }}>
                          <td className="py-2 px-3" style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                            {p.kode}
                            <span style={{ display: 'block', fontSize: 9, color: PERIOD_PALETTE[p.kategori]?.text || '#71717A', fontFamily: 'inherit', fontWeight: 500 }}>
                              {p.kategori}
                            </span>
                          </td>
                          <td className="py-2 px-3" style={{ color: '#52525B' }}>{p.jam}</td>
                          <td className="py-2 px-3 text-right" style={{ color: '#18181B' }}>
                            <input
                              type="number"
                              value={(route.periode || []).find(pp => pp.kode === p.kode)?.demand || 0}
                              onChange={e => {
                                const newPeriode = (route.periode || []).map(pp =>
                                  pp.kode === p.kode ? { ...pp, demand: Number(e.target.value) || 0 } : pp
                                );
                                updateRoute({ ...route, periode: newPeriode });
                              }}
                              style={{ width: 80, padding: '2px 6px', fontSize: 11, border: '1px solid #D4D4D8', borderRadius: 4, fontVariantNumeric: 'tabular-nums', outline: 'none', textAlign: 'right' }}
                            />
                          </td>
                          <td className="py-2 px-3 text-right" style={{ color: '#52525B' }}>{p.supply}</td>
                          <td className="py-2 px-3 text-right" style={{ color: '#52525B' }}>{p.headway > 0 ? p.headway.toFixed(1) : '—'}</td>
                          <td className="py-2 px-3 text-center" style={{ color: c.color, fontWeight: 600 }}>
                            {p.demand > 0 ? `${(p.lf * 100).toFixed(0)}%` : '—'}
                            {p.demand > 0 && (
                              <span style={{ display: 'inline-block', marginLeft: 6, padding: '1px 6px', background: c.tint, color: c.color, borderRadius: 3, fontSize: 10, fontWeight: 700 }}>
                                {c.class}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center" style={{ color: '#52525B' }}>
                            <strong style={{ color: '#18181B' }}>{p.armada}</strong>
                            {p.demand > 0 && p.armadaDelta !== 0 && (
                              <>
                                <span style={{ color: '#A1A1AA', margin: '0 4px' }}>→</span>
                                <strong style={{ color: p.armadaDelta > 0 ? '#DC2626' : '#059669' }}>
                                  {p.recommendedArmada}{p.armadaDelta > 0 ? ' (+' + p.armadaDelta + ')' : ' (' + p.armadaDelta + ')'}
                                </strong>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations with one-click APPLY actions (closes feedback loop) */}
            {totalIssues > 0 && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '12px 14px' }}>
                <div className="flex items-baseline gap-2 flex-wrap" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#991B1B' }}>⚠ Rekomendasi Engineering — One-Click Apply</span>
                  <span style={{ fontSize: 10.5, color: '#7F1D1D', fontStyle: 'italic' }}>Klik tombol untuk auto-tambah Sisipan armada</span>
                </div>
                <div className="space-y-2">
                  {perPeriode.filter(p => p.hasIssue).map(p => {
                    // Parse periode time range to startMin/endMin for sisipan
                    const parseTime = (s) => {
                      try {
                        const [h, m] = s.split(':').map(Number);
                        return h * 60 + (m || 0);
                      } catch { return 0; }
                    };
                    const [startStr, endStr] = (p.jam || '').split('-').map(s => s.trim());
                    const startMin = parseTime(startStr);
                    const endMin = parseTime(endStr);

                    const handleApplySisipan = () => {
                      const newSisipan = {
                        id: `S${Date.now()}-${p.kode}`,
                        startMin,
                        endMin,
                        deltaArmada: p.armadaDelta, // can be negative for reduce
                        customHeadway: 0, // 0 = auto-recalc from new armada
                        catatan: `Auto-generated: balance LF di ${p.kode} (${p.lfClass.class} → target B-C)`,
                      };
                      const existingSisipan = (route.sisipanArmada || []);
                      // Avoid duplicate (same time range + delta)
                      const dupe = existingSisipan.find(s => s.startMin === startMin && s.endMin === endMin && s.deltaArmada === p.armadaDelta);
                      if (dupe) {
                        alert(`Sisipan untuk periode ${p.kode} dengan delta ${p.armadaDelta > 0 ? '+' : ''}${p.armadaDelta} sudah ada.`);
                        return;
                      }
                      updateRoute({
                        ...route,
                        sisipanArmada: [...existingSisipan, newSisipan],
                      });
                    };

                    return (
                      <div key={p.kode} style={{ background: '#FFFFFF', border: '1px solid #FCA5A5', borderRadius: 6, padding: '10px 12px' }}>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11.5, color: '#7F1D1D', lineHeight: 1.5 }}>
                              <strong style={{ fontFamily: 'ui-monospace, monospace' }}>{p.kode}</strong>
                              {' '}({p.jam}, {p.nama}): <strong>LF = {(p.lf * 100).toFixed(0)}%</strong> Class <strong style={{ color: p.lfClass.color }}>{p.lfClass.class}</strong>
                            </div>
                            <div style={{ fontSize: 10.5, color: '#52525B', marginTop: 2 }}>
                              {p.armadaDelta > 0 ? (
                                <>Demand <strong>{p.demand} pax/jam</strong> &gt; supply <strong>{p.supply}</strong>. Butuh <strong>+{p.armadaDelta}</strong> armada untuk LF ≤ 0.85.</>
                              ) : p.armadaDelta < -1 ? (
                                <>Armada berlebih. Bisa kurangi <strong>{Math.abs(p.armadaDelta)}</strong> bus untuk efisiensi.</>
                              ) : (
                                <>LF tinggi tapi armada delta kecil — review kapasitas bus atau headway.</>
                              )}
                            </div>
                          </div>
                          {p.armadaDelta !== 0 && Math.abs(p.armadaDelta) >= 1 && (
                            <button
                              onClick={handleApplySisipan}
                              style={{
                                padding: '6px 12px', fontSize: 11, fontWeight: 700,
                                background: p.armadaDelta > 0 ? '#DC2626' : '#059669',
                                color: '#FFFFFF', border: 'none', borderRadius: 5, cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              title={`Auto-create sisipan: ${p.jam}, ${p.armadaDelta > 0 ? '+' : ''}${p.armadaDelta} bus`}
                            >
                              {p.armadaDelta > 0 ? `+ Sisipan +${p.armadaDelta} bus` : `+ Sisipan ${p.armadaDelta} bus`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, fontSize: 10.5, color: '#7F1D1D', fontStyle: 'italic' }}>
                  💡 Tombol Apply akan otomatis menambah entry ke Sisipan Armada (time-range based). Schedule akan langsung re-generate.
                </div>
              </div>
            )}

            {/* Reference: Aggregate calculation breakdown */}
            <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 6, padding: '10px 14px', fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
              <strong style={{ color: '#1E293B' }}>📐 Cara Perhitungan Per Periode:</strong>
              <div style={{ marginTop: 4, fontFamily: 'ui-monospace, monospace', fontSize: 10.5, color: '#0F172A' }}>
                Supply<sub>periode</sub> = (60 ÷ headway<sub>periode</sub>) × kapasitasBus = pax/jam<br/>
                LF<sub>periode</sub> = Demand<sub>periode</sub> ÷ Supply<sub>periode</sub><br/>
                Recommended Armada = ⌈Cycle ÷ (60 × Kapasitas × Target_LF ÷ Demand)⌉ <span style={{ color: '#64748B' }}># target_LF = 0.85</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── B3. FLEET & RECOVERY ANALYSIS (NEW TAB) ─── */}
      {section === 'fleet' && (() => {
        const pvr = calcPVRAnalysis(m, sched, route);
        const recovery = calcRecoveryAnalysis(m);
        const bunching = estimateBunchingRisk(m.headway, m.layoverPct, route.halte.length);
        const spi = calcSPI(m.totalTrip, m.serviceTime, route.armada, route.jamOps);
        const totalServiceHours = buses.reduce((s, b) => s + (b.activeMin || 0) / 60, 0);
        const totalKm = m.totalKm;
        const totalDutyHours = buses.reduce((s, b) => s + (b.dutyMin || 0) / 60, 0);

        return (
          <div className="space-y-4">
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.5 }}>
                <strong>🚌 Fleet Sizing & Recovery Time</strong> — Analisis utilization armada, kebutuhan minimum (PVR), dan recovery time. Fundamental untuk planning operasional yang reliable.
              </div>
            </div>

            {/* PVR Analysis */}
            {pvr && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Peak Vehicle Requirement (PVR)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Stat label="PVR (minimum)" value={pvr.pvr} unit="bus" color="#1E40AF" sub={`peak h=${pvr.peakHeadway.toFixed(1)}m`} />
                  <Stat label="Fleet Aktual" value={pvr.fleetSize} unit="bus" />
                  <Stat label="Spare Armada" value={pvr.spare} unit="bus" color={pvr.spare >= 0 ? '#059669' : '#DC2626'} sub={`${(pvr.sparePct * 100).toFixed(0)}%`} />
                  <Stat label="Status" value={pvr.spareStatus.toUpperCase()} color={pvr.spareStatus === 'optimal' ? '#059669' : pvr.spareStatus === 'kurang' ? '#DC2626' : '#D97706'} />
                </div>
                <div style={{ background: pvr.spareStatus === 'optimal' ? '#ECFDF5' : pvr.spareStatus === 'kurang' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${pvr.spareStatus === 'optimal' ? '#6EE7B7' : pvr.spareStatus === 'kurang' ? '#FCA5A5' : '#FCD34D'}`, borderRadius: 6, padding: '8px 12px', fontSize: 11.5, lineHeight: 1.5 }}>
                  💡 <strong>Rekomendasi:</strong> {pvr.recommendation}
                </div>
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 4, fontSize: 11, color: '#475569' }}>
                  <strong>Cara perhitungan:</strong>
                  <div style={{ fontFamily: 'ui-monospace, monospace', marginTop: 4, fontSize: 10.5, color: '#0F172A' }}>
                    PVR = ⌈Cycle ÷ Peak_Headway⌉ = ⌈{pvr.cycleTime.toFixed(1)} ÷ {pvr.peakHeadway.toFixed(1)}⌉ = <strong>{pvr.pvr}</strong> bus<br/>
                    Spare Pct = (Fleet − PVR) ÷ PVR = ({pvr.fleetSize} − {pvr.pvr}) ÷ {pvr.pvr} = <strong>{(pvr.sparePct * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Recovery Time */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Recovery Time Analysis
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <Stat label="Layover Total" value={`${m.layoverTotal}`} unit="menit" />
                <Stat label="Layover %" value={`${(m.layoverPct * 100).toFixed(1)}%`} unit="of RTT" color={recovery.color} />
                <Stat label="Status" value={recovery.label} color={recovery.color} />
              </div>
              <div style={{ background: recovery.color + '15', border: `1px solid ${recovery.color}40`, borderRadius: 6, padding: '8px 12px', fontSize: 11.5, lineHeight: 1.5, color: recovery.color }}>
                💡 {recovery.text}
              </div>
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 4, fontSize: 11, color: '#475569' }}>
                <strong>Konteks engineering:</strong> Recovery time adalah buffer untuk schedule reliability. Layover mengabsorbsi delay (traffic, dwell variance) sebelum bunching terjadi. TCRP 30 merekomendasikan 10-20% RTT.
              </div>
            </div>

            {/* Bunching Risk */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Bunching Risk Estimation
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <Stat label="Risk Score" value={`${(bunching.risk * 100).toFixed(0)}%`} color={bunching.level === 'rendah' ? '#059669' : bunching.level === 'sedang' ? '#D97706' : '#DC2626'} />
                <Stat label="Level" value={bunching.level.toUpperCase()} color={bunching.level === 'rendah' ? '#059669' : bunching.level === 'sedang' ? '#D97706' : '#DC2626'} />
                <Stat label="Headway Factor" value={`${(bunching.headwayFactor * 100).toFixed(0)}%`} sub="freq risk" />
                <Stat label="Layover Factor" value={`${(bunching.layoverFactor * 100).toFixed(0)}%`} sub="recovery risk" />
              </div>
              <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 4, padding: '8px 12px', fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                <strong>Bunching</strong> = fenomena 2 bus berdekatan akibat delay snowballing. High-frequency routes ({'>'}10 bus/jam) dengan low layover paling rentan. Mitigasi: tambah recovery time, dispatcher control, holding strategies.
              </div>
            </div>

            {/* Service Productivity */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Service Productivity Index (SPI)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <Stat label="SPI" value={`${(spi * 100).toFixed(0)}%`} color={spi >= 0.85 ? '#059669' : spi >= 0.65 ? '#D97706' : '#DC2626'} />
                <Stat label="Total Service Hours" value={totalServiceHours.toFixed(1)} unit="jam" />
                <Stat label="Total VKM" value={totalKm.toFixed(0)} unit="km" />
                <Stat label="Total Duty Hours" value={totalDutyHours.toFixed(1)} unit="jam" />
              </div>
              <div style={{ marginTop: 4, padding: '8px 12px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 4, fontSize: 11, color: '#475569' }}>
                <strong>SPI</strong> = (Total Trip × Service Time) ÷ (Armada × JamOps × 60). Mengukur seberapa efektif armada digunakan untuk revenue service.<br/>
                <span style={{ color: '#475569' }}>SPI ≥ 85% = excellent, 65-85% = acceptable, &lt; 65% = under-utilized.</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── C. RUMUS KPI ─── */}
      {section === 'kpi' && (
        <div className="space-y-3">
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.5 }}>
              <strong>📐 KPI Operasional</strong> — Setiap metric punya formula yang dapat ditelusuri. Pemahaman formula menentukan keputusan engineering yang tepat.
            </div>
          </div>

          {[
            {
              name: 'Service Time',
              value: `${m.serviceTime.toFixed(1)} menit`,
              formula: 'Service Time = Σ Travel Time + Σ Dwell Time',
              currentCalc: `${m.travelTime} + ${m.totalDwell} = ${m.serviceTime}`,
              meaning: 'Waktu yang dibutuhkan bus dari terminal awal sampai terminal akhir, termasuk dwell di setiap halte.',
              implication: 'Semakin pendek service time, semakin banyak trip per hari. Optimasi: kurangi dwell time dengan boarding system efisien.',
              reference: 'TCQSM Definition',
            },
            {
              name: 'RTT (Round Trip Time)',
              value: `${m.rtt.toFixed(1)} menit`,
              formula: m.isPP ? 'RTT(PP) = Service Time × 2 (pulang-pergi)' : 'RTT(Loop) = Service Time (sirkular)',
              currentCalc: m.isPP ? `${m.serviceTime} × 2 = ${m.rtt}` : `${m.serviceTime} (loop)`,
              meaning: 'Waktu satu putaran lengkap rute. Untuk PP: ada perjalanan kembali; untuk Loop: sudah sirkular.',
              implication: 'Determinan utama jumlah trip per bus. RTT pendek = bus dapat lebih banyak trip.',
              reference: 'TCRP Report 165',
            },
            {
              name: 'Cycle Time',
              value: `${m.cycleTime.toFixed(1)} menit`,
              formula: m.isPP ? 'Cycle = RTT + (Layover × 2)' : 'Cycle = RTT + Layover',
              currentCalc: m.isPP ? `${m.rtt} + (${m.layoverInput} × 2) = ${m.cycleTime}` : `${m.rtt} + ${m.layoverInput} = ${m.cycleTime}`,
              meaning: 'Total waktu satu cycle bus, termasuk layover di terminal. PP: layover di KEDUA terminal.',
              implication: 'Cycle = waktu minimum bus tersedia kembali untuk dispatch. Determinan headway minimum.',
              reference: 'TCQSM Section 6 (Bus Capacity)',
            },
            {
              name: 'Headway',
              value: `${m.headway.toFixed(2)} menit`,
              formula: 'Headway = Cycle Time ÷ Armada',
              currentCalc: `${m.cycleTime} ÷ ${route.armada} = ${m.headway.toFixed(2)}`,
              meaning: 'Jarak waktu antara dua bus berturut-turut (dari sudut pandang penumpang menunggu).',
              implication: 'Penurunan headway = peningkatan service quality. Tapi butuh tambah armada (cost ↑).',
              reference: 'Permenhub 27/2015 SPM',
            },
            {
              name: 'Frekuensi',
              value: `${m.freqPerJam.toFixed(2)} bus/jam`,
              formula: 'Frekuensi = 60 ÷ Headway',
              currentCalc: `60 ÷ ${m.headway.toFixed(2)} = ${m.freqPerJam.toFixed(2)}`,
              meaning: 'Jumlah bus yang melewati halte per jam (per arah).',
              implication: 'Standar SPM: ≥ 6 bus/jam = baik. < 3 bus/jam = perhatian.',
              reference: 'Permenhub 27/2015',
            },
            {
              name: 'Kecepatan Komersial',
              value: `${m.kecKomersial.toFixed(1)} km/jam`,
              formula: 'Vk = Jarak per Arah ÷ (Service Time ÷ 60)',
              currentCalc: `${m.jarakPerArah} ÷ (${m.serviceTime} ÷ 60) = ${m.kecKomersial.toFixed(2)}`,
              meaning: 'Kecepatan rata-rata bus dalam revenue service (termasuk dwell, exclude layover).',
              implication: 'Indikator efisiensi rute: dedicated lane → speed ↑. Target BRT urban: ≥ 25 km/jam.',
              reference: 'TCQSM Exhibit 6-43',
              note: 'Beberapa konvensi membedakan: Operating Speed (dengan dwell, no layover) vs Travel Speed (tanpa keduanya). App ini pakai konvensi Indonesia.',
            },
            {
              name: 'Trip per Bus',
              value: `${m.tripPerBus} trip`,
              formula: m.isPP ? 'TripPerBus = ⌊JamOps × 60 ÷ Cycle⌋ × 2' : 'TripPerBus = ⌊JamOps × 60 ÷ Cycle⌋',
              currentCalc: m.isPP
                ? `⌊${route.jamOps} × 60 ÷ ${m.cycleTime}⌋ × 2 = ${m.tripPerBus}`
                : `⌊${route.jamOps} × 60 ÷ ${m.cycleTime}⌋ = ${m.tripPerBus}`,
              meaning: 'Berapa trip yang dapat dilakukan satu bus dalam satu hari operasi. PP: 1 cycle = 2 trip 1-arah.',
              implication: 'Multiply oleh armada → total trip harian → kapasitas pax harian.',
              reference: 'Excel formula PERHITUNGAN HEADWAY',
            },
            {
              name: 'Total Kilometer',
              value: `${m.totalKm.toFixed(1)} km`,
              formula: 'Total KM = Total Trip × Jarak per Trip',
              currentCalc: `${m.totalTrip} × ${m.kmPerTrip} = ${m.totalKm.toFixed(1)}`,
              meaning: 'Total jarak tempuh semua bus dalam 1 hari operasi.',
              implication: 'Determinan biaya BBM, oli, ban, maintenance.',
              reference: 'Cost Engineering BRT',
            },
            {
              name: 'Layover %',
              value: `${(m.layoverPct * 100).toFixed(1)}%`,
              formula: 'Layover% = Layover Total ÷ RTT',
              currentCalc: `${m.layoverTotal} ÷ ${m.rtt} = ${(m.layoverPct * 100).toFixed(1)}%`,
              meaning: 'Persentase waktu layover dibanding waktu tempuh (RTT).',
              implication: 'Industry standard: 10-20%. < 10% = no recovery time (risiko bunching). > 30% = over-engineered.',
              reference: 'TCRP Report 30 (Recovery Time)',
            },
          ].map((kpi, i) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 14 }}>
              <div className="flex items-baseline gap-2 flex-wrap" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: TOKENS.textPrimary }}>{kpi.name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: TOKENS.brand, fontVariantNumeric: 'tabular-nums' }}>= {kpi.value}</span>
              </div>
              <div style={{ background: '#F4F4F5', borderRadius: 4, padding: '6px 10px', marginBottom: 6, fontSize: 11.5, fontFamily: 'ui-monospace, monospace', color: '#3F3F46' }}>
                <span style={{ color: '#71717A' }}>Formula:</span> {kpi.formula}
              </div>
              <div style={{ background: '#ECFDF5', border: '1px dashed #6EE7B7', borderRadius: 4, padding: '6px 10px', marginBottom: 8, fontSize: 11.5, fontFamily: 'ui-monospace, monospace', color: '#065F46' }}>
                <span style={{ color: '#047857' }}>Hitung:</span> {kpi.currentCalc}
              </div>
              <div style={{ fontSize: 12, color: '#52525B', marginBottom: 4, lineHeight: 1.5 }}>
                <strong>Arti:</strong> {kpi.meaning}
              </div>
              <div style={{ fontSize: 12, color: '#52525B', marginBottom: 4, lineHeight: 1.5 }}>
                💡 <strong>Implikasi:</strong> {kpi.implication}
              </div>
              {kpi.note && (
                <div style={{ fontSize: 11, color: '#7C3AED', fontStyle: 'italic', marginTop: 4 }}>
                  📝 Note: {kpi.note}
                </div>
              )}
              <div style={{ fontSize: 10.5, color: '#A1A1AA', marginTop: 6, fontStyle: 'italic' }}>
                Referensi: {kpi.reference}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── D. STANDAR ─── */}
      {section === 'standar' && (
        <div className="space-y-3">
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.5 }}>
              <strong>📚 Reference Standards</strong> — Setiap formula dan threshold di app ini berdasar regulasi & best practice transit engineering. Semua dapat dipertanggungjawabkan.
            </div>
          </div>

          {/* Indonesia Standards */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8 }}>
            <div style={{ background: '#FFFBEB', padding: '10px 14px', borderBottom: '1px solid #FDE68A' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>🇮🇩 Standar Indonesia</span>
            </div>
            <div className="space-y-3" style={{ padding: 14 }}>
              {[
                {
                  ref: 'Permenhub PM 9/2020',
                  name: 'Buy The Service (BTS)',
                  scope: 'Skema kontrak pembelian layanan angkutan oleh pemerintah. Operator dibayar berdasarkan layanan yang diberikan (km tempuh, jam operasi), bukan jumlah penumpang.',
                  keyMetrics: 'Cost per VKM, ketersediaan armada, on-time performance',
                },
                {
                  ref: 'Permenhub PM 27/2015',
                  name: 'Standar Pelayanan Minimum (SPM) Angkutan Massal Berbasis Jalan',
                  scope: '7 dimensi pelayanan: Keamanan, Keselamatan, Kenyamanan, Keterjangkauan, Kesetaraan, Keteraturan, Lingkungan.',
                  keyMetrics: 'Headway ≤ 20 mnt, Load Factor ≤ 1.0, Akses prioritas',
                },
                {
                  ref: 'Permenhub PM 79/2013',
                  name: 'Pengaturan Waktu Kerja Pengemudi Angkutan Umum',
                  scope: 'Maks 8 jam/hari, maks 4 jam continuous, istirahat 30 menit setelah 4 jam continuous.',
                  keyMetrics: 'Compliance jam kerja, multi-shift requirement',
                },
                {
                  ref: 'UU 13/2003',
                  name: 'Undang-Undang Ketenagakerjaan',
                  scope: 'Pasal 77-85: 8 jam/hari × 5 hari ATAU 7 jam × 6 hari. Lembur dengan kompensasi.',
                  keyMetrics: 'Cost: gaji + lembur + tunjangan',
                },
                {
                  ref: 'KM 35/2003',
                  name: 'Penyelenggaraan Angkutan Orang di Jalan',
                  scope: 'Klasifikasi armada (kecil/sedang/besar), syarat operasional, kelayakan kendaraan.',
                  keyMetrics: 'Kapasitas bus, KIR berkala',
                },
              ].map((s, i) => (
                <div key={i} style={{ paddingLeft: 12, borderLeft: '3px solid #F59E0B' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>{s.ref}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TOKENS.textPrimary, marginTop: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 11.5, color: '#52525B', marginTop: 4, lineHeight: 1.5 }}>{s.scope}</div>
                  <div style={{ fontSize: 11, color: '#71717A', marginTop: 4, fontStyle: 'italic' }}>📊 Metrics: {s.keyMetrics}</div>
                </div>
              ))}
            </div>
          </div>

          {/* International Standards */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8 }}>
            <div style={{ background: '#EFF6FF', padding: '10px 14px', borderBottom: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>🌐 Standar Internasional</span>
            </div>
            <div className="space-y-3" style={{ padding: 14 }}>
              {[
                {
                  ref: 'TCQSM 3rd Edition (TCRP Report 165)',
                  name: 'Transit Capacity & Quality of Service Manual',
                  scope: 'Bible transit planning. Bus capacity (Section 6), service quality (Section 4), passenger comfort (LF Class A-F), reliability (CV).',
                  keyMetrics: 'Load Factor classification, Speed benchmarks, Reliability CV',
                },
                {
                  ref: 'TCRP Report 30 / 100',
                  name: 'Transit Scheduling: Basic and Advanced Manuals',
                  scope: 'Recovery time analysis, schedule reliability, fleet sizing methodology.',
                  keyMetrics: 'Recovery time, Schedule efficiency',
                },
                {
                  ref: 'ILO Convention C153',
                  name: 'Hours of Work in Road Transport',
                  scope: 'Internasional convention: max 9 jam driving, max 4 jam continuous, mandatory rest periods.',
                  keyMetrics: 'Driver shift compliance',
                },
                {
                  ref: 'ITDP BRT Standard',
                  name: 'Bus Rapid Transit Standard 2024',
                  scope: 'Scoring system untuk BRT corridor: Service Planning, Infrastructure, Stations, Communications, etc. Bronze/Silver/Gold rating.',
                  keyMetrics: 'BRT corridor ranking, Best practice benchmarking',
                },
                {
                  ref: 'APTA Best Practices',
                  name: 'American Public Transportation Association',
                  scope: 'Industry best practice library. Fleet productivity benchmarks, safety standards, operations management.',
                  keyMetrics: 'Bus utilization ≥ 75%, Cost per VKM benchmarks',
                },
              ].map((s, i) => (
                <div key={i} style={{ paddingLeft: 12, borderLeft: '3px solid #2563EB' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>{s.ref}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TOKENS.textPrimary, marginTop: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 11.5, color: '#52525B', marginTop: 4, lineHeight: 1.5 }}>{s.scope}</div>
                  <div style={{ fontSize: 11, color: '#71717A', marginTop: 4, fontStyle: 'italic' }}>📊 Metrics: {s.keyMetrics}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── E. GLOSARIUM ─── */}
      {section === 'glosarium' && (
        <div className="space-y-3">
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.5 }}>
              <strong>📖 Transit Engineering Glossary</strong> — Terminologi penting yang harus dipahami planner transit. Pemahaman terminologi = fondasi engineering.
            </div>
          </div>

          {[
            {
              term: 'Headway',
              definition: 'Interval waktu antara dua bus berturut-turut yang melewati satu titik (biasanya halte). Diukur dalam menit, dari sudut pandang penumpang yang menunggu.',
              note: 'Berbeda dengan Layover (waktu satu bus istirahat di terminal).',
            },
            {
              term: 'Cycle Time',
              definition: 'Waktu yang dibutuhkan satu bus untuk menyelesaikan satu putaran lengkap rute, termasuk layover di terminal. Untuk Loop: 1 cycle = 1 putaran. Untuk PP: 1 cycle = pulang-pergi (2 trip 1-arah).',
              note: 'Cycle = Service + Layover. Determinan utama headway minimum.',
            },
            {
              term: 'RTT (Round Trip Time)',
              definition: 'Waktu tempuh murni dari terminal awal kembali ke terminal awal (untuk PP), atau satu putaran loop (untuk Loop). EXCLUDE layover.',
              note: 'PP: RTT = 2 × Service Time. Loop: RTT = Service Time.',
            },
            {
              term: 'Service Time',
              definition: 'Waktu satu arah dari terminal awal ke terminal akhir, termasuk dwell di setiap halte tetapi tidak termasuk layover.',
              note: 'Service Time = Travel Time + Σ Dwell Time.',
            },
            {
              term: 'Layover',
              definition: 'Waktu bus istirahat di terminal sebelum dispatch berikutnya. Berfungsi sebagai recovery time (buffer untuk delay) dan rest period untuk sopir.',
              note: 'Untuk PP: layover ada di KEDUA terminal (asal & tujuan).',
            },
            {
              term: 'Dwell Time',
              definition: 'Waktu bus berhenti di halte untuk boarding/alighting penumpang. Tidak termasuk traffic light wait.',
              note: 'Pengaruh besar untuk total travel time. Optimasi: pre-paid boarding, multiple doors.',
            },
            {
              term: 'Trip',
              definition: 'Satu perjalanan bus dari titik awal ke titik akhir. Untuk Loop: 1 putaran loop = 1 trip. Untuk PP: 1 arah perjalanan = 1 trip (jadi 1 PP cycle = 2 trip).',
              note: 'Perlu dibedakan dengan "RIT" (cycle dispatch armada).',
            },
            {
              term: 'RIT',
              definition: 'Rotasi Internal Trip. Satu putaran lengkap dispatch armada (Bus#1 → Bus#2 → ... → Bus#N → kembali ke Bus#1). Konsep untuk tracking siklus armada.',
              note: 'Definisi spesifik aplikasi ini, mengikuti konvensi dispatcher Indonesia.',
            },
            {
              term: 'PHPDV',
              definition: 'Peak Hour Peak Direction Volume. Jumlah penumpang per jam pada arah tersibuk di jam puncak.',
              note: 'Metric kritis untuk kapasitas planning. Diestimasi dari survei OD atau ridership data.',
            },
            {
              term: 'Load Factor',
              definition: 'Rasio penumpang aktual terhadap kapasitas bus. LF = Demand ÷ Capacity. LF > 1 berarti penumpang berdiri.',
              note: 'TCQSM membagi LF ke Class A-F: A (≤0.5 excellent) hingga F (>1.5 crush load).',
            },
            {
              term: 'PVR (Peak Vehicle Requirement)',
              definition: 'Jumlah armada minimum yang dibutuhkan untuk memenuhi demand pada jam puncak.',
              note: 'PVR = ⌈Cycle ÷ Headway⌉. Bila demand tinggi, PVR ↑.',
            },
            {
              term: 'Recovery Time',
              definition: 'Waktu buffer di terminal untuk menyerap delay. Bagian dari layover.',
              note: 'Industry standard: 10-20% dari RTT. < 10% = risk bunching, > 30% = over-engineered.',
            },
            {
              term: 'Sisipan Armada',
              definition: 'Penambahan/pengurangan armada temporer pada periode tertentu untuk respond demand spike (event, peak hour, dll).',
              note: 'Di app ini: TIME-RANGE BASED, dapat span multiple periodes. Konsep mirip "tripper service" di transit US.',
            },
            {
              term: 'Bunching',
              definition: 'Fenomena 2 bus berdekatan (headway < target) akibat delay snowballing.',
              note: 'Penyebab: dwell time variability, traffic. Mitigasi: recovery time, dispatcher control.',
            },
            {
              term: 'Vehicle-Kilometer (VKM)',
              definition: 'Total jarak tempuh seluruh bus dalam satu unit waktu (biasanya per hari).',
              note: 'Determinan utama biaya BBM, ban, maintenance. Cost per VKM = total cost ÷ VKM.',
            },
            {
              term: 'Vehicle-Hour (VHR)',
              definition: 'Total jam operasi seluruh bus dalam satu unit waktu.',
              note: 'Determinan utama biaya gaji sopir. Cost per VHR = total cost ÷ VHR.',
            },
            {
              term: 'Farebox Recovery Ratio',
              definition: 'Rasio pendapatan tiket ÷ total biaya operasi. Indikator self-sufficiency.',
              note: 'BRT urban Indonesia: typically 40-70% (subsidi 30-60%). Singapore MRT: ~80%.',
            },
          ].map((g, i) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.brand, marginBottom: 4 }}>{g.term}</div>
              <div style={{ fontSize: 12, color: '#52525B', lineHeight: 1.5 }}>{g.definition}</div>
              <div style={{ fontSize: 11, color: '#A1A1AA', marginTop: 4, fontStyle: 'italic' }}>📝 {g.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Stat helper for Wawasan
const Stat = ({ label, value, unit, color, sub }) => (
  <div style={{ background: '#FFFFFF', borderRadius: 6, padding: '8px 10px', border: '1px solid #E4E4E7' }}>
    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#71717A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 700, color: color || '#18181B', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
      {value}{unit && <span style={{ fontSize: 10, color: '#71717A', marginLeft: 3, fontWeight: 500 }}>{unit}</span>}
    </div>
    {sub && <div style={{ fontSize: 10, color: '#71717A', marginTop: 2 }}>{sub}</div>}
  </div>
);

function TabPeakOffPeak({ route, updateRoute, defaultSection = 'periode' }) {
  const m = useMemo(() => calcMetrics(route), [route]);
  const sched = useMemo(() => generateSchedule(route, m), [route, m]);
  const buses = useMemo(() => generateBusUtilization(sched, route, m), [sched, route, m]);
  const [section, setSection] = useState(defaultSection); // 'periode' | 'sisipan' | 'status'
  const [onlyShowActive, setOnlyShowActive] = useState(true); // Default: focus on ON periodes only
  // Trip-based sisipan picker state
  // Picker state for sisipan armada (time-range based, hybrid UI)
  const [pickerMode, setPickerMode] = useState('quick');           // 'quick' (from periode) | 'manual' (time range)
  const [pickerPeriodKode, setPickerPeriodKode] = useState('');    // for quick mode
  const [pickerStart, setPickerStart] = useState('');               // 'HH:MM'
  const [pickerEnd, setPickerEnd] = useState('');                   // 'HH:MM'
  const [pickerDelta, setPickerDelta] = useState(0);
  const [pickerCustomHeadway, setPickerCustomHeadway] = useState('');
  const [pickerCatatan, setPickerCatatan] = useState('');
  const [pickerArmadaMode, setPickerArmadaMode] = useState('slot'); // 'slot' (default) | 'standby'
  const [pickerStrictHeadway, setPickerStrictHeadway] = useState(false); // false = clamp to physics, true = use customH as-is
  const [pickerEditingId, setPickerEditingId] = useState(null);    // id of sisipanArmada being edited
  // Legacy state kept for backward compat (not used in new flow)
  const [pickerTripId, setPickerTripId] = useState(null);
  // Status event form state
  const [formStatusBusId, setFormStatusBusId] = useState('');
  const [formStatusKind, setFormStatusKind] = useState('break');
  const [formStatusStart, setFormStatusStart] = useState('');
  const [formStatusEnd, setFormStatusEnd] = useState('');
  const [formStatusCatatan, setFormStatusCatatan] = useState('');
  const [editingEventId, setEditingEventId] = useState(null); // null = mode tambah, id = mode edit

  const updatePeriode = (kode, field, val) => {
    const next = route.periode.map(p => p.kode === kode ? { ...p, [field]: val } : p);
    updateRoute({ ...route, periode: next });
  };

  // Update jam window and auto-recompute durasi (in hours)
  // jam can wrap midnight (e.g., "22:30-05:00") → durasi = (24*60 - start) + end, else end - start
  const updateJamPeriode = (kode, startStr, endStr) => {
    const startMin = parseHM(startStr);
    const endMin = parseHM(endStr);
    let durasiMin;
    if (endMin > startMin) {
      durasiMin = endMin - startMin;
    } else if (endMin < startMin) {
      // wrap-midnight (e.g., 22:30-05:00)
      durasiMin = (24 * 60 - startMin) + endMin;
    } else {
      durasiMin = 0;
    }
    const durasi = +(durasiMin / 60).toFixed(2);
    const jam = `${startStr}-${endStr}`;
    const next = route.periode.map(p => p.kode === kode ? { ...p, jam, durasi } : p);
    updateRoute({ ...route, periode: next });
  };

  // ─── OBSERVASI: Compute baseline & impact stats ────────────────────────
  // Active periodes: gunakan route.armada > 0 sebagai indicator (single source of truth)
  const activePeriodes = route.periode.filter(p => p.on && p.kategori !== 'Tutup' && (Number(route.armada) || 0) > 0);
  // Sisipan total: agregasi dari sisipanArmada (slot + standby), bukan field legacy p.sisipan
  const totalSisipan = (route.sisipanArmada || []).reduce((s, sb) => s + (Number(sb.deltaArmada) || 0), 0);
  const periodesWithSisipan = route.periode.filter(p => p.on && (Number(p.sisipan) || 0) !== 0);
  const totalBusStatusOverrides = (route.busStatusEvents || []).length;
  // Recompute total durasi from jam string (don't trust stored p.durasi)
  const totalAktif = route.periode.filter(p => p.on && p.kategori !== 'Tutup').reduce((s, p) => {
    const m = String(p.jam || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!m) return s + (Number(p.durasi) || 0);
    const sM = parseInt(m[1])*60 + parseInt(m[2]);
    const eM = parseInt(m[3])*60 + parseInt(m[4]);
    const dur = (eM > sM ? eM - sM : eM < sM ? (24*60 - sM) + eM : 0) / 60;
    return s + dur;
  }, 0);
  const allHeadways = sched.ritGroups.map(g => g.headway).filter(h => isFinite(h));
  const minHeadway = allHeadways.length ? Math.min(...allHeadways) : 0;
  const maxHeadway = allHeadways.length ? Math.max(...allHeadways) : 0;
  const avgUtil = buses.filter(b => b.tripCount > 0).length > 0
    ? buses.filter(b => b.tripCount > 0).reduce((s, b) => s + b.utilizationPct, 0) / buses.filter(b => b.tripCount > 0).length
    : 0;

  // Data viz: Profile armada per period (24h) — use route.armada + sisipan overlap
  const armadaTotalRoute = Number(route.armada) || 0;
  const armadaProfile = route.periode.map(p => {
    if (!p.on || p.kategori === 'Tutup') return { kode: p.kode, jam: p.jam.split('-')[0], base: 0, effective: 0, kategori: p.kategori };
    // Find sisipan overlap (both slot + standby contribute to effective)
    const periodeM = String(p.jam || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!periodeM) return { kode: p.kode, jam: p.jam.split('-')[0], base: armadaTotalRoute, effective: armadaTotalRoute, kategori: p.kategori };
    const pStartM = parseInt(periodeM[1])*60 + parseInt(periodeM[2]);
    const pEndM = parseInt(periodeM[3])*60 + parseInt(periodeM[4]);
    const overlap = (route.sisipanArmada || []).filter(s =>
      Number(s.startMin) < pEndM && Number(s.endMin) > pStartM
    );
    const slotDelta = overlap.filter(s => (s.mode || 'slot') === 'slot').reduce((sum, s) => sum + (Number(s.deltaArmada) || 0), 0);
    const standbyDelta = overlap.filter(s => s.mode === 'standby').reduce((sum, s) => sum + (Number(s.deltaArmada) || 0), 0);
    return {
      kode: p.kode,
      jam: p.jam.split('-')[0],
      base: armadaTotalRoute,
      effective: armadaTotalRoute + slotDelta + standbyDelta,
      kategori: p.kategori,
    };
  });

  return (
    <div className="space-y-4">

      {/* OBSERVATION STRIP — Show current state before user edits */}
      <div style={{ background: '#F4F4F5', border: '1px solid #E4E4E7', borderRadius: 8, padding: '14px 16px' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <span style={{ fontSize: 10, fontWeight: 700, color: '#52525B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Observasi Saat Ini</span>
          <span style={{ fontSize: 11, color: '#71717A', fontStyle: 'italic' }}>— ringkasan dampak dari kebijakan yg sedang berlaku</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { label: 'Periode Aktif', value: activePeriodes.length, sub: `dari ${route.periode.length} preset (${fmtDurH(totalAktif)})` },
            { label: 'Bus Beroperasi', value: sched.totalBuses, sub: `dari ${route.armada} unit dikonfigurasi` },
            { label: 'Sisipan Armada', value: (totalSisipan >= 0 ? '+' : '') + totalSisipan, sub: `${periodesWithSisipan.length} periode di-override` },
            { label: 'Status Events', value: totalBusStatusOverrides, sub: `event aktif` },
            { label: 'Headway Range', value: `${fmtNum(minHeadway, 1)}–${fmtNum(maxHeadway, 1)}m`, sub: `avg utilisasi ${fmtPct(avgUtil, 0)}` },
          ].map((item, i) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: 9.5, color: '#71717A', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.label}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#18181B', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginTop: 2, lineHeight: 1.1 }}>{item.value}</div>
              <div style={{ fontSize: 10.5, color: '#71717A', marginTop: 3 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION TABS */}
      <div style={{ borderBottom: '1px solid #E4E4E7' }}>
        <div className="flex gap-1 flex-wrap">
          {[
            { key: 'periode', label: 'Periode Operasi', desc: 'kapan bus beroperasi' },
            { key: 'sisipan', label: 'Sisipan Armada', desc: 'penambahan/pengurangan bus per periode' },
            { key: 'status', label: 'Status per Bus', desc: 'kondisi tiap unit (Break/Service/Standby/OFF)' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              style={{
                padding: '9px 14px 10px', fontSize: 12.5, fontWeight: section === s.key ? 600 : 500,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: section === s.key ? '#047857' : '#52525B',
                borderBottom: `2px solid ${section === s.key ? '#047857' : 'transparent'}`,
                marginBottom: -1, textAlign: 'left',
              }}
            >
              {s.label}
              <div style={{ fontSize: 10, color: section === s.key ? '#047857' : '#A1A1AA', fontWeight: 400, marginTop: 1 }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>

        {/* ─── SECTION A: PERIODE OPERASI ─────────────────────────── */}
        {section === 'periode' && (
          <div className="space-y-4">
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '12px 14px', fontSize: 12, color: '#1E40AF', lineHeight: 1.55 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Periode = Label Waktu Kontekstual</div>
              <div>
                Periode (Peak/Off-Peak/Break/Late/dll) adalah <strong>pembagian waktu</strong> dalam hari operasi yang membantu mengidentifikasi <strong>konteks setiap trip</strong>.
                Atur cukup: <strong>jam, nama, kategori, dan toggle ON/OFF</strong>.
                <br/>Jumlah armada per periode <strong>otomatis = Armada Rute ({route.armada})</strong> — atur di drawer Rute & Halte.
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: '#1E3A8A', opacity: 0.85 }}>
                💡 Untuk variasi armada per waktu (mis. tambah bus saat peak), gunakan tab <strong>Sisipan Armada</strong>. Untuk status individual bus (break/service), gunakan tab <strong>Status per Bus</strong>.
              </div>
            </div>

            <div className="flex items-center justify-between" style={{ marginBottom: -4 }}>
              <div style={{ fontSize: 11, color: '#52525B' }}>
                <strong style={{ color: '#18181B', fontWeight: 600 }}>{route.periode.filter(p => p.on).length}</strong> dari {route.periode.length} periode aktif
              </div>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: 11.5, color: '#52525B' }}>
                <input
                  type="checkbox"
                  checked={onlyShowActive}
                  onChange={e => setOnlyShowActive(e.target.checked)}
                  style={{ accentColor: '#047857', cursor: 'pointer' }}
                />
                Tampilkan hanya yang ON
              </label>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
              <table className="w-full" style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E4E4E7' }}>
                    {['Kode', 'Jam', 'Nama Periode', 'Kategori', 'On', 'Armada', 'Headway Est.', 'Trip Est.', 'Durasi'].map((h, i) => (
                      <th key={i} className={`py-2.5 px-3 text-${i >= 5 ? 'right' : i === 4 ? 'center' : 'left'}`} style={{ fontSize: 10, fontWeight: 600, color: '#71717A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {route.periode.filter(p => onlyShowActive ? p.on : true).map((p, idx, arr) => {
                    // ── Recompute durasi from jam string (don't trust stored value, may be stale) ──
                    const [jStart, jEnd] = (p.jam || '00:00-00:00').split('-');
                    const sMin = parseHM(jStart);
                    const eMin = parseHM(jEnd);
                    let durMin;
                    if (eMin > sMin) durMin = eMin - sMin;
                    else if (eMin < sMin) durMin = (24 * 60 - sMin) + eMin; // wrap midnight
                    else durMin = 0;
                    const computedDurasi = durMin / 60; // in hours
                    // ── Account for slot AND standby sisipan covering this periode ──
                    const armadaBase = p.on && p.kategori !== 'Tutup' ? (Number(route.armada) || 0) : 0;
                    // Find sisipan overlapping this periode time range (slot + standby both contribute to effective freq)
                    const periodeOverlapping = (route.sisipanArmada || []).filter(s =>
                      armadaBase > 0 && Number(s.startMin) < eMin && Number(s.endMin) > sMin
                    );
                    const slotPeriodOverlap = periodeOverlapping.filter(s => (s.mode || 'slot') === 'slot');
                    const standbyPeriodOverlap = periodeOverlapping.filter(s => s.mode === 'standby');
                    const slotDelta = slotPeriodOverlap.reduce((sum, s) => sum + (Number(s.deltaArmada) || 0), 0);
                    const standbyDeltaP = standbyPeriodOverlap.reduce((sum, s) => sum + (Number(s.deltaArmada) || 0), 0);
                    const armadaWithSlot = Math.max(0, armadaBase + slotDelta);
                    const headwayBase = armadaBase > 0 && m.cycleTime > 0 ? m.cycleTime / armadaBase : 0;
                    const headwayWithSlot = armadaWithSlot > 0 && m.cycleTime > 0 ? m.cycleTime / armadaWithSlot : 0;
                    // For standby: account for its custom interval if set
                    let headwayP = headwayWithSlot;
                    if (standbyDeltaP > 0 && headwayWithSlot > 0 && m.cycleTime > 0) {
                      // Per standby sisipan, compute effective combined rate
                      const baseRate = 1 / headwayWithSlot;
                      let standbyRate = 0;
                      for (const sb of standbyPeriodOverlap) {
                        const physicsMinInterval = m.cycleTime / Number(sb.deltaArmada);
                        const sbInterval = (Number(sb.customHeadway) || 0) > 0
                          ? Math.max(Number(sb.customHeadway), physicsMinInterval)
                          : physicsMinInterval;
                        standbyRate += 1 / sbInterval;
                      }
                      headwayP = 1 / (baseRate + standbyRate);
                    }
                    const hasSisipanOverlap = slotDelta !== 0 || standbyDeltaP !== 0;
                    // ── Trip est = dispatch count in periode duration ──
                    // For PP each dispatch produces 2 trips (berangkat+pulang), Loop = 1 trip
                    const dispatchesP = p.on && headwayP > 0 ? Math.round(durMin / headwayP) : 0;
                    const tripP = m.isPP ? dispatchesP * 2 : dispatchesP;
                    const pal = {
                      'Peak':     { bg: '#FEF2F2', text: '#991B1B' },
                      'Off-Peak': { bg: '#ECFDF5', text: '#065F46' },
                      'Pre-Peak': { bg: '#FFFBEB', text: '#92400E' },
                      'Transisi': { bg: '#FFFBEB', text: '#92400E' },
                      'Break':    { bg: '#EFF6FF', text: '#1E40AF' },
                      'Late':     { bg: '#F5F3FF', text: '#5B21B6' },
                      'Tutup':    { bg: '#F4F4F5', text: '#52525B' },
                    }[p.kategori] || { bg: '#F4F4F5', text: '#52525B' };
                    const [jamStart, jamEnd] = (p.jam || '00:00-00:00').split('-');
                    return (
                      <tr key={p.kode} style={{ borderBottom: idx < arr.length - 1 ? '1px solid #F4F4F5' : 'none', opacity: p.on ? 1 : 0.5, background: p.on ? 'transparent' : '#FAFAFA' }}>
                        <td className="py-2 px-3" style={{ fontFamily: 'ui-monospace, monospace', color: '#71717A', fontSize: 11 }}>{p.kode}</td>
                        {/* JAM — dual time inputs */}
                        <td className="py-1.5 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={jamStart}
                              onChange={e => updateJamPeriode(p.kode, e.target.value, jamEnd)}
                              style={{ width: 78, padding: '3px 6px', border: '1px solid #E4E4E7', borderRadius: 4, fontSize: 11.5, fontVariantNumeric: 'tabular-nums', color: '#18181B', background: '#FFFFFF', outline: 'none' }}
                            />
                            <span style={{ color: '#A1A1AA', fontSize: 11 }}>–</span>
                            <input
                              type="time"
                              value={jamEnd}
                              onChange={e => updateJamPeriode(p.kode, jamStart, e.target.value)}
                              style={{ width: 78, padding: '3px 6px', border: '1px solid #E4E4E7', borderRadius: 4, fontSize: 11.5, fontVariantNumeric: 'tabular-nums', color: '#18181B', background: '#FFFFFF', outline: 'none' }}
                            />
                          </div>
                        </td>
                        {/* NAMA — text input */}
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={p.nama}
                            onChange={e => updatePeriode(p.kode, 'nama', e.target.value)}
                            style={{ width: '100%', minWidth: 160, padding: '3px 6px', border: '1px solid transparent', borderRadius: 4, fontSize: 12, color: '#18181B', background: 'transparent', outline: 'none' }}
                            onFocus={e => { e.target.style.border = '1px solid #047857'; e.target.style.background = '#FFFFFF'; }}
                            onBlur={e => { e.target.style.border = '1px solid transparent'; e.target.style.background = 'transparent'; }}
                          />
                        </td>
                        {/* KATEGORI — dropdown */}
                        <td className="py-1.5 px-3">
                          <select
                            value={p.kategori}
                            onChange={e => updatePeriode(p.kode, 'kategori', e.target.value)}
                            style={{
                              padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                              background: pal.bg, color: pal.text,
                              border: 'none', outline: 'none', cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            {['Peak','Off-Peak','Pre-Peak','Transisi','Break','Late','Tutup'].map(k => (
                              <option key={k} value={k} style={{ background: '#FFFFFF', color: '#18181B' }}>{k.toUpperCase()}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => {
                              const newOn = !p.on;
                              const next = route.periode.map(pp => pp.kode === p.kode ? { ...pp, on: newOn, armadaPeriode: newOn ? (pp.armadaPeriode || route.armada) : 0 } : pp);
                              updateRoute({ ...route, periode: next });
                            }}
                            style={{
                              width: 36, height: 20, borderRadius: 10, position: 'relative',
                              background: p.on ? '#047857' : '#D4D4D8', border: 'none', cursor: 'pointer',
                              transition: 'background 0.15s',
                            }}
                          >
                            <span style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', transition: 'transform 0.15s', transform: p.on ? 'translateX(18px)' : 'translateX(2px)' }} />
                          </button>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span title="Auto dari Armada Rute (ubah di drawer Rute & Halte)" style={{
                            display: 'inline-block',
                            minWidth: 56, padding: '4px 8px', textAlign: 'right',
                            border: `1px dashed ${TOKENS.border}`, borderRadius: 4,
                            fontSize: 12, fontVariantNumeric: 'tabular-nums',
                            color: p.on ? TOKENS.textPrimary : '#A1A1AA',
                            background: p.on ? TOKENS.surfaceMuted : '#FAFAFA',
                            fontStyle: p.on ? 'normal' : 'italic',
                          }}>
                            {p.on ? (Number(route.armada) || 0) : 0}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right" style={{ color: '#52525B' }}>
                          {p.on && headwayP > 0 ? (
                            hasSisipanOverlap ? (() => {
                              const parts = [];
                              if (slotDelta !== 0) parts.push(`slot ${slotDelta > 0 ? '+' : ''}${slotDelta}`);
                              if (standbyDeltaP > 0) {
                                const stbDescs = standbyPeriodOverlap.map(sb => {
                                  const customH = Number(sb.customHeadway) || 0;
                                  return customH > 0 ? `+${sb.deltaArmada} @${customH}m` : `+${sb.deltaArmada}`;
                                });
                                parts.push(`standby ${stbDescs.join(', ')}`);
                              }
                              return (
                                <span title={`Baseline: ${fmtNum(headwayBase, 1)}m → Effective: ${fmtNum(headwayP, 1)}m\n(${parts.join('; ')})`}>
                                  <span style={{ color: '#065F46', fontWeight: 600 }}>{fmtNum(headwayP, 1)}m</span>
                                  <span style={{ fontSize: 9, color: TOKENS.textMuted, marginLeft: 4, textDecoration: 'line-through' }}>{fmtNum(headwayBase, 1)}m</span>
                                </span>
                              );
                            })() : (
                              `${fmtNum(headwayP, 1)}m`
                            )
                          ) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right" style={{ color: '#047857', fontWeight: 600 }}>{tripP || '—'}</td>
                        <td className="py-2 px-3 text-right" style={{ color: '#71717A', fontSize: 11 }}>{computedDurasi > 0 ? fmtJamMenit(computedDurasi) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── SECTION B: SISIPAN ARMADA (TIME-RANGE BASED, HYBRID UI) ─────── */}
        {section === 'sisipan' && (() => {
          const sisipanList = route.sisipanArmada || [];

          // Auto-fill from periode (Quick mode)
          const onPickPeriode = (kode) => {
            setPickerPeriodKode(kode);
            const p = (route.periode || []).find(pp => pp.kode === kode);
            if (p && p.jam) {
              const m = String(p.jam).match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
              if (m) {
                setPickerStart(`${m[1].padStart(2,'0')}:${m[2]}`);
                setPickerEnd(`${m[3].padStart(2,'0')}:${m[4]}`);
              }
            }
          };

          // Reset form
          const resetForm = () => {
            setPickerPeriodKode('');
            setPickerStart('');
            setPickerEnd('');
            setPickerDelta(0);
            setPickerCustomHeadway('');
            setPickerCatatan('');
            setPickerEditingId(null);
          };

          // Validation
          const startMin = pickerStart && pickerStart.match(/^\d{2}:\d{2}$/) ? parseHM(pickerStart) : null;
          const endMin = pickerEnd && pickerEnd.match(/^\d{2}:\d{2}$/) ? parseHM(pickerEnd) : null;
          const isValid = startMin !== null && endMin !== null && endMin > startMin && (Number(pickerDelta) !== 0 || (pickerCustomHeadway && Number(pickerCustomHeadway) > 0));
          const validRangeError = startMin !== null && endMin !== null && endMin <= startMin;
          const durationMin = startMin !== null && endMin !== null && endMin > startMin ? endMin - startMin : 0;

          // Detect periodes that this range will span (informational)
          const spanningPeriodes = (startMin !== null && endMin !== null && endMin > startMin)
            ? (route.periode || []).filter(p => {
                if (!p.on || p.kategori === 'Tutup') return false;
                const m = String(p.jam || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
                if (!m) return false;
                const pStart = parseInt(m[1])*60 + parseInt(m[2]);
                const pEnd = parseInt(m[3])*60 + parseInt(m[4]);
                return pStart < endMin && pEnd > startMin;
              })
            : [];

          // Auto-headway preview based on first spanning periode (rough estimate)
          const refPeriode = spanningPeriodes[0];
          const baseArmada = refPeriode ? Number(refPeriode.armadaPeriode) || 0 : 0;
          const newEffArmada = Math.max(0, baseArmada + (Number(pickerDelta) || 0));
          const baseHeadway = baseArmada > 0 && m.cycleTime > 0 ? m.cycleTime / baseArmada : 0;
          const newAutoHeadway = newEffArmada > 0 && m.cycleTime > 0 ? m.cycleTime / newEffArmada : 0;
          const effectiveNewHeadway = pickerCustomHeadway && Number(pickerCustomHeadway) > 0
            ? Number(pickerCustomHeadway)
            : newAutoHeadway;

          // Apply (add new or update existing)
          const applySisipan = () => {
            if (!isValid) return;
            const sisipan = {
              id: pickerEditingId || (sisipanList.reduce((mx, s) => Math.max(mx, s.id || 0), 0) + 1),
              startMin,
              endMin,
              deltaArmada: Number(pickerDelta) || 0,
              customHeadway: pickerCustomHeadway && Number(pickerCustomHeadway) > 0 ? Number(pickerCustomHeadway) : 0,
              mode: pickerArmadaMode,
              strictHeadway: !!pickerStrictHeadway, // true = bypass physics clamp
              catatan: pickerCatatan || '',
            };
            const next = pickerEditingId
              ? sisipanList.map(s => s.id === pickerEditingId ? sisipan : s)
              : [...sisipanList, sisipan];
            updateRoute({ ...route, sisipanArmada: next });
            // After apply: keep delta+headway+catatan+mode for chained-add, clear range/edit
            setPickerPeriodKode('');
            setPickerStart('');
            setPickerEnd('');
            setPickerEditingId(null);
            // Clear catatan only if was editing (avoid carrying old context)
            if (pickerEditingId) setPickerCatatan('');
          };

          // Edit existing
          const loadForEdit = (id) => {
            const target = sisipanList.find(s => s.id === id);
            if (!target) return;
            setPickerEditingId(id);
            setPickerStart(fmtHM(target.startMin));
            setPickerEnd(fmtHM(target.endMin));
            setPickerDelta(target.deltaArmada);
            setPickerCustomHeadway((Number(target.customHeadway) || 0) > 0 ? String(target.customHeadway) : '');
            setPickerCatatan(target.catatan || '');
            setPickerArmadaMode(target.mode === 'standby' ? 'standby' : 'slot');
            setPickerStrictHeadway(!!target.strictHeadway);
            // Try to detect if range matches a periode → set quick mode + periode
            const matchedPeriode = (route.periode || []).find(p => {
              const m = String(p.jam || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
              if (!m) return false;
              const pStart = parseInt(m[1])*60 + parseInt(m[2]);
              const pEnd = parseInt(m[3])*60 + parseInt(m[4]);
              return pStart === target.startMin && pEnd === target.endMin;
            });
            if (matchedPeriode) {
              setPickerMode('quick');
              setPickerPeriodKode(matchedPeriode.kode);
            } else {
              setPickerMode('manual');
              setPickerPeriodKode('');
            }
            setTimeout(() => {
              const el = document.getElementById('sisipan-form-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          };

          // Remove
          const removeOverride = (id) => {
            const next = sisipanList.filter(s => s.id !== id);
            updateRoute({ ...route, sisipanArmada: next });
            if (pickerEditingId === id) setPickerEditingId(null);
          };

          const isEditing = pickerEditingId !== null;

          return (
            <div className="space-y-4">
              {/* HELP BANNER */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                <strong style={{ fontWeight: 600 }}>Sisipan Armada (Time-Range Based)</strong> — definisikan deployment armada tambahan/pengurangan dengan rentang waktu independent dari periode boundary. Sisipan dapat span multiple periodes, overlap satu sama lain (additive), dan tidak terbatas pada kategori Peak/Off-Peak.
                <div style={{ marginTop: 4, fontSize: 11, color: '#A16207' }}>
                  💡 Tip: gunakan <strong>Quick from Periode</strong> untuk auto-fill dari periode yang ada, atau <strong>Manual Time Range</strong> untuk custom range.
                </div>
              </div>

              {/* FORM ANCHOR */}
              <div id="sisipan-form-anchor" />

              {/* MAIN FORM */}
              <div style={{
                background: isEditing ? '#F5F3FF' : '#FFFFFF',
                border: `1px solid ${isEditing ? '#C4B5FD' : '#E4E4E7'}`,
                borderRadius: 8, padding: 16,
              }}>
                {/* MODE TOGGLE */}
                <div className="flex items-center gap-2 mb-4">
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {isEditing ? '✏️ Edit Sisipan' : '+ Tambah Sisipan'}
                  </span>
                  <div className="inline-flex items-center" style={{ background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: 6, padding: 2, marginLeft: 'auto' }}>
                    {[
                      { key: 'quick',  label: '📍 Quick from Periode', desc: 'Pick periode → auto-fill range' },
                      { key: 'manual', label: '⏰ Manual Range',       desc: 'Set start/end time manually' },
                    ].map(mode => (
                      <button
                        key={mode.key}
                        onClick={() => setPickerMode(mode.key)}
                        title={mode.desc}
                        style={{
                          padding: '4px 10px', fontSize: 11, fontWeight: pickerMode === mode.key ? 600 : 500,
                          background: pickerMode === mode.key ? '#FFFFFF' : 'transparent',
                          color: pickerMode === mode.key ? '#18181B' : '#71717A',
                          border: 'none', borderRadius: 4, cursor: 'pointer',
                          boxShadow: pickerMode === mode.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QUICK MODE: Pick from Periode */}
                {pickerMode === 'quick' && (
                  <div className="space-y-3">
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        ① Pilih Periode (Auto-Fill Range)
                      </label>
                      <select
                        value={pickerPeriodKode}
                        onChange={e => onPickPeriode(e.target.value)}
                        style={{
                          width: '100%', padding: '8px 12px', fontSize: 12,
                          border: '1px solid #D4D4D8', borderRadius: 6, background: '#FFFFFF',
                          color: '#18181B', outline: 'none',
                        }}
                      >
                        <option value="">— Pilih periode untuk auto-fill —</option>
                        {(route.periode || []).filter(p => p.on && p.kategori !== 'Tutup').map(p => {
                          const pal = PERIOD_PALETTE[p.kategori] || PERIOD_PALETTE.Tutup;
                          return (
                            <option key={p.kode} value={p.kode}>
                              {p.kode} · {p.jam} · {p.nama} ({p.kategori})
                            </option>
                          );
                        })}
                      </select>
                      <div style={{ fontSize: 10.5, color: '#71717A', marginTop: 4 }}>
                        Range akan auto-fill dari periode. Anda bisa adjust manual setelahnya.
                      </div>
                    </div>
                  </div>
                )}

                {/* TIME RANGE INPUTS (both modes use same inputs) */}
                <div className={pickerMode === 'quick' ? 'mt-3' : ''}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    {pickerMode === 'quick' ? '② Adjust Range (Optional)' : '① Set Time Range'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={pickerStart}
                      onChange={e => { setPickerStart(e.target.value); if (pickerMode === 'quick') setPickerPeriodKode(''); }}
                      style={{
                        flex: 1, padding: '7px 10px', fontSize: 12,
                        border: `1px solid ${validRangeError ? '#DC2626' : '#D4D4D8'}`,
                        borderRadius: 6, background: '#FFFFFF',
                        fontVariantNumeric: 'tabular-nums', outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#71717A' }}>—</span>
                    <input
                      type="time"
                      value={pickerEnd}
                      onChange={e => { setPickerEnd(e.target.value); if (pickerMode === 'quick') setPickerPeriodKode(''); }}
                      style={{
                        flex: 1, padding: '7px 10px', fontSize: 12,
                        border: `1px solid ${validRangeError ? '#DC2626' : '#D4D4D8'}`,
                        borderRadius: 6, background: '#FFFFFF',
                        fontVariantNumeric: 'tabular-nums', outline: 'none',
                      }}
                    />
                    {durationMin > 0 && (
                      <span style={{ fontSize: 11, color: '#52525B', minWidth: 90, textAlign: 'right' }}>
                        Durasi: <strong>{fmtDurH(durationMin / 60)}</strong>
                      </span>
                    )}
                  </div>
                  {validRangeError && (
                    <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>
                      ⚠ Waktu akhir harus setelah waktu awal
                    </div>
                  )}
                  {/* Spanning periodes info */}
                  {spanningPeriodes.length > 0 && (
                    <div style={{ fontSize: 11, color: '#52525B', marginTop: 6, padding: '6px 10px', background: '#F4F4F5', borderRadius: 4 }}>
                      📍 Range akan span {spanningPeriodes.length} periode: {spanningPeriodes.map(p => `${p.kode} (${p.kategori})`).join(' · ')}
                    </div>
                  )}
                </div>

                {/* DELTA */}
                <div className="mt-3">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    {pickerMode === 'quick' ? '③' : '②'} Delta Armada (+ tambah / − kurangi)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPickerDelta((Number(pickerDelta) || 0) - 1)}
                      style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #D4D4D8', background: '#FFFFFF', cursor: 'pointer', fontSize: 18, fontWeight: 600, color: '#18181B' }}
                    >−</button>
                    <input
                      type="number"
                      value={pickerDelta}
                      onChange={e => setPickerDelta(Number(e.target.value) || 0)}
                      style={{ width: 80, padding: '7px 10px', fontSize: 14, fontWeight: 600, textAlign: 'center', border: '1px solid #D4D4D8', borderRadius: 6, fontVariantNumeric: 'tabular-nums', outline: 'none' }}
                    />
                    <button
                      onClick={() => setPickerDelta((Number(pickerDelta) || 0) + 1)}
                      style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #D4D4D8', background: '#FFFFFF', cursor: 'pointer', fontSize: 18, fontWeight: 600, color: '#18181B' }}
                    >+</button>
                    <span style={{ fontSize: 12, color: '#52525B', marginLeft: 8 }}>
                      {Number(pickerDelta) > 0 ? `+${pickerDelta} bus tambahan` : Number(pickerDelta) < 0 ? `${pickerDelta} bus dikurangi` : 'Tanpa perubahan armada'}
                    </span>
                  </div>
                </div>

                {/* MODE SELECTOR — Slot vs Standby (only for additions, deltaArmada > 0) */}
                {Number(pickerDelta) > 0 && (
                  <div className="mt-3">
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      {pickerMode === 'quick' ? '③ⓑ' : '②ⓑ'} Mode Penambahan Armada
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        {
                          key: 'slot',
                          icon: '◧',
                          title: 'Slot',
                          subtitle: 'Recalc headway',
                          desc: 'Bus tambahan masuk rotation, headway dipendekkan, semua trip realign ke grid baru. Untuk planning kapasitas.',
                          activeBg: '#EFF6FF', activeBorder: '#3B8BD4', activeText: '#0C447C',
                        },
                        {
                          key: 'standby',
                          icon: '✦',
                          title: 'Standby',
                          subtitle: 'Tambah trip ekstra',
                          desc: 'Bus tambahan dispatch antara grid regular tanpa shift jadwal lain. Custom Headway = interval dispatch standby (clamp ke physics).',
                          activeBg: '#ECFDF5', activeBorder: '#1D9E75', activeText: '#04342C',
                        },
                      ].map(opt => {
                        const isActive = pickerArmadaMode === opt.key;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => setPickerArmadaMode(opt.key)}
                            style={{
                              padding: '10px 12px', textAlign: 'left',
                              border: `1.5px solid ${isActive ? opt.activeBorder : TOKENS.border}`,
                              borderRadius: 6,
                              background: isActive ? opt.activeBg : TOKENS.surface,
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <span style={{ fontSize: 16 }}>{opt.icon}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? opt.activeText : TOKENS.textPrimary }}>{opt.title}</span>
                              <span style={{ fontSize: 10, color: isActive ? opt.activeText : TOKENS.textMuted, opacity: 0.7 }}>· {opt.subtitle}</span>
                            </div>
                            <div style={{ fontSize: 10.5, color: isActive ? opt.activeText : TOKENS.textMuted, lineHeight: 1.45 }}>
                              {opt.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CUSTOM HEADWAY */}
                <div className="mt-3">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    {pickerMode === 'quick' ? '④' : '③'} Custom Headway (Opsional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Auto"
                      value={pickerCustomHeadway}
                      onChange={e => setPickerCustomHeadway(e.target.value)}
                      style={{ width: 100, padding: '7px 10px', fontSize: 12, border: '1px solid #D4D4D8', borderRadius: 6, fontVariantNumeric: 'tabular-nums', outline: 'none' }}
                    />
                    <span style={{ fontSize: 12, color: '#52525B' }}>menit</span>
                    {pickerCustomHeadway && Number(pickerCustomHeadway) > 0 && (
                      <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 500, marginLeft: 8 }}>
                        ⚡ Override headway → {Number(pickerCustomHeadway)} mnt (dari auto {fmtNum(newAutoHeadway, 1)} mnt)
                      </span>
                    )}
                    {(!pickerCustomHeadway || Number(pickerCustomHeadway) === 0) && newAutoHeadway > 0 && (
                      <span style={{ fontSize: 11, color: '#52525B', marginLeft: 8 }}>
                        Auto (dari armada): {fmtNum(newAutoHeadway, 1)} mnt
                      </span>
                    )}
                  </div>
                  {/* PHYSICS CLAMP TOGGLE — relevant when customH set */}
                  {pickerCustomHeadway && Number(pickerCustomHeadway) > 0 && (() => {
                    const physicsMin = pickerArmadaMode === 'standby' && Number(pickerDelta) > 0
                      ? (m.cycleTime / Number(pickerDelta))
                      : (m.cycleTime / Math.max(1, route.armada + Number(pickerDelta)));
                    const customHTooTight = Number(pickerCustomHeadway) < physicsMin;
                    return (
                      <div style={{ marginTop: 8, padding: '8px 10px', background: customHTooTight ? '#FEF3C7' : '#F4F4F5', border: `1px solid ${customHTooTight ? '#F59E0B' : '#E4E4E7'}`, borderRadius: 5 }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={pickerStrictHeadway}
                            onChange={e => setPickerStrictHeadway(e.target.checked)}
                            style={{ marginTop: 2, accentColor: '#047857', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: customHTooTight ? '#92400E' : '#3F3F46' }}>
                              Bypass Physics Clamp (strict mode)
                            </div>
                            <div style={{ fontSize: 10.5, color: customHTooTight ? '#854F0B' : '#71717A', marginTop: 2, lineHeight: 1.4 }}>
                              {pickerArmadaMode === 'standby' ? (
                                <>Default OFF: customH dibatasi physics minimum (cycleTime/standby = <strong>{fmtNum(physicsMin, 1)}m</strong>) supaya bus selesai cycle dulu sebelum dispatch lagi. ON: customH dipakai langsung walau {customHTooTight ? <span style={{ color: '#92400E', fontWeight: 600 }}>{Number(pickerCustomHeadway)}m &lt; {fmtNum(physicsMin, 1)}m physics min — schedule mungkin tidak realistis</span> : 'lebih ketat dari physics'}.</>
                              ) : (
                                <>Slot mode: dispatcher implicitly delay bus jika customH terlalu ketat. Toggle ON untuk strict customH walau bus belum kembali (physics min slot mode = <strong>{fmtNum(physicsMin, 1)}m</strong>).</>
                              )}
                            </div>
                            {customHTooTight && (
                              <div style={{ fontSize: 10, color: '#92400E', marginTop: 4, fontStyle: 'italic' }}>
                                ⚠ customH ({Number(pickerCustomHeadway)}m) &lt; physics min ({fmtNum(physicsMin, 1)}m) — mode {pickerStrictHeadway ? 'STRICT (bypass)' : 'CLAMPED (safe)'}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })()}
                </div>

                {/* CATATAN */}
                <div className="mt-3">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#52525B', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    {pickerMode === 'quick' ? '⑤' : '④'} Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="contoh: acara konser, bus rusak, demand spike..."
                    value={pickerCatatan}
                    onChange={e => setPickerCatatan(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid #D4D4D8', borderRadius: 6, outline: 'none' }}
                  />
                </div>

                {/* PREVIEW */}
                {isValid && (
                  <div className="mt-4" style={{ padding: '10px 14px', background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 6, fontSize: 12, color: '#065F46' }}>
                    <strong>✓ Preview:</strong> Sisipan akan diterapkan dari <strong>{pickerStart}</strong> hingga <strong>{pickerEnd}</strong>
                    {Number(pickerDelta) !== 0 && (
                      <> dengan delta <strong>{pickerDelta > 0 ? '+' : ''}{pickerDelta} bus</strong></>
                    )}
                    {pickerCustomHeadway && Number(pickerCustomHeadway) > 0 && (
                      <> dan custom headway <strong>{Number(pickerCustomHeadway)} mnt</strong></>
                    )}
                    {spanningPeriodes.length > 1 && (
                      <span style={{ display: 'block', marginTop: 4, color: '#047857', fontSize: 11 }}>
                        ⭐ Span {spanningPeriodes.length} periodes — sisipan akan continuous melampaui periode boundary
                      </span>
                    )}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={applySisipan}
                    disabled={!isValid}
                    style={{
                      padding: '8px 16px', fontSize: 13, fontWeight: 600,
                      background: isValid ? (isEditing ? '#7C3AED' : '#047857') : '#D4D4D8',
                      color: '#FFFFFF', border: 'none', borderRadius: 6,
                      cursor: isValid ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {isEditing ? 'Update Sisipan' : 'Tambah Sisipan'}
                  </button>
                  <button
                    onClick={resetForm}
                    style={{ padding: '8px 16px', fontSize: 13, background: 'transparent', color: '#71717A', border: '1px solid #E4E4E7', borderRadius: 6, cursor: 'pointer' }}
                  >
                    {isEditing ? 'Batal Edit' : 'Reset Form'}
                  </button>
                </div>
              </div>

              {/* ACTIVE SISIPAN LIST */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: '#FAFAFA', padding: '10px 14px', borderBottom: '1px solid #E4E4E7' }} className="flex items-center justify-between">
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Sisipan Aktif ({sisipanList.length})
                  </span>
                  {sisipanList.length > 0 && (
                    <button
                      onClick={() => updateRoute({ ...route, sisipanArmada: [] })}
                      style={{ fontSize: 11, color: '#DC2626', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >Hapus semua</button>
                  )}
                </div>
                {sisipanList.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#A1A1AA', fontSize: 12 }}>
                    Belum ada sisipan aktif. Gunakan form di atas untuk menambah.
                  </div>
                ) : (
                  <div>
                    {sisipanList.sort((a, b) => a.startMin - b.startMin).map((s, idx) => {
                      const sis = Number(s.deltaArmada) || 0;
                      const cust = Number(s.customHeadway) || 0;
                      // Detect spanning periodes for display
                      const spanPeriodes = (route.periode || []).filter(p => {
                        if (!p.on || p.kategori === 'Tutup') return false;
                        const m = String(p.jam || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
                        if (!m) return false;
                        const pStart = parseInt(m[1])*60 + parseInt(m[2]);
                        const pEnd = parseInt(m[3])*60 + parseInt(m[4]);
                        return pStart < s.endMin && pEnd > s.startMin;
                      });
                      const isThisEditing = pickerEditingId === s.id;
                      return (
                        <div
                          key={s.id}
                          className="flex items-center gap-3"
                          style={{
                            padding: '10px 14px',
                            borderBottom: idx < sisipanList.length - 1 ? '1px solid #F4F4F5' : 'none',
                            background: isThisEditing ? '#F5F3FF' : 'transparent',
                            borderLeft: isThisEditing ? '3px solid #7C3AED' : '3px solid transparent',
                            transition: 'all 0.1s',
                          }}
                        >
                          <div style={{ minWidth: 110, fontSize: 12, color: '#18181B', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            {fmtHM(s.startMin)} – {fmtHM(s.endMin)}
                          </div>
                          <div style={{ flex: 1, fontSize: 11, color: '#52525B', minWidth: 0 }}>
                            <div className="flex items-center gap-1 flex-wrap">
                              {/* MODE BADGE — show visibly so user can verify */}
                              {sis > 0 && (
                                <span style={{
                                  fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                                  padding: '1px 5px', borderRadius: 3,
                                  ...(s.mode === 'standby' ? {
                                    color: '#065F46', background: '#D1FAE5', border: '1px solid #6EE7B7',
                                  } : {
                                    color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D',
                                  }),
                                }} title={s.mode === 'standby' ? 'Standby mode: extra trip ekstra antara grid regular' : 'Slot mode: recalc headway ke effArmada baru'}>
                                  {s.mode === 'standby' ? '✦ STANDBY' : '⭐ SLOT'}
                                </span>
                              )}
                              {spanPeriodes.map(p => (
                                <span key={p.kode} style={{ fontSize: 10, color: PERIOD_PALETTE[p.kategori]?.text || '#71717A', background: PERIOD_PALETTE[p.kategori]?.bg || '#F4F4F5', padding: '1px 5px', borderRadius: 3, fontWeight: 500 }}>
                                  {p.kode}
                                </span>
                              ))}
                              {spanPeriodes.length > 1 && (
                                <span style={{ fontSize: 9, color: '#D97706', fontWeight: 700, marginLeft: 4 }}>⭐ MULTI-PERIODE</span>
                              )}
                            </div>
                            {s.catatan && (
                              <div style={{ fontSize: 10.5, color: '#71717A', marginTop: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.catatan}</div>
                            )}
                          </div>
                          {sis !== 0 && (
                            <span style={{ background: sis > 0 ? '#FEF2F2' : '#ECFDF5', color: sis > 0 ? '#991B1B' : '#065F46', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {sis > 0 ? '+' : ''}{sis} bus
                            </span>
                          )}
                          {cust > 0 && (
                            <span style={{ background: '#7C3AED', color: '#FFFFFF', padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap', flexShrink: 0 }}>H={cust}m</span>
                          )}
                          <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
                            <button
                              onClick={() => loadForEdit(s.id)}
                              title="Edit sisipan ini"
                              style={{ background: 'transparent', border: 'none', color: isThisEditing ? '#7C3AED' : '#A1A1AA', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#F5F3FF'; e.currentTarget.style.color = '#7C3AED'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isThisEditing ? '#7C3AED' : '#A1A1AA'; }}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => removeOverride(s.id)}
                              title="Hapus sisipan"
                              style={{ background: 'transparent', border: 'none', color: '#A1A1AA', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A1A1AA'; }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* ─── SECTION C: STATUS OPERASI PER BUS (EVENT-BASED) ──── */}
        {section === 'status' && (() => {
          const events = route.busStatusEvents || [];
          // FIX: Compute max bus ID dari schedule + events (covers sisipan buses + orphans)
          const baseArmada = Number(route.armada) || 0;
          const maxFromSched = (sched.trips && sched.trips.length)
            ? Math.max(...sched.trips.map(t => Number(t.busId) || 0))
            : 0;
          const maxFromEvents = events.length
            ? Math.max(...events.map(e => Number(e.busId) || 0))
            : 0;
          const maxBusId = Math.max(baseArmada, maxFromSched, maxFromEvents);
          const operatingStart = activePeriodes.length > 0 ? Math.min(...activePeriodes.map(p => parseHM((p.jam || '00:00').split('-')[0]))) : 5 * 60;
          const operatingEnd = activePeriodes.length > 0 ? Math.max(...activePeriodes.map(p => {
            const e = parseHM((p.jam || '00:00-00:00').split('-')[1]);
            return e > 0 ? e : 24 * 60;
          })) : 22 * 60;

          // Form helpers
          const startStr = formStatusStart && formStatusStart.match(/^\d{2}:\d{2}$/) ? formStatusStart : '';
          const endStr = formStatusEnd && formStatusEnd.match(/^\d{2}:\d{2}$/) ? formStatusEnd : '';
          const startMin = startStr ? parseHM(startStr) : null;
          const endMin = endStr ? parseHM(endStr) : null;
          const durMin = startMin !== null && endMin !== null
            ? (endMin > startMin ? endMin - startMin : (24 * 60 - startMin) + endMin)
            : 0;

          // ── ENRICHED TRIP DATA — direction + location for clearer Mulai/Selesai picker ──
          // Untuk PP: berangkat dispatch dari halte awal, arrive di halte akhir; pulang sebaliknya.
          // Untuk Loop: dispatch & arrive sama-sama di halte awal (sirkular).
          const namaTerminalAwal = route.halte[0]?.nama || 'Terminal Awal';
          const namaTerminalAkhir = route.halte[route.halte.length - 1]?.nama || 'Terminal Akhir';
          const isPP = route.tipeRute === 'PP';

          // Trip times of selected bus (for quick-pick dropdown) — enriched with location
          const selectedBusId = Number(formStatusBusId) || 0;
          const busTrips = selectedBusId > 0
            ? sched.trips
                .filter(t => t.busId === selectedBusId)
                .sort((a, b) => a.depMinutes - b.depMinutes)
                .map((t, idx) => {
                  // Determine "from" and "to" terminals based on direction
                  let dirIcon, dirLabel, fromTerm, toTerm;
                  if (isPP) {
                    if (t.direction === 'pulang') {
                      dirIcon = '←'; dirLabel = 'Pulang';
                      fromTerm = namaTerminalAkhir; toTerm = namaTerminalAwal;
                    } else {
                      dirIcon = '→'; dirLabel = 'Berangkat';
                      fromTerm = namaTerminalAwal; toTerm = namaTerminalAkhir;
                    }
                  } else {
                    dirIcon = '⟳'; dirLabel = 'Loop';
                    fromTerm = namaTerminalAwal; toTerm = namaTerminalAwal; // sirkular kembali
                  }
                  return {
                    id: t.id,
                    seqIdx: idx + 1, // sequential per-bus index (T1, T2, T3...)
                    depMin: t.depMinutes,
                    arrMin: t.arrMinutes,
                    depStr: fmtHM(t.depMinutes),
                    arrStr: fmtHM(t.arrMinutes),
                    direction: t.direction,
                    dirIcon, dirLabel,
                    fromTerm, toTerm,
                    durTrip: t.arrMinutes - t.depMinutes, // durasi 1 trip
                  };
                })
            : [];

          // Build IDLE INTERVALS — gaps when bus is at terminal between trips (eligible event windows)
          const idleIntervals = [];
          for (let i = 0; i < busTrips.length - 1; i++) {
            const curr = busTrips[i];
            const next = busTrips[i + 1];
            const gapStart = curr.arrMin;
            const gapEnd = next.depMin;
            const gapDur = gapEnd - gapStart;
            if (gapDur > 0) {
              idleIntervals.push({
                id: `gap-${curr.id}-${next.id}`,
                startMin: gapStart,
                endMin: gapEnd,
                startStr: fmtHM(gapStart),
                endStr: fmtHM(gapEnd),
                durMin: gapDur,
                location: curr.toTerm, // bus is parked at where it arrived
                afterTrip: curr,
                beforeTrip: next,
              });
            }
          }

          // Validation messages
          const validationErrors = [];
          const validationWarnings = [];
          if (!formStatusBusId) validationErrors.push('Pilih bus terlebih dahulu');
          if (startMin !== null && endMin !== null && endMin <= startMin) {
            validationErrors.push('Jam selesai harus setelah jam mulai');
          }
          if (selectedBusId > 0 && startMin !== null && endMin !== null && durMin > 0) {
            // Check overlap with existing events for same bus
            const overlapping = events.filter(e =>
              e.id !== editingEventId &&
              e.busId === selectedBusId &&
              startMin < Number(e.endMin) && endMin > Number(e.startMin)
            );
            if (overlapping.length > 0) {
              validationWarnings.push(`Overlap dengan ${overlapping.length} event lain untuk Bus #${selectedBusId}: ${overlapping.map(o => `${fmtHM(o.startMin)}-${fmtHM(o.endMin)}`).join(', ')}`);
            }
            // Outside operating window?
            if (startMin < operatingStart || endMin > operatingEnd) {
              validationWarnings.push(`Sebagian rentang di luar window operasi (${fmtHM(operatingStart)}–${fmtHM(operatingEnd)})`);
            }
          }
          // Trip overlap info: jumlah trip Bus yg terkena event
          const affectedTripCount = (selectedBusId > 0 && startMin !== null && endMin !== null && durMin > 0)
            ? busTrips.filter(t => t.depMin <= endMin && t.arrMin >= startMin).length
            : 0;

          const formValid = formStatusBusId && formStatusKind && startMin !== null && endMin !== null && durMin > 0 && validationErrors.length === 0;

          const isEditing = editingEventId !== null;

          const resetForm = () => {
            setFormStatusBusId('');
            setFormStatusKind('break');
            setFormStatusStart('');
            setFormStatusEnd('');
            setFormStatusCatatan('');
            setEditingEventId(null);
          };

          const saveEvent = () => {
            if (!formValid) return;
            if (isEditing) {
              // UPDATE existing event
              const next = events.map(e =>
                e.id === editingEventId
                  ? { ...e, busId: Number(formStatusBusId), status: formStatusKind, startMin, endMin, catatan: formStatusCatatan || '' }
                  : e
              );
              updateRoute({ ...route, busStatusEvents: next });
            } else {
              // ADD new event
              const newEvent = {
                id: Date.now(),
                busId: Number(formStatusBusId),
                status: formStatusKind,
                startMin,
                endMin,
                catatan: formStatusCatatan || '',
              };
              updateRoute({ ...route, busStatusEvents: [...events, newEvent] });
            }
            resetForm();
          };

          const editEvent = (e) => {
            setEditingEventId(e.id);
            setFormStatusBusId(String(e.busId));
            setFormStatusKind(e.status);
            setFormStatusStart(fmtHM(e.startMin));
            setFormStatusEnd(fmtHM(e.endMin));
            setFormStatusCatatan(e.catatan || '');
          };

          const removeEvent = (id) => {
            updateRoute({ ...route, busStatusEvents: events.filter(e => e.id !== id) });
            // Kalau yg dihapus adalah yg sedang di-edit, reset form
            if (id === editingEventId) resetForm();
          };

          const addQuickPreset = (kind, start, end, label) => {
            const newEvents = [];
            // FIX: Apply ke SEMUA bus operasional (termasuk sisipan), bukan hanya base armada
            for (let b = 1; b <= maxBusId; b++) {
              newEvents.push({
                id: Date.now() + b,
                busId: b,
                status: kind,
                startMin: parseHM(start),
                endMin: parseHM(end),
                catatan: label,
              });
            }
            updateRoute({ ...route, busStatusEvents: [...events, ...newEvents] });
          };

          // Sort events by busId, then startMin for display
          const sortedEvents = [...events].sort((a, b) => a.busId - b.busId || a.startMin - b.startMin);

          // Visual timeline width
          const tlWidth = 800;
          const tlMinPerPx = (operatingEnd - operatingStart) / tlWidth;

          return (
            <div className="space-y-4">
              {/* HELP BANNER */}
              <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 6, padding: '12px 14px', fontSize: 12, color: '#5B21B6', lineHeight: 1.55 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Status Operasi per Bus = Event Berbasis Jam</div>
                <div>
                  Tetapkan kondisi tiap bus pada <strong>rentang waktu spesifik</strong> (bukan terikat batas periode). Contoh: Bus tertentu BREAK 11:30-12:30 untuk dzuhur, atau SERVICE 13:15-13:45 untuk maintenance singkat.
                </div>
                <div style={{ marginTop: 6, fontSize: 11, opacity: 0.9 }}>
                  Bus dengan event non-Aktif yg overlap rentang RIT akan <strong>di-skip dari rotasi</strong> di RIT tersebut. Status akan tampil sebagai <strong>icon di samping jam</strong> di matrix Penjadwalan.
                </div>
              </div>

              {/* QUICK PRESETS */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: '10px 14px' }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Preset Cepat</span>
                  <button onClick={() => addQuickPreset('break', '11:30', '12:30', 'Break Dzuhur (semua bus)')} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: 4, cursor: 'pointer' }}>+ Break Dzuhur (semua bus)</button>
                  <button onClick={() => addQuickPreset('break', '15:00', '15:30', 'Break Ashar (semua bus)')} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: 4, cursor: 'pointer' }}>+ Break Ashar</button>
                  <button onClick={() => addQuickPreset('break', '18:00', '18:30', 'Break Maghrib (semua bus)')} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: 4, cursor: 'pointer' }}>+ Break Maghrib</button>
                  {events.length > 0 && (
                    <button onClick={() => updateRoute({ ...route, busStatusEvents: [] })} style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 4, cursor: 'pointer' }}>Hapus semua event</button>
                  )}
                </div>
              </div>

              {/* TAMBAH / EDIT EVENT FORM */}
              <div style={{ background: '#FFFFFF', border: `1px solid ${isEditing ? '#7C3AED' : '#E4E4E7'}`, borderRadius: 8, overflow: 'hidden', boxShadow: isEditing ? '0 0 0 3px rgba(124, 58, 237, 0.08)' : 'none' }}>
                <div style={{ background: isEditing ? '#F5F3FF' : '#FAFAFA', padding: '10px 14px', borderBottom: `1px solid ${isEditing ? '#DDD6FE' : '#E4E4E7'}` }} className="flex items-center justify-between">
                  <span style={{ fontSize: 10, fontWeight: 700, color: isEditing ? '#5B21B6' : '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {isEditing ? '✏ Edit Status Event' : '+ Tambah Status Event'}
                  </span>
                  {isEditing && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#5B21B6', background: '#DDD6FE', padding: '2px 8px', borderRadius: 3, letterSpacing: '0.04em' }}>
                      MODE EDIT
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    {/* Bus selector */}
                    <div className="col-span-2">
                      <label style={{ fontSize: 10.5, fontWeight: 600, color: '#71717A', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Bus</label>
                      <select
                        value={formStatusBusId}
                        onChange={e => setFormStatusBusId(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #D4D4D8', borderRadius: 5, background: '#FFFFFF', color: '#18181B', outline: 'none' }}
                      >
                        <option value="">— pilih —</option>
                        {Array.from({ length: maxBusId }, (_, i) => i + 1).map(b => {
                          const isSisipan = b > baseArmada;
                          return (
                            <option key={b} value={b}>
                              Bus #{b}{isSisipan ? ' ⭐ (sisipan)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    {/* Status kind */}
                    <div className="col-span-3">
                      <label style={{ fontSize: 10.5, fontWeight: 600, color: '#71717A', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Status</label>
                      <select
                        value={formStatusKind}
                        onChange={e => setFormStatusKind(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #D4D4D8', borderRadius: 5, background: '#FFFFFF', color: '#18181B', outline: 'none' }}
                      >
                        {['break', 'service', 'standby', 'off'].map(s => (
                          <option key={s} value={s}>{STATUS_OPS[s].label} ({STATUS_OPS[s].short}) — {STATUS_OPS[s].desc}</option>
                        ))}
                      </select>
                    </div>
                    {/* Time range — Mulai */}
                    <div className="col-span-2">
                      <label style={{ fontSize: 10.5, fontWeight: 600, color: '#71717A', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Mulai</label>
                      <input
                        type="time"
                        value={formStatusStart}
                        onChange={e => setFormStatusStart(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: `1px solid ${validationErrors.some(v => v.includes('mulai')) ? '#FCA5A5' : '#D4D4D8'}`, borderRadius: 5, background: '#FFFFFF', color: '#18181B', outline: 'none', fontVariantNumeric: 'tabular-nums' }}
                      />
                      {busTrips.length > 0 && (
                        <select
                          value=""
                          onChange={e => { if (e.target.value) setFormStatusStart(e.target.value); }}
                          title={`Quick-pick dari trip Bus #${selectedBusId} (${isPP ? 'PP' : 'Loop'})`}
                          style={{ width: '100%', marginTop: 4, padding: '4px 8px', fontSize: 10.5, border: '1px solid #E4E4E7', borderRadius: 4, background: '#FAFAFA', color: '#71717A', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="">📋 Pilih waktu Mulai dari trip Bus #{selectedBusId}…</option>
                          <optgroup label="── Per Trip (departure / arrival) ──">
                            {busTrips.map(t => (
                              <React.Fragment key={t.id}>
                                <option value={t.depStr}>
                                  T{t.seqIdx} {t.dirIcon} {t.dirLabel} · ⏵ {t.depStr} dep dari {t.fromTerm}
                                </option>
                                <option value={t.arrStr}>
                                  T{t.seqIdx} {t.dirIcon} {t.dirLabel} · ⏹ {t.arrStr} arr di {t.toTerm}
                                </option>
                              </React.Fragment>
                            ))}
                          </optgroup>
                        </select>
                      )}
                    </div>
                    {/* Time range — Selesai */}
                    <div className="col-span-2">
                      <label style={{ fontSize: 10.5, fontWeight: 600, color: '#71717A', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Selesai
                        {durMin > 0 && <span style={{ marginLeft: 6, color: '#A1A1AA', fontWeight: 400, fontSize: 10 }}>({fmtDurMin(durMin)})</span>}
                      </label>
                      <input
                        type="time"
                        value={formStatusEnd}
                        onChange={e => setFormStatusEnd(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: `1px solid ${validationErrors.some(v => v.includes('selesai')) ? '#FCA5A5' : '#D4D4D8'}`, borderRadius: 5, background: '#FFFFFF', color: '#18181B', outline: 'none', fontVariantNumeric: 'tabular-nums' }}
                      />
                      {busTrips.length > 0 && (
                        <select
                          value=""
                          onChange={e => { if (e.target.value) setFormStatusEnd(e.target.value); }}
                          title={`Quick-pick dari trip Bus #${selectedBusId} (${isPP ? 'PP' : 'Loop'})`}
                          style={{ width: '100%', marginTop: 4, padding: '4px 8px', fontSize: 10.5, border: '1px solid #E4E4E7', borderRadius: 4, background: '#FAFAFA', color: '#71717A', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="">📋 Pilih waktu Selesai dari trip Bus #{selectedBusId}…</option>
                          <optgroup label={startMin !== null ? `── Per Trip (setelah ${fmtHM(startMin)}) ──` : "── Per Trip (departure / arrival) ──"}>
                            {busTrips.map(t => {
                              const showDep = startMin === null || t.depMin > startMin;
                              const showArr = startMin === null || t.arrMin > startMin;
                              return (
                                <React.Fragment key={t.id}>
                                  {showDep && (
                                    <option value={t.depStr}>
                                      T{t.seqIdx} {t.dirIcon} {t.dirLabel} · ⏵ {t.depStr} dep dari {t.fromTerm}
                                    </option>
                                  )}
                                  {showArr && (
                                    <option value={t.arrStr}>
                                      T{t.seqIdx} {t.dirIcon} {t.dirLabel} · ⏹ {t.arrStr} arr di {t.toTerm}
                                    </option>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </optgroup>
                        </select>
                      )}
                    </div>
                    {/* Action */}
                    <div className="col-span-3">
                      <div className="flex gap-2">
                        <button
                          onClick={saveEvent}
                          disabled={!formValid}
                          style={{
                            flex: 1, padding: '8px 14px', fontSize: 13, fontWeight: 600,
                            background: formValid ? (isEditing ? '#7C3AED' : '#047857') : '#D4D4D8',
                            color: '#FFFFFF', border: 'none', borderRadius: 6,
                            cursor: formValid ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {isEditing ? 'Update Event' : '+ Tambah Event'}
                        </button>
                        {isEditing && (
                          <button
                            onClick={resetForm}
                            title="Batal edit"
                            style={{ padding: '8px 12px', fontSize: 13, fontWeight: 500, background: '#FFFFFF', color: '#52525B', border: '1px solid #D4D4D8', borderRadius: 6, cursor: 'pointer' }}
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SMART PICK — Idle Intervals (auto-fill BOTH Mulai+Selesai) */}
                  {selectedBusId > 0 && idleIntervals.length > 0 && (
                    <div className="mt-3" style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 6, padding: '8px 10px' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ fontSize: 13 }}>⚡</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          Smart Pick — Pilih Saat Bus Idle di Terminal (auto-fill Mulai &amp; Selesai)
                        </span>
                      </div>
                      <div style={{ fontSize: 10.5, color: '#15803D', marginBottom: 6, lineHeight: 1.4 }}>
                        Bus #{selectedBusId} mempunyai <strong>{idleIntervals.length} interval idle</strong> di terminal. Klik untuk auto-set time range.
                      </div>
                      <select
                        value=""
                        onChange={e => {
                          if (!e.target.value) return;
                          const interval = idleIntervals.find(it => it.id === e.target.value);
                          if (interval) {
                            setFormStatusStart(interval.startStr);
                            setFormStatusEnd(interval.endStr);
                          }
                        }}
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid #86EFAC', borderRadius: 5, background: '#FFFFFF', color: '#18181B', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="">⚡ Pilih interval idle…</option>
                        {idleIntervals.map(iv => (
                          <option key={iv.id} value={iv.id}>
                            {iv.startStr} → {iv.endStr} ({fmtDurMin(iv.durMin)}) · di {iv.location} · setelah T{iv.afterTrip.seqIdx} {iv.afterTrip.dirIcon} {iv.afterTrip.dirLabel}
                          </option>
                        ))}
                      </select>
                      <div style={{ fontSize: 10, color: '#15803D', marginTop: 4, fontStyle: 'italic' }}>
                        💡 Idle interval = waktu bus diam di terminal antara trip. Aman untuk break sopir, ganti shift, isi BBM, dll.
                      </div>
                    </div>
                  )}

                  {/* Catatan */}
                  <div className="mt-3">
                    <label style={{ fontSize: 10.5, fontWeight: 600, color: '#71717A', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Catatan (opsional)</label>
                    <input
                      type="text"
                      value={formStatusCatatan}
                      onChange={e => setFormStatusCatatan(e.target.value)}
                      placeholder="Misal: istirahat siang sopir, isi BBM, maintenance preventif"
                      style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #D4D4D8', borderRadius: 5, background: '#FFFFFF', color: '#18181B', outline: 'none' }}
                    />
                  </div>

                  {/* VALIDATION FEEDBACK */}
                  {(validationErrors.length > 0 || validationWarnings.length > 0 || affectedTripCount > 0) && (
                    <div className="mt-3 space-y-1.5">
                      {validationErrors.map((err, i) => (
                        <div key={`e${i}`} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 5, padding: '6px 10px', fontSize: 11.5, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13 }}>⚠</span>
                          <span><strong>Error:</strong> {err}</span>
                        </div>
                      ))}
                      {validationWarnings.map((w, i) => (
                        <div key={`w${i}`} style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 5, padding: '6px 10px', fontSize: 11.5, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13 }}>!</span>
                          <span><strong>Peringatan:</strong> {w}</span>
                        </div>
                      ))}
                      {affectedTripCount > 0 && validationErrors.length === 0 && (
                        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 5, padding: '6px 10px', fontSize: 11.5, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13 }}>ⓘ</span>
                          <span>
                            Event ini akan menandai <strong>{affectedTripCount} trip</strong> Bus #{selectedBusId} dengan icon status di matrix Penjadwalan
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* TIMELINE VISUALIZATION */}
              {sortedEvents.length > 0 && (
                <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ background: '#FAFAFA', padding: '10px 14px', borderBottom: '1px solid #E4E4E7' }} className="flex items-center justify-between">
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Timeline Status Event</span>
                    <span style={{ fontSize: 11, color: '#71717A', fontStyle: 'italic' }}>
                      Window operasi: {fmtHM(operatingStart)} — {fmtHM(operatingEnd)}
                    </span>
                  </div>
                  <div className="p-4" style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 900 }}>
                      {/* Hour ruler */}
                      <div className="flex" style={{ marginBottom: 6 }}>
                        <div style={{ width: 90, flexShrink: 0 }} />
                        <div className="relative" style={{ width: tlWidth, height: 18 }}>
                          {Array.from({ length: Math.ceil((operatingEnd - operatingStart) / 60) + 1 }, (_, i) => {
                            const hourMin = operatingStart + i * 60;
                            const left = (hourMin - operatingStart) / tlMinPerPx;
                            return (
                              <div key={i} className="absolute" style={{ left: `${left}px`, top: 0, fontSize: 9, color: '#71717A', fontWeight: 600, transform: 'translateX(-50%)', fontVariantNumeric: 'tabular-nums' }}>
                                {fmtHM(hourMin)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* Bus rows — termasuk bus sisipan (ID > base armada) */}
                      {Array.from({ length: maxBusId }, (_, i) => i + 1).map(busId => {
                        const busEvents = sortedEvents.filter(e => e.busId === busId);
                        const isSisipan = busId > baseArmada;
                        return (
                          <div key={busId} className="flex items-center" style={{ marginBottom: 4 }}>
                            <div style={{ width: 90, flexShrink: 0, fontSize: 11, color: '#18181B', fontWeight: 600 }}>
                              Bus #{busId}
                              {isSisipan && (
                                <span style={{ display: 'block', fontSize: 9, color: '#D97706', fontWeight: 600, marginTop: -1 }}>⭐ sisipan</span>
                              )}
                            </div>
                            <div className="relative" style={{ width: tlWidth, height: 22, background: isSisipan ? '#FFFBEB' : '#FAFAFA', borderRadius: 4, border: isSisipan ? '1px solid #FDE68A' : '1px solid #F4F4F5' }}>
                              {/* Hour grid */}
                              {Array.from({ length: Math.ceil((operatingEnd - operatingStart) / 60) }, (_, i) => (
                                <div key={i} className="absolute" style={{ left: ((i + 1) * 60) / tlMinPerPx, top: 0, bottom: 0, width: 1, background: '#F4F4F5' }} />
                              ))}
                              {/* Events */}
                              {busEvents.map(e => {
                                const left = Math.max(0, (Number(e.startMin) - operatingStart)) / tlMinPerPx;
                                const widthMin = Math.min(Number(e.endMin), operatingEnd) - Math.max(Number(e.startMin), operatingStart);
                                const width = widthMin / tlMinPerPx;
                                if (width <= 0) return null;
                                const s = STATUS_OPS[e.status];
                                return (
                                  <div
                                    key={e.id}
                                    className="absolute flex items-center justify-center"
                                    style={{
                                      left: `${left}px`,
                                      width: `${width}px`,
                                      top: 1, bottom: 1,
                                      background: s.bg,
                                      border: `1.5px solid ${s.dot}`,
                                      borderRadius: 3,
                                      fontSize: 10, fontWeight: 700,
                                      color: s.text,
                                      overflow: 'hidden', whiteSpace: 'nowrap',
                                    }}
                                    title={`Bus #${e.busId} · ${s.label} · ${fmtHM(e.startMin)}-${fmtHM(e.endMin)}${e.catatan ? ' · ' + e.catatan : ''}`}
                                  >
                                    {width > 40 ? `${s.short} ${fmtHM(e.startMin)}-${fmtHM(e.endMin)}` : s.short}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE EVENTS LIST */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: '#FAFAFA', padding: '10px 14px', borderBottom: '1px solid #E4E4E7' }} className="flex items-center justify-between">
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#52525B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status Events Aktif ({events.length})</span>
                  {events.length > 0 && (
                    <span style={{ fontSize: 11, color: '#71717A' }}>{Object.values(STATUS_OPS).filter(s => events.some(e => e.status === Object.keys(STATUS_OPS).find(k => STATUS_OPS[k] === s))).length} status types</span>
                  )}
                </div>
                {sortedEvents.length === 0 ? (
                  <div style={{ padding: 28, textAlign: 'center', color: '#A1A1AA', fontSize: 12 }}>
                    Belum ada event. Gunakan form di atas atau preset cepat untuk menambah.
                  </div>
                ) : (
                  <div>
                    {sortedEvents.map((e, idx) => {
                      const s = STATUS_OPS[e.status];
                      const dur = (Number(e.endMin) - Number(e.startMin)) / 60;
                      const isThisEditing = editingEventId === e.id;
                      return (
                        <div
                          key={e.id}
                          className="flex items-center gap-3"
                          style={{
                            padding: '10px 14px',
                            borderBottom: idx < sortedEvents.length - 1 ? '1px solid #F4F4F5' : 'none',
                            background: isThisEditing ? '#F5F3FF' : 'transparent',
                            borderLeft: isThisEditing ? '3px solid #7C3AED' : '3px solid transparent',
                            transition: 'all 0.1s',
                          }}
                        >
                          <span style={{ minWidth: 56, fontSize: 12, fontWeight: 700, color: busColor(e.busId).deep, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            Bus #{e.busId}{e.busId > baseArmada ? <span style={{ color: '#D97706', marginLeft: 2 }} title="Bus sisipan">⭐</span> : null}
                          </span>
                          <span style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}`, padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', minWidth: 76, textAlign: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {s.label.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 12, color: '#52525B', fontVariantNumeric: 'tabular-nums', minWidth: 116, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {fmtHM(e.startMin)} – {fmtHM(e.endMin)}
                          </span>
                          <span style={{ fontSize: 11, color: '#71717A', fontVariantNumeric: 'tabular-nums', minWidth: 72, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {fmtDurH(dur)}
                          </span>
                          <span style={{ flex: 1, fontSize: 11.5, color: '#71717A', fontStyle: e.catatan ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                            {e.catatan || 'tanpa catatan'}
                          </span>
                          <button
                            onClick={() => editEvent(e)}
                            title="Edit event"
                            disabled={isThisEditing}
                            style={{
                              background: isThisEditing ? '#7C3AED' : 'transparent',
                              border: 'none',
                              color: isThisEditing ? '#FFFFFF' : '#A1A1AA',
                              cursor: isThisEditing ? 'default' : 'pointer',
                              padding: 4, borderRadius: 4,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 26, height: 26,
                            }}
                            onMouseEnter={ev => { if (!isThisEditing) { ev.currentTarget.style.background = '#F5F3FF'; ev.currentTarget.style.color = '#7C3AED'; } }}
                            onMouseLeave={ev => { if (!isThisEditing) { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.color = '#A1A1AA'; } }}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => removeEvent(e.id)}
                            title="Hapus event"
                            style={{ background: 'transparent', border: 'none', color: '#A1A1AA', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26 }}
                            onMouseEnter={ev => { ev.currentTarget.style.background = '#FEF2F2'; ev.currentTarget.style.color = '#DC2626'; }}
                            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.color = '#A1A1AA'; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* STATUS LEGEND */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 6, padding: '10px 14px' }}>
                <div className="flex flex-wrap gap-3">
                  {['break', 'service', 'standby', 'off'].map(key => {
                    const s = STATUS_OPS[key];
                    return (
                      <div key={key} className="flex items-center gap-2" style={{ fontSize: 11.5 }}>
                        <span style={{ width: 18, height: 18, borderRadius: 3, background: s.bg, border: `1px solid ${s.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, color: s.text }}>{s.short}</span>
                        <span style={{ color: '#18181B', fontWeight: 500 }}>{s.label}</span>
                        <span style={{ color: '#71717A', fontSize: 10.5 }}>— {s.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })()}

        {/* PROFILE CHART (visible across all sections) */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 10, fontWeight: 600, color: '#71717A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Profil Armada Per Periode (24 jam)</span>
            <span style={{ fontSize: 11, color: '#A1A1AA', fontStyle: 'italic' }}>— effective armada = base + sisipan, sebelum status per-bus diterapkan</span>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 8, padding: 12 }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={armadaProfile}>
                <CartesianGrid stroke="#E4E4E7" strokeDasharray="2 4" />
                <XAxis dataKey="kode" stroke="#71717A" tick={{ fontSize: 9 }} interval={1} />
                <YAxis stroke="#71717A" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #D4D4D8', borderRadius: 6, fontSize: 11 }} />
                <Bar dataKey="base" fill="#A1A1AA" name="Base armada" />
                <Bar dataKey="effective" fill="#047857" name="Effective (base+sisipan)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}


function TabBiaya({ route, updateRoute }) {
  const m = useMemo(() => calcMetrics(route), [route]);
  const c = useMemo(() => calcCost(route, m), [route, m]);
  const updateBiaya = (field, val) => {
    updateRoute({ ...route, biaya: { ...route.biaya, [field]: val } });
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* INPUTS */}
        <div className="col-span-5 space-y-4">
          <Section title="Biaya Variabel (BBM)" icon={Fuel}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Konsumsi BBM</label>
                <NumInput value={route.biaya.konsumsiBBM} onChange={v => updateBiaya('konsumsiBBM', v)} suffix="km/L" step={0.1} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Harga BBM</label>
                <NumInput value={route.biaya.hargaBBM} onChange={v => updateBiaya('hargaBBM', v)} suffix="Rp/L" step={100} />
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500 font-mono">
              → Biaya BBM/km: <span className="text-emerald-700">{fmtRpFull(c.biayaBBMPerKm)}</span>
            </div>
          </Section>

          <Section title="Biaya Tetap Harian" icon={Wrench}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Gaji Sopir/Hari/Shift</label>
                <NumInput value={route.biaya.gajiSopir} onChange={v => updateBiaya('gajiSopir', v)} suffix="Rp" step={10000} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Gaji Asisten/Hari/Shift</label>
                <NumInput value={route.biaya.gajiAsisten} onChange={v => updateBiaya('gajiAsisten', v)} suffix="Rp" step={10000} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Jumlah Shift Kru/Bus/Hari</label>
                <NumInput value={route.biaya.shiftPerBus ?? 2} onChange={v => updateBiaya('shiftPerBus', v)} suffix="shift" step={0.5} />
                <div className="text-[10px] text-zinc-500 mt-1 font-mono">Ops 16j → 2 shift; ops 18-20j → 2.5 shift</div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Maintenance/Bus/Hari</label>
                <NumInput value={route.biaya.maintenance} onChange={v => updateBiaya('maintenance', v)} suffix="Rp" step={10000} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-amber-700/80 mb-1 block flex items-center gap-1">
                  <AlertTriangle size={11} /> Setoran Sopir/Bus/Hari (informasional saja)
                </label>
                <NumInput value={route.biaya.setoran} onChange={v => updateBiaya('setoran', v)} suffix="Rp" step={100000} />
                <div className="text-[10px] text-zinc-500 mt-1 font-mono leading-relaxed">
                  Setoran = transfer internal sopir → operator dari pendapatan tiket. BUKAN biaya operasi (sudah masuk di pendapatan).
                </div>
              </div>
            </div>
          </Section>

          <Section title="Pendapatan & Kontrak" icon={DollarSign}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Tarif/Pax</label>
                <NumInput value={route.biaya.tarif} onChange={v => updateBiaya('tarif', v)} suffix="Rp" step={500} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Avg Pax/Trip</label>
                <NumInput value={route.biaya.avgPax} onChange={v => updateBiaya('avgPax', v)} suffix="orang" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Margin Operator</label>
                <NumInput value={route.biaya.marginPct} onChange={v => updateBiaya('marginPct', v)} suffix="%×100" step={0.01} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Overhead</label>
                <NumInput value={route.biaya.overheadPct} onChange={v => updateBiaya('overheadPct', v)} suffix="%×100" step={0.01} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Eskalasi Tahunan</label>
                <NumInput value={route.biaya.eskalasiPct} onChange={v => updateBiaya('eskalasiPct', v)} suffix="%×100" step={0.01} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Hari Operasi/Tahun</label>
                <NumInput value={route.biaya.hariOpsTahun} onChange={v => updateBiaya('hariOpsTahun', v)} suffix="hari" />
              </div>
            </div>
          </Section>
        </div>

        {/* OUTPUTS */}
        <div className="col-span-7 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <KpiCard label="Total Biaya/Hari" value={fmtRp(c.totalBiaya)} accent="rose" icon={DollarSign} />
            <KpiCard label="Pendapatan/Hari" value={fmtRp(c.totalPendapatan)} accent="emerald" icon={TrendingUp} sub={`${c.totalPax} pax × ${fmtRpFull(route.biaya.tarif)}`} />
            <KpiCard
              label="Laba / Rugi /Hari"
              value={fmtRp(c.labaRugi)}
              accent={c.labaRugi >= 0 ? 'emerald' : 'rose'}
              icon={c.labaRugi >= 0 ? TrendingUp : TrendingDown}
              sub={`Margin: ${fmtPct(c.marginPct)}`}
            />
          </div>

          <Section title="Breakdown Biaya Operasional Harian" icon={DollarSign}>
            <Row label="Biaya BBM (km × Rp/km)" value={fmtRpFull(c.biayaBBM)} />
            <Row label={`Biaya Gaji Kru (${c.shift}× shift)`} value={fmtRpFull(c.biayaGaji)} />
            <Row label="Biaya Maintenance" value={fmtRpFull(c.biayaMaintenance)} />
            <Row label="Subtotal Operasional" value={fmtRpFull(c.subtotalBiaya)} tone="muted" />
            <Row label={`Overhead (${fmtPct(route.biaya.overheadPct)})`} value={fmtRpFull(c.overhead)} tone="muted" />
            <div className="border-t border-zinc-200 mt-2 pt-2">
              <Row label="TOTAL BIAYA/HARI" value={fmtRpFull(c.totalBiaya)} tone="warn" />
            </div>
            <div className="mt-3 px-3 py-2 bg-zinc-100/50 border border-zinc-200 rounded text-[10px] text-zinc-500 leading-relaxed">
              <div className="flex items-start gap-1.5">
                <AlertTriangle size={11} className="text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-amber-300">Setoran ({fmtRpFull(c.setoranInfo)})</span> tidak ditambahkan ke biaya — itu transfer internal dari pendapatan tiket, bukan beban kas operator. Memasukkannya = double counting.
                </div>
              </div>
            </div>
          </Section>

          <Section title="Unit Economics (Dasar Penetapan Harga Kontrak)" icon={Activity}>
            <div className="grid grid-cols-2 gap-x-4">
              <Row label="Biaya per km" value={fmtRpFull(c.biayaPerKm)} unit="Rp/km" />
              <Row label="Biaya per Trip" value={fmtRpFull(c.biayaPerTrip)} unit="Rp/trip" />
              <Row label="Biaya per Bus·Jam" value={fmtRpFull(c.biayaPerBusJam)} unit="Rp/bus·jam" />
              <Row label="Biaya per Bus·Hari" value={fmtRpFull(c.biayaPerBusHari)} unit="Rp/bus·hari" />
              <Row label="Biaya per Pax" value={fmtRpFull(c.biayaPerPax)} unit="Rp/pax" />
              <Row label="Tarif Break-Even" value={fmtRpFull(c.tarifBEP)} unit="Rp/pax" tone={c.tarifBEP > route.biaya.tarif ? 'warn' : 'pos'} />
              <Row label="Pax BEP per Trip" value={c.paxBEPperTrip} unit="pax/trip" tone={c.paxBEPperTrip > route.biaya.avgPax ? 'warn' : 'pos'} />
              <Row label="Selisih Tarif vs BEP" value={fmtRpFull(route.biaya.tarif - c.tarifBEP)} tone={route.biaya.tarif >= c.tarifBEP ? 'pos' : 'neg'} />
            </div>
          </Section>
        </div>
      </div>

      <SkemaKontrak c={c} route={route} />
    </div>
  );
}

function SkemaKontrak({ c, route }) {
  const skema = c.skema;
  const items = [
    {
      key: 'bts', no: '1️⃣', nama: 'BUY THE SERVICE (BTS)',
      desc: 'Pembayaran berbasis Rp/km. Standar Teman Bus, Trans Metro Dewata, BTS Kemenhub. Acuan: Permenhub PM 9/2020.',
      risk: 'Rendah / Sedang',
      rows: [
        ['Biaya Operasional/km', fmtRpFull(c.biayaPerKm), 'Rp/km'],
        ['Margin Operator', fmtRpFull(c.biayaPerKm * route.biaya.marginPct), 'Rp/km'],
        ['Tarif Kontrak BTS', fmtRpFull(skema.bts.tarif), 'Rp/km'],
        ['Pembayaran Harian', fmtRpFull(skema.bts.harian), 'Rp/hari'],
        ['Pembayaran Tahunan', fmtRpFull(skema.bts.tahunan), 'Rp/tahun'],
        ['Pendapatan Tiket→Pemerintah', fmtRpFull(skema.bts.tiketTahunan), 'Rp/tahun'],
        ['Net Subsidi APBN/APBD', fmtRpFull(skema.bts.netSubsidi), 'Rp/tahun'],
      ],
      cocok: 'Layanan publik rutin (BRT, Teman Bus)',
      color: 'cyan',
    },
    {
      key: 'sewa', no: '2️⃣', nama: 'SEWA / CHARTER',
      desc: 'Pembayaran lumpsum berdasarkan durasi (Rp/bus·hari). Untuk jemputan pegawai, kegiatan dinas, evakuasi.',
      risk: 'Sangat Rendah / Tinggi',
      rows: [
        ['Biaya Operasional/Bus·Hari', fmtRpFull(c.biayaPerBusHari), 'Rp/bus·hari'],
        ['Margin Operator', fmtRpFull(c.biayaPerBusHari * route.biaya.marginPct), 'Rp/bus·hari'],
        ['Tarif Sewa per Bus·Hari', fmtRpFull(skema.sewa.tarif), 'Rp/bus·hari'],
        ['Pembayaran Harian (semua armada)', fmtRpFull(skema.sewa.harian), 'Rp/hari'],
        ['Pembayaran Tahunan', fmtRpFull(skema.sewa.tahunan), 'Rp/tahun'],
      ],
      cocok: 'Insidentil, dinas, jemputan, evakuasi',
      color: 'emerald',
    },
    {
      key: 'subsidi', no: '3️⃣', nama: 'SUBSIDI DEFISIT',
      desc: 'Pemerintah hanya tutup selisih biaya - pendapatan tiket. Manajemen di operator. ⚠️ Sulit pengawasan.',
      risk: 'Tinggi / Sangat Tinggi',
      rows: [
        ['Total Biaya + Margin', fmtRpFull(skema.subsidi.biayaTotal), 'Rp/hari'],
        ['Pendapatan Tiket Operator', fmtRpFull(c.totalPendapatan), 'Rp/hari'],
        ['Defisit Harian', fmtRpFull(skema.subsidi.defisit), 'Rp/hari'],
        ['Subsidi Tahunan', fmtRpFull(skema.subsidi.tahunan), 'Rp/tahun'],
      ],
      cocok: 'Operator existing, transisi ke BTS',
      color: 'amber',
    },
    {
      key: 'pbc', no: '4️⃣', nama: 'PERFORMANCE-BASED CONTRACT (PBC)',
      desc: 'Base BTS + bonus/penalty berdasarkan KPI (utilisasi, on-time, kebersihan). Penalty maks 20%.',
      risk: 'Sedang / Rendah',
      rows: [
        ['Base Payment (=BTS)', fmtRpFull(skema.pbc.base), 'Rp/tahun'],
        ['Bobot Variable (KPI)', fmtPct(route.biaya.bobotKPI), '%'],
        ['Achievement KPI', fmtPct(route.biaya.achievementKPI), '%'],
        ['Adjustment KPI', fmtRpFull(skema.pbc.adjustment), 'Rp/tahun'],
        ['Final Payment PBC', fmtRpFull(skema.pbc.final), 'Rp/tahun'],
      ],
      cocok: 'Best practice modern — kombinasi BTS + KPI ketat',
      color: 'violet',
    },
    {
      key: 'kpbu', no: '5️⃣', nama: 'KPBU — AVAILABILITY PAYMENT',
      desc: 'Kontrak 15-20 tahun untuk proyek besar (BRT/MRT). Pembayaran berdasarkan availability infrastruktur.',
      risk: 'Rendah / Tinggi (long-term commitment)',
      rows: [
        ['Tenor Kontrak', `${skema.kpbu.tenor} tahun`, ''],
        ['Capex Awal (estimasi)', fmtRpFull(skema.kpbu.capexAwal), 'Rp'],
        ['Opex Tahunan (=BTS)', fmtRpFull(skema.bts.tahunan), 'Rp/tahun'],
        ['Amortisasi Capex/Tahun', fmtRpFull(skema.kpbu.amortisasi), 'Rp/tahun'],
        ['Availability Payment Tahun-1', fmtRpFull(skema.kpbu.apTahun1), 'Rp/tahun'],
        ['Total Komitmen Kontrak', fmtRpFull(skema.kpbu.totalKomitmen), `Rp / ${skema.kpbu.tenor} thn`],
      ],
      cocok: 'Mega-proyek (BRT/MRT) skala kota besar',
      color: 'rose',
    },
  ];

  return (
    <Section title="📜 5 Skema Kontrak Pemerintah (Acuan: PerPres 80/2011, Permenhub PM 9/2020, PMK 38/2015)" icon={GitCompare}>
      <div className="grid grid-cols-5 gap-3">
        {items.map(item => {
          const colorMap = {
            cyan: 'border-emerald-300 bg-emerald-500/5',
            emerald: 'border-emerald-500/40 bg-emerald-500/5',
            amber: 'border-amber-500/40 bg-amber-500/5',
            violet: 'border-violet-500/40 bg-violet-500/5',
            rose: 'border-rose-500/40 bg-rose-500/5',
          };
          return (
            <div key={item.key} className={`border rounded-lg p-3 ${colorMap[item.color]}`}>
              <div className="text-xl mb-1">{item.no}</div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-800 font-bold mb-1">{item.nama}</div>
              <div className="text-[10px] text-zinc-500 mb-2 leading-tight">{item.desc}</div>
              <div className="text-[10px] text-zinc-500 mb-2 italic">Risiko Op/Pem: {item.risk}</div>
              <div className="space-y-1 border-t border-zinc-200/50 pt-2">
                {item.rows.map(([k, v, u]) => (
                  <div key={k} className="text-[10px]">
                    <div className="text-zinc-500">{k}</div>
                    <div className="font-mono text-zinc-800">{v} <span className="text-zinc-400">{u}</span></div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-zinc-200/50 text-[10px] text-zinc-500">
                <span className="text-zinc-500">Cocok: </span>{item.cocok}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}


// ============================================================================
// PENJADWALAN OPERASI — Halaman Utama (Single Comprehensive View)
// Design system: modern SaaS, light theme, single brand accent
// ============================================================================

// ─── Design Tokens ─────────────────────────────────────────────────────────

const TOKENS = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F4F5',
  border: '#E4E4E7',
  borderStrong: '#D4D4D8',
  textPrimary: '#18181B',
  textSecondary: '#3F3F46',
  textMuted: '#71717A',
  textSubtle: '#A1A1AA',
  brand: '#047857',         // emerald-700 — sophisticated transit feel
  brandTint: '#ECFDF5',
  brandStrong: '#065F46',
};

// 10 distinct, accessible colors that work well on white backgrounds
const BUS_PALETTE = [
  { solid: '#0EA5E9', tint: '#E0F2FE', deep: '#075985' }, // sky
  { solid: '#10B981', tint: '#D1FAE5', deep: '#065F46' }, // emerald
  { solid: '#F59E0B', tint: '#FEF3C7', deep: '#92400E' }, // amber
  { solid: '#8B5CF6', tint: '#EDE9FE', deep: '#5B21B6' }, // violet
  { solid: '#EF4444', tint: '#FEE2E2', deep: '#991B1B' }, // red
  { solid: '#06B6D4', tint: '#CFFAFE', deep: '#155E75' }, // cyan
  { solid: '#84CC16', tint: '#ECFCCB', deep: '#3F6212' }, // lime
  { solid: '#EC4899', tint: '#FCE7F3', deep: '#9D174D' }, // pink
  { solid: '#F97316', tint: '#FFEDD5', deep: '#9A3412' }, // orange
  { solid: '#6366F1', tint: '#E0E7FF', deep: '#3730A3' }, // indigo
];
const busColor = (busId) => BUS_PALETTE[((busId || 1) - 1) % BUS_PALETTE.length];

const PERIOD_PALETTE = {
  'Peak':     { dot: '#DC2626', bg: '#FEF2F2', text: '#991B1B', label: 'PEAK',      short: 'PK' },
  'Off-Peak': { dot: '#059669', bg: '#ECFDF5', text: '#065F46', label: 'OFF-PEAK',  short: 'OP' },
  'Pre-Peak': { dot: '#D97706', bg: '#FFFBEB', text: '#92400E', label: 'PRE-PEAK',  short: 'PP' },
  'Transisi': { dot: '#D97706', bg: '#FFFBEB', text: '#92400E', label: 'TRANSISI',  short: 'TR' },
  'Break':    { dot: '#2563EB', bg: '#EFF6FF', text: '#1E40AF', label: 'ISTIRAHAT', short: 'BR' },
  'Late':     { dot: '#7C3AED', bg: '#F5F3FF', text: '#5B21B6', label: 'LATE',      short: 'LT' },
  'Tutup':    { dot: '#71717A', bg: '#F4F4F5', text: '#3F3F46', label: 'TUTUP',     short: '—' },
};

// Armada Window palette — alternating colors per group, sisipan groups always amber
const WINDOW_PALETTE_BASE = [
  { dot: '#0EA5E9', bg: '#F0F9FF', text: '#0C4A6E' }, // sky
  { dot: '#10B981', bg: '#ECFDF5', text: '#065F46' }, // emerald
  { dot: '#8B5CF6', bg: '#F5F3FF', text: '#5B21B6' }, // violet
  { dot: '#F472B6', bg: '#FDF2F8', text: '#9F1239' }, // pink
  { dot: '#06B6D4', bg: '#ECFEFF', text: '#155E75' }, // cyan
  { dot: '#84CC16', bg: '#F7FEE7', text: '#365314' }, // lime
];
const WINDOW_PALETTE_SISIPAN = { dot: '#F59E0B', bg: '#FEF3C7', text: '#92400E' }; // amber for sisipan

const windowColor = (groupId, hasSisipan) => hasSisipan
  ? WINDOW_PALETTE_SISIPAN
  : WINDOW_PALETTE_BASE[((groupId || 1) - 1) % WINDOW_PALETTE_BASE.length];

// ─── Reusable UI Atoms ─────────────────────────────────────────────────────

const BusTag = ({ busId, size = 'sm' }) => {
  const c = busColor(busId);
  const dim = size === 'lg'
    ? { w: 32, h: 22, fs: 11, br: 4 }
    : size === 'md'
    ? { w: 28, h: 18, fs: 10.5, br: 4 }
    : { w: 24, h: 16, fs: 9.5, br: 3 };
  return (
    <span
      className="inline-flex items-center justify-center font-semibold leading-none"
      style={{
        background: c.solid, color: '#FFFFFF',
        minWidth: dim.w, height: dim.h, fontSize: dim.fs,
        borderRadius: dim.br, letterSpacing: '0.01em',
      }}
    >
      B{String(busId).padStart(2, '0')}
    </span>
  );
};

const PeriodBadge = ({ kategori, kode, showLabel = true, size = 'md' }) => {
  const pal = PERIOD_PALETTE[kategori] || PERIOD_PALETTE.Tutup;
  const fs = size === 'sm' ? 9 : 10;
  return (
    <span className="inline-flex items-center gap-1 leading-none">
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: pal.dot, display: 'inline-block', flexShrink: 0 }} />
      {showLabel && (
        <span style={{ color: pal.text, fontSize: fs, fontWeight: 600, letterSpacing: '0.04em' }}>
          {pal.label}
        </span>
      )}
      {kode && (
        <span style={{ color: TOKENS.textSubtle, fontSize: fs - 1, fontFamily: 'ui-monospace, monospace' }}>
          {kode}
        </span>
      )}
    </span>
  );
};

const StatusDot = ({ kind = 'good' }) => {
  const colors = { good: '#059669', warn: '#D97706', critical: '#DC2626', neutral: '#71717A' };
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors[kind], display: 'inline-block' }} />;
};

const KpiTile = ({ label, value, unit, sub, accent }) => (
  <div className="px-4 py-3" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8 }}>
    <div className="flex items-center gap-1.5 mb-1.5">
      {accent && <span style={{ width: 4, height: 12, borderRadius: 2, background: accent, display: 'inline-block' }} />}
      <span style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span style={{ fontSize: 22, fontWeight: 600, color: TOKENS.textPrimary, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</span>
      {unit && <span style={{ fontSize: 11, color: TOKENS.textMuted }}>{unit}</span>}
    </div>
    {sub && <div style={{ fontSize: 11, color: TOKENS.textMuted, marginTop: 4 }}>{sub}</div>}
  </div>
);

const PageSection = ({ title, subtitle, action, children }) => (
  <section className="mt-7">
    <div className="flex items-end justify-between mb-3">
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: TOKENS.textPrimary, letterSpacing: '-0.01em', margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: TOKENS.textMuted, marginTop: 3 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
    {children}
  </section>
);

// ─── Sub-components ─────────────────────────────────────────────────────────

const KpiStrip = ({ stats, route, m, sched }) => {
  const headwayStatus = m.statusHeadway?.label === 'BAIK' ? 'good' : m.statusHeadway?.label === 'STANDAR' ? 'warn' : 'critical';
  const tiles = [
    { label: 'Total Trip', value: sched.trips.length, unit: m.isPP ? 'trip 1-arah' : 'loop', accent: TOKENS.brand },
    { label: 'Bus Aktif', value: sched.totalBuses, unit: 'unit', sub: `dari max ${route.armada} dikonfigurasi` },
    { label: 'RIT Cycle', value: (sched.rits || []).length, unit: 'rit', sub: `${sched.ritGroups.length} armada window` },
    { label: 'Headway', value: stats.headwayRange, unit: 'mnt', sub: `${m.statusHeadway?.label || '—'}` },
    { label: 'Cycle Time', value: fmtDurMin(m.cycleTime), unit: '', sub: `service ${fmtDurMin(m.serviceTime)} + layover ${fmtDurMin(m.layoverTotal)}` },
    { label: 'Window Operasi', value: stats.windowLabel, unit: '', sub: `${fmtDurH(stats.totalHours)} aktif` },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((t, i) => <KpiTile key={i} {...t} />)}
    </div>
  );
};

// RitDetailTable: tampilkan setiap RIT cycle (1 RIT = 1 putaran lengkap Bus#1→Bus#n→Bus#1)
// + section ringkasan armada-window (kapan armada berapa banyak)
const RitDetailTable = ({ rits, ritGroups, busStatusEvents = [] }) => {
  if (!rits || rits.length === 0) {
    return (
      <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, padding: 24, textAlign: 'center', color: TOKENS.textMuted, fontSize: 12 }}>
        Tidak ada RIT yang dijadwalkan.
      </div>
    );
  }

  // Helper: cek apakah bus punya event status (non-active) yang overlap dengan rit
  const getBusStatusInRit = (busId, ritStart, ritEnd) => {
    for (const e of busStatusEvents) {
      if (e.busId !== busId || e.status === 'active') continue;
      if (Number(e.startMin) <= ritEnd && Number(e.endMin) >= ritStart) {
        return STATUS_OPS[e.status];
      }
    }
    return null;
  };

  return (
    <div className="space-y-4">

      {/* RIT Cycles Table */}
      <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: TOKENS.surfaceMuted, borderBottom: `1px solid ${TOKENS.border}` }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>RIT Cycles</span>
          <span style={{ fontSize: 11, color: TOKENS.textMuted, fontStyle: 'italic' }}>
            — 1 RIT = 1 putaran lengkap Bus#1 → Bus#n → kembali ke Bus#1
          </span>
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table className="w-full" style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: TOKENS.surfaceMuted, borderBottom: `1px solid ${TOKENS.border}` }}>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>RIT</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Mulai</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Selesai</th>
                <th className="text-right py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Durasi</th>
                <th className="text-right py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Trip</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Bus</th>
                <th className="text-right py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Headway</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Kategori</th>
              </tr>
            </thead>
            <tbody>
              {rits.map((r, idx) => {
                const pal = PERIOD_PALETTE[r.kategoriDom] || PERIOD_PALETTE.Tutup;
                const dur = (r.endMin - r.startMin) / 60;
                const isAdjusted = r.statusAffected;
                return (
                  <tr key={r.number} style={{
                    borderBottom: idx < rits.length - 1 ? `1px solid ${TOKENS.border}` : 'none',
                    background: isAdjusted ? '#FFFBEB' : 'transparent',
                  }}>
                    <td className="py-2 px-3" style={{ fontWeight: 700, color: TOKENS.textPrimary }}>
                      RIT-{String(r.number).padStart(2, '0')}
                      {isAdjusted && <span title="Headway ter-adjust karena status events" style={{ marginLeft: 6, fontSize: 9, color: '#92400E', background: '#FDE68A', padding: '1px 5px', borderRadius: 3, fontWeight: 700, letterSpacing: '0.04em' }}>ADJ</span>}
                    </td>
                    <td className="py-2 px-3" style={{ color: TOKENS.textSecondary }}>{fmtHM(r.startMin)}</td>
                    <td className="py-2 px-3" style={{ color: TOKENS.textSecondary }}>{fmtHM(r.endMin)}</td>
                    <td className="py-2 px-3 text-right" style={{ color: TOKENS.textMuted }}>{fmtDurH(dur)}</td>
                    <td className="py-2 px-3 text-right" style={{ color: TOKENS.textPrimary, fontWeight: 600 }}>{r.tripCount}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {r.busIds.map(b => {
                          const stat = getBusStatusInRit(b, r.startMin, r.endMin);
                          // Cek apakah bus ini sisipan di RIT ini (cek trip-trip dalam rit)
                          const isSisipanInRit = (r.trips || []).some(tr => tr.busId === b && tr.isSisipan);
                          return (
                            <span
                              key={b}
                              title={
                                stat ? `Bus #${b} ${stat.label} dalam RIT ini` :
                                isSisipanInRit ? `Bus #${b} (Bus Sisipan)` : `Bus #${b}`
                              }
                              style={{
                                background: stat ? stat.bg : (isSisipanInRit ? '#FEF3C7' : busColor(b).tint),
                                color: stat ? stat.text : (isSisipanInRit ? '#92400E' : busColor(b).deep),
                                padding: '1px 6px', borderRadius: 3,
                                fontSize: 10.5, fontWeight: 600,
                                border: stat ? `1px solid ${stat.dot}` : (isSisipanInRit ? '1px solid #F59E0B' : 'none'),
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                opacity: stat ? 0.85 : 1,
                                textDecoration: stat ? 'line-through' : 'none',
                              }}
                            >
                              {isSisipanInRit && !stat && <span style={{ fontSize: 8 }}>⭐</span>}
                              #{b}
                              {stat && (
                                <span style={{
                                  background: stat.dot, color: '#FFFFFF',
                                  width: 11, height: 11, borderRadius: 2,
                                  fontSize: 7, fontWeight: 800,
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  lineHeight: 1, flexShrink: 0,
                                  textDecoration: 'none',
                                }}>
                                  {stat.short}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right" style={{ color: pal.text, fontWeight: 600 }}>{fmtNum(r.headway, 1)}m</td>
                    <td className="py-2 px-3"><PeriodBadge kategori={r.kategoriDom} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: TOKENS.surfaceMuted, borderTop: `1px solid ${TOKENS.border}`, fontSize: 11 }}>
          <span style={{ color: TOKENS.textMuted }}>
            Total <strong style={{ color: TOKENS.textPrimary }}>{rits.length}</strong> RIT
            · <strong style={{ color: TOKENS.textPrimary }}>{rits.reduce((s, r) => s + r.tripCount, 0)}</strong> trip
            · rata-rata <strong style={{ color: TOKENS.textPrimary }}>{fmtNum(rits.reduce((s, r) => s + r.tripCount, 0) / rits.length, 1)}</strong> trip/RIT
          </span>
          {busStatusEvents.length > 0 && (() => {
            // Hitung total bus-RIT slots yang affected by status events
            let affectedSlots = 0;
            for (const r of rits) {
              for (const b of r.busIds) {
                if (getBusStatusInRit(b, r.startMin, r.endMin)) affectedSlots++;
              }
            }
            return affectedSlots > 0 ? (
              <span style={{ color: TOKENS.textMuted, fontSize: 10.5 }}>
                <strong style={{ color: '#92400E' }}>{affectedSlots}</strong> bus-slot dgn status non-Aktif (icon di chip bus)
              </span>
            ) : null;
          })()}
        </div>
      </div>

      {/* Armada Windows Summary */}
      {ritGroups && ritGroups.length > 0 && (
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, overflow: 'hidden' }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: TOKENS.surfaceMuted, borderBottom: `1px solid ${TOKENS.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Armada Window</span>
            <span style={{ fontSize: 11, color: TOKENS.textMuted, fontStyle: 'italic' }}>
              — blok waktu dengan jumlah armada konstan (sebelum di-cycle ke RIT individual)
            </span>
          </div>
          <table className="w-full" style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: TOKENS.surfaceMuted, borderBottom: `1px solid ${TOKENS.border}` }}>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Window</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Jam</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Armada</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Headway</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Frek/Jam</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Kebijakan</th>
                <th className="text-left py-2 px-3" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Periode Termuat</th>
              </tr>
            </thead>
            <tbody>
              {ritGroups.map((g, idx) => {
                const dom = g.periodes[0]?.kategori;
                const pal = PERIOD_PALETTE[dom] || PERIOD_PALETTE.Tutup;
                return (
                  <tr key={g.id} style={{ borderBottom: idx < ritGroups.length - 1 ? `1px solid ${TOKENS.border}` : 'none' }}>
                    <td className="py-2 px-3" style={{ fontWeight: 600, color: TOKENS.textPrimary, fontFamily: 'ui-monospace, monospace' }}>W-{String(g.id).padStart(2, '0')}</td>
                    <td className="py-2 px-3" style={{ color: TOKENS.textSecondary }}>
                      {fmtHM(g.startMin)} – {fmtHM(g.endMin)}
                      <span style={{ color: TOKENS.textSubtle, marginLeft: 6 }}>({fmtDurMin(g.endMin - g.startMin)})</span>
                    </td>
                    <td className="py-2 px-3" style={{ color: TOKENS.textPrimary, fontWeight: 500 }}>{g.armada} bus</td>
                    <td className="py-2 px-3" style={{ color: pal.text, fontWeight: 600 }}>{fmtNum(g.headway, 1)} mnt</td>
                    <td className="py-2 px-3" style={{ color: TOKENS.textSecondary }}>{fmtNum(60 / g.headway, 1)}</td>
                    <td className="py-2 px-3"><PeriodBadge kategori={dom} /></td>
                    <td className="py-2 px-3" style={{ color: TOKENS.textSubtle, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
                      {g.periodes.map(p => p.kode).join(' · ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const RitGroupTable = ({ ritGroups }) => (
  <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, overflow: 'hidden' }}>
    <table className="w-full" style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: TOKENS.surfaceMuted, borderBottom: `1px solid ${TOKENS.border}` }}>
          <th className="text-left py-2.5 px-4" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Window</th>
          <th className="text-left py-2.5 px-4" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Jam</th>
          <th className="text-left py-2.5 px-4" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Armada</th>
          <th className="text-left py-2.5 px-4" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Headway</th>
          <th className="text-left py-2.5 px-4" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Frek/Jam</th>
          <th className="text-left py-2.5 px-4" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Kebijakan</th>
          <th className="text-left py-2.5 px-4" style={{ fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Periode Termuat</th>
        </tr>
      </thead>
      <tbody>
        {ritGroups.map((g, idx) => {
          const dom = g.periodes[0]?.kategori;
          const pal = PERIOD_PALETTE[dom] || PERIOD_PALETTE.Tutup;
          return (
            <tr key={g.id} style={{ borderBottom: idx < ritGroups.length - 1 ? `1px solid ${TOKENS.border}` : 'none' }}>
              <td className="py-2.5 px-4" style={{ fontWeight: 600, color: TOKENS.textPrimary, fontFamily: 'ui-monospace, monospace' }}>W-{String(g.id).padStart(2, '0')}</td>
              <td className="py-2.5 px-4" style={{ color: TOKENS.textSecondary }}>
                {fmtHM(g.startMin)} – {fmtHM(g.endMin)}
                <span style={{ color: TOKENS.textSubtle, marginLeft: 6 }}>({fmtDurMin(g.endMin - g.startMin)})</span>
              </td>
              <td className="py-2.5 px-4" style={{ color: TOKENS.textPrimary, fontWeight: 500 }}>{g.armada} bus</td>
              <td className="py-2.5 px-4" style={{ color: pal.text, fontWeight: 600 }}>{fmtNum(g.headway, 1)} mnt</td>
              <td className="py-2.5 px-4" style={{ color: TOKENS.textSecondary }}>{fmtNum(60 / g.headway, 1)}</td>
              <td className="py-2.5 px-4">
                <PeriodBadge kategori={dom} />
              </td>
              <td className="py-2.5 px-4" style={{ color: TOKENS.textSubtle, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
                {g.periodes.map(p => p.kode).join(' · ')}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const MareyDiagram = ({ buses, hours, winStart, winEnd, pxPerHour, isPP }) => {
  const winSpan = winEnd - winStart;
  const totalWidth = hours.length * pxPerHour;
  const labelW = 200;
  const activeBuses = buses.filter(b => b.tripCount > 0);

  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: labelW + totalWidth, fontVariantNumeric: 'tabular-nums' }}>
          {/* Time axis header */}
          <div className="flex" style={{ borderBottom: `1px solid ${TOKENS.border}`, background: TOKENS.surfaceMuted, position: 'sticky', top: 0, zIndex: 5 }}>
            <div style={{ width: labelW, flexShrink: 0, borderRight: `1px solid ${TOKENS.border}`, padding: '8px 14px', fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'flex-end' }}>
              Bus · Stat
            </div>
            <div className="relative flex-1" style={{ height: 44 }}>
              {hours.map((h, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0"
                  style={{
                    left: i * pxPerHour, width: pxPerHour,
                    borderLeft: `1px solid ${TOKENS.border}`,
                    padding: '6px 8px',
                    background: i % 2 === 1 ? 'rgba(0,0,0,0.012)' : 'transparent',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: TOKENS.textPrimary, lineHeight: 1 }}>{h.label}</div>
                  <div style={{ marginTop: 5 }}>
                    <PeriodBadge kategori={h.periode?.kategori} kode={h.periode?.kode} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bus rows */}
          {activeBuses.map(bus => {
            const c = busColor(bus.id);
            const utilColor = bus.utilizationPct >= 0.7 ? '#059669' : bus.utilizationPct >= 0.5 ? '#D97706' : '#DC2626';
            const gaps = [];
            for (let i = 0; i < bus.trips.length - 1; i++) {
              const t = bus.trips[i], nt = bus.trips[i + 1];
              if (nt.depMinutes > t.arrMinutes) {
                gaps.push({
                  start: t.arrMinutes, end: nt.depMinutes,
                  mins: nt.depMinutes - t.arrMinutes,
                  isInterRit: t.ritNumber !== nt.ritNumber,
                  fromRit: t.ritNumber, toRit: nt.ritNumber,
                });
              }
            }
            return (
              <div key={bus.id} className="flex" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                <div className="flex items-center gap-2.5" style={{ width: labelW, flexShrink: 0, borderRight: `1px solid ${TOKENS.border}`, padding: '10px 14px' }}>
                  <BusTag busId={bus.id} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5" style={{ marginBottom: 1 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: utilColor }} />
                      <span style={{ fontSize: 11, color: utilColor, fontWeight: 600 }}>{fmtPct(bus.utilizationPct, 0)}</span>
                      <span style={{ fontSize: 10, color: TOKENS.textSubtle }}>util</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: TOKENS.textMuted, lineHeight: 1.35 }}>
                      {bus.tripCount} trip · {fmtNum(bus.totalKm, 0)} km
                    </div>
                  </div>
                </div>
                <div className="relative flex-1" style={{ height: 56 }}>
                  {/* Hour grid */}
                  {hours.map((h, i) => (
                    <div key={i} className="absolute top-0 bottom-0" style={{
                      left: i * pxPerHour, width: pxPerHour,
                      borderLeft: `1px solid ${TOKENS.border}`,
                      background: i % 2 === 1 ? 'rgba(0,0,0,0.012)' : 'transparent',
                    }} />
                  ))}
                  {/* Layover gaps */}
                  {gaps.map((g, gi) => {
                    const left = ((g.start - winStart) / winSpan) * totalWidth;
                    const width = (g.mins / winSpan) * totalWidth;
                    if (width < 1) return null;
                    return (
                      <div
                        key={`gap-${gi}`}
                        className="absolute flex items-center justify-center"
                        style={{
                          left, width, top: 14, bottom: 14,
                          background: g.isInterRit
                            ? `repeating-linear-gradient(135deg, ${c.tint}, ${c.tint} 5px, transparent 5px, transparent 9px)`
                            : c.tint,
                          fontSize: 9, fontWeight: 600, color: c.deep,
                          borderRadius: 2,
                          border: g.isInterRit ? `1px dashed ${c.solid}66` : 'none',
                        }}
                        title={g.isInterRit
                          ? `Transisi RIT-${String(g.fromRit).padStart(2, '0')} → RIT-${String(g.toRit).padStart(2, '0')} · ${g.mins.toFixed(0)} mnt`
                          : `Layover terminal · ${g.mins.toFixed(0)} mnt`}
                      >
                        {width > 36 && (g.isInterRit ? `→R${String(g.toRit).padStart(2, '0')}` : `${Math.round(g.mins)}m`)}
                      </div>
                    );
                  })}
                  {/* Trip blocks */}
                  {bus.trips.map((trip, ti) => {
                    const left = ((trip.depMinutes - winStart) / winSpan) * totalWidth;
                    const width = ((trip.arrMinutes - trip.depMinutes) / winSpan) * totalWidth;
                    const dirSym = trip.direction === 'berangkat' ? '→' : '←';
                    return (
                      <div
                        key={ti}
                        className="absolute flex items-center justify-center"
                        style={{
                          left, width: Math.max(2, width),
                          top: 10, bottom: 10,
                          background: c.solid, color: '#FFFFFF',
                          borderRadius: 3,
                          fontSize: 10, fontWeight: 600,
                          letterSpacing: '0.02em', overflow: 'hidden',
                          boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                        }}
                        title={`Trip #${trip.id} · ${trip.direction.toUpperCase()} · ${fmtHM(trip.depMinutes)}–${fmtHM(trip.arrMinutes)} · RIT-${String(trip.ritNumber).padStart(2, '0')} · ${trip.periode?.kategori || ''}`}
                      >
                        {width > 32 ? `${dirSym}${trip.id}` : (width > 14 ? dirSym : '')}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend strip */}
      <div className="flex items-center gap-5 px-4 py-2.5" style={{ background: TOKENS.surfaceMuted, borderTop: `1px solid ${TOKENS.border}` }}>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 22, height: 10, background: BUS_PALETTE[0].solid, borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: TOKENS.textMuted }}>Trip aktif</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 22, height: 10, background: BUS_PALETTE[0].tint, borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: TOKENS.textMuted }}>Layover terminal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 22, height: 10, background: `repeating-linear-gradient(135deg, ${BUS_PALETTE[0].tint}, ${BUS_PALETTE[0].tint} 5px, transparent 5px, transparent 9px)`, border: `1px dashed ${BUS_PALETTE[0].solid}66`, borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: TOKENS.textMuted }}>Transisi antar Rit (istirahat panjang)</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span style={{ fontSize: 11, color: TOKENS.textMuted }}>{isPP ? '→ Berangkat · ← Pulang' : '→ Searah Loop'}</span>
        </div>
      </div>
    </div>
  );
};

const StopHourMatrix = ({ halteRows, hours, pxPerHour, totalRouteKm, isPulang, busStatusEvents = [], spotlightSisipan = true }) => {
  const labelW = 220;
  const totalWidth = hours.length * pxPerHour;
  // Look up status icon for a specific bus at a specific arrival time
  const getStatusIconAtTime = (busId, time) => {
    if (time === null || time === undefined) return null;
    for (const e of busStatusEvents) {
      if (e.busId !== busId || e.status === 'active') continue;
      if (time >= Number(e.startMin) && time <= Number(e.endMin)) {
        const s = STATUS_OPS[e.status];
        return { short: s.short, color: s.dot, label: s.label, catatan: e.catatan };
      }
    }
    return null;
  };
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: labelW + totalWidth, fontVariantNumeric: 'tabular-nums' }}>
          {/* Header */}
          <div className="flex" style={{ borderBottom: `1px solid ${TOKENS.border}`, background: TOKENS.surfaceMuted, position: 'sticky', top: 0, zIndex: 5 }}>
            <div style={{ width: labelW, flexShrink: 0, borderRight: `1px solid ${TOKENS.border}`, padding: '8px 14px', fontSize: 10, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'flex-end' }}>
              Halte / Stop · KM
            </div>
            <div className="relative flex-1" style={{ height: 44 }}>
              {hours.map((h, i) => (
                <div key={i} className="absolute top-0 bottom-0" style={{
                  left: i * pxPerHour, width: pxPerHour,
                  borderLeft: `1px solid ${TOKENS.border}`,
                  padding: '10px 8px',
                  background: i % 2 === 1 ? 'rgba(0,0,0,0.012)' : 'transparent',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.textPrimary, lineHeight: 1 }}>{h.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Rows */}
          {halteRows.map(({ halte, halteIdx, buckets, jarakDisplay }) => {
            const isTerminal = halteIdx === 0 || halteIdx === halteRows.length - 1;
            const totalArr = buckets.reduce((s, b) => s + b.length, 0);
            return (
              <div key={halteIdx} className="flex" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                <div style={{ width: labelW, flexShrink: 0, borderRight: `1px solid ${TOKENS.border}`, padding: '10px 14px', background: isTerminal ? 'rgba(4,120,87,0.04)' : TOKENS.surface }}>
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontSize: 10, color: TOKENS.textSubtle, fontFamily: 'ui-monospace, monospace' }}>{String(halteIdx + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: 12.5, color: TOKENS.textPrimary, fontWeight: isTerminal ? 600 : 500, lineHeight: 1.3 }}>{halte.nama}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1" style={{ fontSize: 10.5, color: TOKENS.textMuted }}>
                    <span>km {fmtNum(jarakDisplay, 2)}</span>
                    <span style={{ color: TOKENS.borderStrong }}>·</span>
                    <span>{totalArr} kedatangan</span>
                    {isTerminal && (
                      <span style={{ color: TOKENS.brand, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 4 }}>
                        Terminal
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative flex-1">
                  {hours.map((h, hi) => (
                    <div key={hi} className="absolute top-0 bottom-0" style={{
                      left: hi * pxPerHour, width: pxPerHour,
                      borderLeft: `1px solid ${TOKENS.border}`,
                      background: hi % 2 === 1 ? 'rgba(0,0,0,0.012)' : 'transparent',
                    }} />
                  ))}
                  <div className="flex">
                    {buckets.map((arrivals, hi) => (
                      <div key={hi} style={{ width: pxPerHour, padding: '8px 8px 6px', minHeight: 36 }}>
                        {arrivals.map((a, ai) => {
                          const statIcon = getStatusIconAtTime(a.busId, a.time);
                          const isSisipan = !!a.isSisipan;
                          const showSpotlight = spotlightSisipan && isSisipan;
                          return (
                            <div
                              key={ai}
                              className="flex items-center gap-1.5"
                              style={{
                                marginBottom: 2.5, lineHeight: 1,
                                ...(statIcon ? {
                                  borderLeft: `2px solid ${statIcon.color}`,
                                  paddingLeft: 4,
                                  marginLeft: -2,
                                } : showSpotlight ? {
                                  borderLeft: '2px solid #F59E0B',
                                  paddingLeft: 4,
                                  marginLeft: -2,
                                  background: '#FEF3C7',
                                  borderRadius: 3,
                                  paddingRight: 4,
                                } : {}),
                              }}
                              title={
                                statIcon ? `Bus #${a.busId} ${statIcon.label}${statIcon.catatan ? ' · ' + statIcon.catatan : ''}` :
                                showSpotlight ? `Bus #${a.busId} (Bus Sisipan) — dari penambahan armada periode ini` :
                                undefined
                              }
                            >
                              {showSpotlight && !statIcon && <span style={{ fontSize: 9 }}>⭐</span>}
                              <span style={{ fontSize: 11, color: showSpotlight ? '#92400E' : TOKENS.textPrimary, fontWeight: showSpotlight ? 600 : 400, fontVariantNumeric: 'tabular-nums', minWidth: 30 }}>
                                {fmtHM(a.time)}
                              </span>
                              <BusTag busId={a.busId} size="sm" />
                              {statIcon && (
                                <span style={{
                                  width: 13, height: 13, borderRadius: 3,
                                  background: statIcon.color, color: '#FFFFFF',
                                  fontSize: 8, fontWeight: 800,
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  lineHeight: 1, flexShrink: 0,
                                }}>
                                  {statIcon.short}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── TRIP-BASED MATRIX (Halte × Trip) — Dispatcher View ────────────────────
// Format alternatif: setiap KOLOM = 1 trip (bukan 1 jam), dengan header bertingkat:
//   Row 1: Policy/Kebijakan periode
//   Row 2: RIT span (visual grouping)
//   Row 3: Trip number (T1, T2, ...)
//   Row 4: Bus assignment (#1, #2, ...)
// Cocok untuk dispatcher / supervisor lapangan yg butuh tracking rotasi bus.

const TripBasedMatrix = ({
  trips, halte, isPulang, totalRouteKm,
  busStatusEvents = [],
  spotlightSisipan = true,    // Ide 1: ⭐ marker
  colorMode = 'periode',       // Ide 2: 'bus' | 'periode' | 'window'
  tripTooltip = true,          // Ide 3: hover detail card
}) => {
  // Hover state for rich Trip Context Card tooltip
  const [hoveredTrip, setHoveredTrip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!trips || trips.length === 0) {
    return (
      <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, padding: 24, textAlign: 'center', color: TOKENS.textMuted, fontSize: 12 }}>
        Tidak ada trip ke arah ini.
      </div>
    );
  }

  // Group trips by ritNumber → for header span row (sequential RIT cycles)
  const ritSpans = [];
  let curr = null;
  trips.forEach((t, idx) => {
    if (curr && curr.ritNumber === t.ritNumber) {
      curr.endIdx = idx;
      curr.count++;
      curr.busesInRit.add(t.busId);
    } else {
      curr = {
        ritNumber: t.ritNumber,
        startIdx: idx,
        endIdx: idx,
        count: 1,
        kategori: t.periode?.kategori,
        busesInRit: new Set([t.busId]),
        headway: t.ritHeadway,
      };
      ritSpans.push(curr);
    }
  });

  const colW = 64;
  const labelW = 220;
  const totalW = labelW + trips.length * colW;

  // Look up status icon for a specific bus at a specific time.
  // Used per-cell: icon hanya muncul di cell yang time-nya jatuh dalam rentang event.
  // Boundary inclusive: time DI atau SEBELUM endMin masih ditandai (biar cell terakhir punya icon).
  const getStatusIconAtTime = (busId, time) => {
    if (time === null || time === undefined) return null;
    for (const e of busStatusEvents) {
      if (e.busId !== busId || e.status === 'active') continue;
      if (time >= Number(e.startMin) && time <= Number(e.endMin)) {
        const s = STATUS_OPS[e.status];
        return { short: s.short, color: s.dot, bg: s.bg, label: s.label, catatan: e.catatan };
      }
    }
    return null;
  };

  // For trip-level overlap (used in bus header row): show icon if ANY part of trip overlaps event
  const getTripStatusIcon = (trip) => {
    for (const e of busStatusEvents) {
      if (e.busId !== trip.busId || e.status === 'active') continue;
      const tripStart = trip.depMinutes;
      const tripEnd = trip.arrMinutes ?? trip.depMinutes;
      // Inclusive boundary: trip touching event endpoint counts as overlap
      if (tripStart <= Number(e.endMin) && tripEnd >= Number(e.startMin)) {
        const s = STATUS_OPS[e.status];
        return { short: s.short, color: s.dot, bg: s.bg, label: s.label, catatan: e.catatan };
      }
    }
    return null;
  };

  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: totalW, fontVariantNumeric: 'tabular-nums' }}>

          {/* ─── HEADER ROW 1: RIT SPANS (dispatch cycles) ─── */}
          <div className="flex" style={{ background: '#FAFAFA', borderBottom: `1px solid ${TOKENS.border}` }}>
            <div style={{ width: labelW, flexShrink: 0, padding: '6px 14px', borderRight: `1px solid ${TOKENS.border}`, fontSize: 9, fontWeight: 600, color: TOKENS.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontStyle: 'italic' }}>
              RIT →
            </div>
            <div className="flex">
              {ritSpans.map(rit => {
                const pal = PERIOD_PALETTE[rit.kategori] || PERIOD_PALETTE.Tutup;
                const isStandbyRit = rit.ritNumber === 0;
                return (
                  <div key={rit.ritNumber} style={{
                    width: rit.count * colW, padding: '5px 4px', textAlign: 'center',
                    borderLeft: isStandbyRit ? '4px double #10B981' : `1px solid ${TOKENS.border}`,
                    background: isStandbyRit ? '#ECFDF5' : '#FFFFFF',
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                      color: isStandbyRit ? '#065F46' : TOKENS.textPrimary,
                    }}>
                      {isStandbyRit ? '✦ STANDBY' : `RIT ${rit.ritNumber}`}
                    </span>
                    <span style={{ fontSize: 9, color: isStandbyRit ? '#0F6E56' : TOKENS.textMuted, marginLeft: 5 }}>
                      {isStandbyRit
                        ? `${rit.busesInRit.size} bus · ${rit.count} trip`
                        : `${rit.busesInRit.size} bus · H=${fmtNum(rit.headway, 1)}m`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── HEADER ROW 2: TRIP NUMBERS (dark band, like the image) ─── */}
          <div className="flex" style={{ background: '#1E3A8A', color: '#FFFFFF' }}>
            <div style={{ width: labelW, flexShrink: 0, padding: '8px 14px', borderRight: '1px solid #1E40AF', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
              Halte \ Trip
            </div>
            <div className="flex">
              {trips.map((t, i) => {
                // Detect first standby trip after regular section (separator location)
                const prevTrip = i > 0 ? trips[i - 1] : null;
                const isFirstStandby = t.isStandby && (!prevTrip || !prevTrip.isStandby);
                return (
                <div
                  key={i}
                  style={{
                    width: colW, padding: '8px 2px', textAlign: 'center',
                    borderLeft: isFirstStandby ? '4px double #10B981' : '1px solid #2563EB',
                    fontSize: 11, fontWeight: 600,
                    ...(spotlightSisipan && t.isStandby ? {
                      background: '#065F46',
                      borderLeft: isFirstStandby ? '4px double #10B981' : '2px solid #10B981',
                      borderRight: '2px solid #10B981',
                    } : spotlightSisipan && t.isSisipan ? {
                      background: '#92400E',
                      borderLeft: '2px solid #F59E0B',
                      borderRight: '2px solid #F59E0B',
                    } : {}),
                  }}
                  onMouseEnter={tripTooltip ? (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredTrip(t);
                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.bottom });
                  } : undefined}
                  onMouseLeave={tripTooltip ? () => setHoveredTrip(null) : undefined}
                >
                  T{t.id}
                  {spotlightSisipan && t.isStandby && <span style={{ fontSize: 8, marginLeft: 1 }} title="Standby">✦</span>}
                  {spotlightSisipan && t.isSisipan && !t.isStandby && <span style={{ fontSize: 8, marginLeft: 1 }}>⭐</span>}
                </div>
              );})}
            </div>
          </div>

          {/* ─── HEADER ROW 4: BUS ASSIGNMENT ─── */}
          <div className="flex" style={{ background: '#DBEAFE', borderBottom: `1px solid ${TOKENS.border}` }}>
            <div style={{ width: labelW, flexShrink: 0, padding: '7px 14px', borderRight: `1px solid ${TOKENS.border}`, fontSize: 11, fontWeight: 600, color: '#1E3A8A' }}>
              Bus #
            </div>
            <div className="flex">
              {trips.map((t, i) => {
                const c = busColor(t.busId);
                const statIcon = getTripStatusIcon(t);
                const isSisipan = !!t.isSisipan;
                const isStandby = !!t.isStandby;
                const isSlotSisipan = isSisipan && !isStandby;
                const showSpotlight = spotlightSisipan && isSisipan;
                return (
                  <div
                    key={i}
                    style={{
                      width: colW, padding: '5px 2px', textAlign: 'center',
                      borderLeft: '1px solid #BFDBFE',
                      // STANDBY (green) atau SLOT SISIPAN (amber) spotlight
                      ...(showSpotlight && isStandby ? {
                        background: '#D1FAE5',
                        borderLeft: '2px solid #10B981',
                        borderRight: '2px solid #10B981',
                      } : showSpotlight && isSlotSisipan ? {
                        background: '#FEF3C7',
                        borderLeft: '2px solid #F59E0B',
                        borderRight: '2px solid #F59E0B',
                      } : {}),
                    }}
                    onMouseEnter={tripTooltip ? (e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredTrip(t);
                      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.bottom });
                    } : undefined}
                    onMouseLeave={tripTooltip ? () => setHoveredTrip(null) : undefined}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      {showSpotlight && isStandby && (
                        <span style={{ fontSize: 10, color: '#065F46' }} title="Bus Standby">✦</span>
                      )}
                      {showSpotlight && isSlotSisipan && (
                        <span style={{ fontSize: 10, color: '#D97706', filter: 'drop-shadow(0 0 1px rgba(245,158,11,0.4))' }} title="Bus Sisipan Slot">⭐</span>
                      )}
                      <span style={{ fontSize: 11, fontWeight: 700, color: showSpotlight && isStandby ? '#065F46' : showSpotlight && isSlotSisipan ? '#92400E' : c.solid }}>#{t.busId}</span>
                      {statIcon && (
                        <span style={{ width: 13, height: 13, borderRadius: 3, background: statIcon.bg, color: statIcon.color, fontSize: 8, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title={statIcon.label}>
                          {statIcon.short}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── DIRECTION MARKER ─── */}
          <div className="flex items-center gap-1.5" style={{ background: isPulang ? '#FEF2F2' : '#ECFDF5', padding: '6px 14px', borderBottom: `1px solid ${TOKENS.border}`, fontSize: 11.5, fontWeight: 600, color: isPulang ? '#991B1B' : '#065F46' }}>
            <span style={{ fontSize: 13 }}>{isPulang ? '⬅' : '➡'}</span>
            <span>{isPulang ? 'PULANG (Titik Akhir → Titik Awal)' : 'BERANGKAT (Titik Awal → Titik Akhir)'}</span>
          </div>

          {/* ─── HALTE ROWS ─── */}
          {halte.map((h, halteIdx) => {
            const isTerminal = halteIdx === 0 || halteIdx === halte.length - 1;
            const jarakDisplay = isPulang ? totalRouteKm - h.jarakKum : h.jarakKum;
            return (
              <div key={halteIdx} className="flex" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                <div style={{ width: labelW, flexShrink: 0, padding: '7px 14px', borderRight: `1px solid ${TOKENS.border}`, background: isTerminal ? '#ECFDF5' : '#FFFFFF' }}>
                  <div className="flex items-baseline gap-1.5">
                    <span style={{ fontSize: 11, color: TOKENS.textSubtle, fontFamily: 'ui-monospace, monospace' }}>{halteIdx + 1}.</span>
                    <span style={{ fontSize: 12.5, color: TOKENS.textPrimary, fontWeight: isTerminal ? 600 : 500 }}>{h.nama}</span>
                  </div>
                  <div style={{ fontSize: 10, color: TOKENS.textMuted, marginTop: 1, marginLeft: 14 }}>
                    km {fmtNum(jarakDisplay, 2)}
                    {isTerminal && <span style={{ color: '#047857', fontWeight: 700, fontSize: 9, marginLeft: 6, letterSpacing: '0.06em' }}>TERMINAL</span>}
                  </div>
                </div>
                <div className="flex">
                  {trips.map((t, ti) => {
                    const ht = t.halteTimes[halteIdx];
                    // ── COLOR MODE: pilih palette berdasarkan mode tampilan ──
                    let pal;
                    if (colorMode === 'bus') {
                      const c = busColor(t.busId);
                      pal = { bg: c.tint, text: c.deep };
                    } else if (colorMode === 'window') {
                      const groupHasSisipan = trips.some(x => x.armadaWindow === t.armadaWindow && x.isSisipan);
                      pal = windowColor(t.armadaWindow, groupHasSisipan);
                    } else {
                      pal = PERIOD_PALETTE[t.periode?.kategori] || PERIOD_PALETTE.Tutup;
                    }
                    // PER-CELL CHECK: icon hanya muncul di cell yang waktunya jatuh dalam rentang event
                    const cellTime = ht ? ht.arrival : null;
                    const statIcon = getStatusIconAtTime(t.busId, cellTime);
                    return (
                      <div key={ti} style={{
                        width: colW, padding: '6px 3px', textAlign: 'center',
                        borderLeft: `1px solid ${TOKENS.border}80`,
                        background: pal.bg,
                        borderTop: statIcon ? `2px solid ${statIcon.color}` : 'none',
                        fontSize: 11, color: pal.text,
                        fontWeight: statIcon ? 700 : 500,
                        position: 'relative',
                      }}
                      title={`T${t.id} · ${cellTime !== null ? fmtHM(cellTime) : '—'} · ${t.periode?.nama || ''}${statIcon ? ' · Bus #' + t.busId + ' ' + statIcon.label.toUpperCase() + (statIcon.catatan ? ' (' + statIcon.catatan + ')' : '') : ''}`}>
                        {ht ? (
                          <span className="inline-flex items-center" style={{ gap: 3, justifyContent: 'center' }}>
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtHM(ht.arrival)}</span>
                            {statIcon && (
                              <span style={{
                                width: 13, height: 13, borderRadius: 3,
                                background: statIcon.color, color: '#FFFFFF',
                                fontSize: 8, fontWeight: 800,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                lineHeight: 1, flexShrink: 0,
                              }}>
                                {statIcon.short}
                              </span>
                            )}
                          </span>
                        ) : '—'}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Footer with quick legend */}
      <div className="flex items-center gap-3 flex-wrap" style={{ background: TOKENS.surfaceMuted, borderTop: `1px solid ${TOKENS.border}`, padding: '8px 14px', fontSize: 11, color: TOKENS.textMuted }}>
        <span style={{ fontWeight: 600, color: TOKENS.textSecondary }}>Cara baca:</span>
        <span><strong style={{ color: TOKENS.textSecondary }}>Periode</strong> = label waktu (kontekstual)</span>
        <span style={{ color: TOKENS.borderStrong }}>·</span>
        <span><strong style={{ color: TOKENS.textSecondary }}>RIT</strong> = siklus dispatch armada</span>
        <span style={{ color: TOKENS.borderStrong }}>·</span>
        <span>
          <strong style={{ color: TOKENS.textSecondary }}>Warna sel</strong> = {
            colorMode === 'bus'     ? 'identitas bus' :
            colorMode === 'window'  ? 'armada window (perubahan armada)' :
                                       'kategori periode'
          }
        </span>
        <span style={{ color: TOKENS.borderStrong }}>·</span>
        <span><strong style={{ color: TOKENS.textSecondary }}>Icon di samping jam</strong> = status bus override</span>
        {spotlightSisipan && (
          <>
            <span style={{ color: TOKENS.borderStrong }}>·</span>
            <span><span style={{ color: '#D97706' }}>⭐ Bus Sisipan</span></span>
          </>
        )}
        {tripTooltip && (
          <>
            <span style={{ color: TOKENS.borderStrong }}>·</span>
            <span><span style={{ color: '#1E40AF' }}>💡 hover</span> trip cell untuk detail</span>
          </>
        )}
      </div>

      {/* TRIP CONTEXT CARD — rich hover tooltip (conditional via tripTooltip toggle) */}
      {tripTooltip && hoveredTrip && trips.find(x => x.id === hoveredTrip.id) && (() => {
        const t = hoveredTrip;
        const c = busColor(t.busId);
        const pal = PERIOD_PALETTE[t.periode?.kategori] || PERIOD_PALETTE.Tutup;
        const isSisipan = !!t.isSisipan;
        // Find position in RIT
        const ritTrips = trips.filter(x => x.ritNumber === t.ritNumber).sort((a,b)=>a.depMinutes-b.depMinutes);
        const posInRit = ritTrips.findIndex(x => x.id === t.id) + 1;
        // Next trip same RIT or next RIT
        const idx = trips.findIndex(x => x.id === t.id);
        const nextTrip = idx >= 0 && idx < trips.length - 1 ? trips[idx + 1] : null;
        // Bus stats for the day
        const busTrips = trips.filter(x => x.busId === t.busId).sort((a,b)=>a.depMinutes-b.depMinutes);
        const busTripIdx = busTrips.findIndex(x => x.id === t.id) + 1;
        const nextBusTrip = busTrips[busTripIdx]; // index after current
        const layoverNext = nextBusTrip ? Math.max(0, nextBusTrip.depMinutes - t.arrMinutes) : null;
        const periode = t.periode || {};
        const baseAr = Number(periode.armadaPeriode) || 0;
        const sisipanAm = Number(periode.sisipan) || 0;
        const effAr = baseAr + sisipanAm;

        // Smart positioning: if tooltip would go off right edge, shift left
        const tooltipW = 320;
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const x = Math.min(tooltipPos.x - tooltipW / 2, screenW - tooltipW - 16);

        return (
          <div
            style={{
              position: 'fixed',
              left: Math.max(8, x),
              top: tooltipPos.y + 8,
              width: tooltipW,
              background: '#FFFFFF',
              border: `1.5px solid ${isSisipan ? '#F59E0B' : TOKENS.borderStrong}`,
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)',
              zIndex: 1000,
              fontSize: 12,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            {/* HEADER */}
            <div style={{
              padding: '10px 14px',
              background: isSisipan ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)' : pal.bg,
              borderBottom: `1px solid ${isSisipan ? '#F59E0B' : TOKENS.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, fontWeight: 700, color: isSisipan ? '#92400E' : pal.text }}>
                  Trip {t.id}
                </span>
                <span style={{ fontSize: 11, color: isSisipan ? '#92400E' : pal.text, opacity: 0.85, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtHM(t.depMinutes)} → {fmtHM(t.arrMinutes)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {isSisipan && <span style={{ fontSize: 10 }}>⭐</span>}
                <span style={{
                  background: isSisipan ? '#F59E0B' : c.solid,
                  color: '#FFFFFF',
                  padding: '2px 8px', borderRadius: 3,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                }}>
                  Bus #{t.busId}{isSisipan ? ' SISIPAN' : ''}
                </span>
              </div>
            </div>

            {/* SECTION 1: RIT info */}
            <div style={{ padding: '8px 14px', borderBottom: '1px solid #F4F4F5', display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 14 }}>🔄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: TOKENS.textPrimary, fontWeight: 600 }}>
                  RIT {t.ritNumber} · trip {posInRit} dari {ritTrips.length}
                </div>
                {nextTrip && (
                  <div style={{ fontSize: 10.5, color: TOKENS.textMuted, marginTop: 1 }}>
                    Selanjutnya: Bus #{nextTrip.busId}{nextTrip.isSisipan ? ' ⭐' : ''} @ {fmtHM(nextTrip.depMinutes)}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: Periode info */}
            <div style={{ padding: '8px 14px', borderBottom: '1px solid #F4F4F5', display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 14 }}>📅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: TOKENS.textPrimary, fontWeight: 600 }}>
                  <span style={{ background: pal.bg, color: pal.text, padding: '0 5px', borderRadius: 2, fontSize: 10, fontWeight: 700, marginRight: 4 }}>{periode.kode}</span>
                  {periode.nama}
                </div>
                <div style={{ fontSize: 10.5, color: TOKENS.textMuted, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {periode.jam} ·{' '}
                  {sisipanAm !== 0 ? (
                    <span>{baseAr} base {sisipanAm > 0 ? '+' : ''}{sisipanAm} sisipan = <strong style={{ color: '#92400E' }}>{effAr} bus</strong></span>
                  ) : (
                    <span>{baseAr} bus</span>
                  )}
                  {' · '}headway {fmtNum(t.ritHeadway, 1)}m
                </div>
              </div>
            </div>

            {/* SECTION 3: Bus daily stats */}
            <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 14 }}>🚍</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: TOKENS.textPrimary, fontWeight: 600 }}>
                  Bus #{t.busId} hari ini: trip {busTripIdx} dari {busTrips.length}
                </div>
                {layoverNext !== null && (
                  <div style={{ fontSize: 10.5, color: TOKENS.textMuted, marginTop: 1 }}>
                    Layover berikutnya: <strong>{fmtDurMin(layoverNext)}</strong>
                  </div>
                )}
                {!nextBusTrip && (
                  <div style={{ fontSize: 10.5, color: TOKENS.textMuted, marginTop: 1, fontStyle: 'italic' }}>
                    Trip terakhir hari ini untuk bus ini
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const BusUtilizationList = ({ buses, isPP }) => {
  const active = buses.filter(b => b.tripCount > 0);
  const idle = buses.filter(b => b.tripCount === 0);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {active.map(b => {
          const c = busColor(b.id);
          const utilColor = b.utilizationPct >= 0.7 ? '#059669' : b.utilizationPct >= 0.5 ? '#D97706' : '#DC2626';
          const utilLabel = b.utilizationPct >= 0.7 ? 'Optimal' : b.utilizationPct >= 0.5 ? 'Cukup' : 'Rendah';
          const utilBg = b.utilizationPct >= 0.7 ? '#ECFDF5' : b.utilizationPct >= 0.5 ? '#FFFBEB' : '#FEF2F2';
          return (
            <div key={b.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8 }}>
              <div className="flex items-center gap-3 p-3.5" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                <BusTag busId={b.id} size="lg" />
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.textPrimary }}>BUS-{String(b.id).padStart(2, '0')}</div>
                  <div style={{ fontSize: 11, color: TOKENS.textMuted }}>
                    Aktif {fmtHM(b.firstDep)} – {fmtHM(b.lastArr)}
                  </div>
                </div>
                <div className="text-right" style={{ background: utilBg, borderRadius: 6, padding: '5px 10px', minWidth: 64 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: utilColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{fmtPct(b.utilizationPct, 0)}</div>
                  <div style={{ fontSize: 9, color: utilColor, fontWeight: 600, marginTop: 2, letterSpacing: '0.04em' }}>{utilLabel.toUpperCase()}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-px" style={{ background: TOKENS.border }}>
                <div className="text-center py-2.5 px-1" style={{ background: TOKENS.surface }}>
                  <div style={{ fontSize: 9, color: TOKENS.textSubtle, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Trip</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{b.tripCount}</div>
                  {isPP && <div style={{ fontSize: 9, color: TOKENS.textMuted }}>{b.berangkatCount}→ · {b.pulangCount}←</div>}
                </div>
                <div className="text-center py-2.5 px-1" style={{ background: TOKENS.surface }}>
                  <div style={{ fontSize: 9, color: TOKENS.textSubtle, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>KM</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(b.totalKm, 0)}</div>
                </div>
                <div className="text-center py-2.5 px-1" style={{ background: TOKENS.surface }}>
                  <div style={{ fontSize: 9, color: TOKENS.textSubtle, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Aktif</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{fmtDurMin(b.activeMin)}</div>
                </div>
                <div className="text-center py-2.5 px-1" style={{ background: TOKENS.surface }}>
                  <div style={{ fontSize: 9, color: TOKENS.textSubtle, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Idle</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.textMuted, fontVariantNumeric: 'tabular-nums' }}>{fmtDurMin(b.idleMin)}</div>
                </div>
              </div>
              <div className="px-3.5 py-2" style={{ background: TOKENS.surfaceMuted, fontSize: 10.5, color: TOKENS.textMuted, borderTop: `1px solid ${TOKENS.border}` }}>
                <span style={{ color: TOKENS.textSubtle }}>Aktif di:</span>{' '}
                <span style={{ fontWeight: 500, color: TOKENS.textSecondary }}>
                  {b.ritsActive.map(r => `RIT-${String(r).padStart(2, '0')}`).join(' · ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {idle.length > 0 && (
        <div style={{ background: '#FAFAFA', border: '1px dashed #E4E4E7', borderRadius: 8, padding: '10px 14px' }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 10, fontWeight: 700, color: '#71717A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Bus Tidak Beroperasi Hari Ini</span>
            <span style={{ fontSize: 11, color: '#A1A1AA', fontStyle: 'italic' }}>— configured tapi tidak ada trip (semua periode di-status non-Aktif)</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {idle.map(b => (
              <div key={b.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 4, fontSize: 11.5, color: '#71717A' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A1A1AA' }} />
                BUS-{String(b.id).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Story Layer: At-a-glance Service Status ───────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED HERO — Single source-of-truth verdict di atas page Penjadwalan
// Menggantikan: Status Headway pill (header) + ServiceStoryBanner + Engineering Banner
// Severity-aware: green slim (sehat) → yellow medium (warning) → red prominent (critical)
// ═══════════════════════════════════════════════════════════════════════════
const UnifiedHero = ({ route, m, sched, buses, stats, engQuality, engWarnings, insights, onOpenWawasan, headwayMode }) => {
  const [expanded, setExpanded] = useState(false);

  // Headway statistics
  const allHeadways = sched.ritGroups.map(g => g.headway).filter(h => isFinite(h));
  const maxH = allHeadways.length ? Math.max(...allHeadways) : 0;
  const minH = allHeadways.length ? Math.min(...allHeadways) : 0;
  const avgH = allHeadways.length ? allHeadways.reduce((s, h) => s + h, 0) / allHeadways.length : 0;
  const activeBuses = buses.filter(b => b.tripCount > 0);
  const avgUtil = activeBuses.length > 0
    ? activeBuses.reduce((s, b) => s + b.utilizationPct, 0) / activeBuses.length
    : 0;

  // Unified severity — worst of: engQuality grade, engineering warnings, headway band
  const criticalCount = engWarnings.filter(w => w.severity === 'critical').length;
  const warningCount = engWarnings.filter(w => w.severity === 'warning').length;
  const headwayBand = m.statusHeadway?.label;

  let severity;
  if (criticalCount > 0 || engQuality.grade.letter === 'F' || headwayBand === 'PERHATIAN') {
    severity = { level: 'critical', label: 'PERLU PERHATIAN MENDESAK', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
  } else if (warningCount > 0 || ['C', 'D'].includes(engQuality.grade.letter) || headwayBand === 'STANDAR') {
    severity = { level: 'warning', label: 'PERLU PERBAIKAN', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' };
  } else {
    severity = { level: 'healthy', label: 'LAYANAN OPTIMAL', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
  }

  // One-line narrative (long version is in expanded section)
  const compactNarrative = `${sched.totalBuses} bus aktif · ${sched.trips.length} ${m.isPP ? 'trip' : 'loop'} · headway ${fmtNum(minH, 1)}–${fmtNum(maxH, 1)}m (rata-rata ${fmtNum(avgH, 1)}m) · utilisasi ${fmtPct(avgUtil, 0)}`;
  const longNarrative = `${route.nama} beroperasi ${stats.windowLabel} dengan ${sched.totalBuses} bus, terbagi dalam ${(sched.rits || []).length} RIT × ${sched.ritGroups.length} armada window. Total ${sched.trips.length} ${m.isPP ? 'trip 1-arah' : 'putaran loop'} sepanjang ${fmtDurH(stats.totalHours)}, mencakup ${fmtNum(buses.reduce((s, b) => s + b.totalKm, 0), 0)} km gabungan.`;

  // Top insights (max 2)
  const topInsights = (insights || []).slice(0, 2);

  return (
    <div style={{
      background: severity.bg,
      border: severity.level === 'critical' ? `2px solid ${severity.border}` : `1px solid ${severity.border}`,
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* TOP: Verdict line + Grade badge */}
      <div style={{ padding: '14px 18px' }}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Grade Badge */}
          <div style={{
            width: 46, height: 46, borderRadius: 10,
            background: engQuality.grade.color, color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800,
            boxShadow: `0 2px 8px ${engQuality.grade.color}40`,
            flexShrink: 0,
            position: 'relative',
          }}>
            {engQuality.grade.letter}
            <span style={{
              position: 'absolute', top: -3, right: -3,
              background: '#FFFFFF', color: engQuality.grade.color,
              fontSize: 9, fontWeight: 700,
              padding: '1px 5px', borderRadius: 8,
              border: `1.5px solid ${engQuality.grade.color}`,
              fontVariantNumeric: 'tabular-nums',
            }}>{engQuality.score}</span>
          </div>

          {/* Status text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: severity.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: severity.color, letterSpacing: '0.02em' }}>
                {severity.label}
              </span>
              <span style={{ fontSize: 11, color: severity.color, opacity: 0.8, fontWeight: 600 }}>
                · {engQuality.grade.label}
              </span>
              {headwayBand && (
                <span style={{ fontSize: 10, fontWeight: 700, color: severity.color, background: '#FFFFFF', padding: '2px 7px', borderRadius: 3, border: `1px solid ${severity.border}` }}>
                  Headway: {headwayBand}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: TOKENS.textSecondary, marginTop: 5, lineHeight: 1.5 }}>
              {compactNarrative}
            </div>
          </div>

          {/* Detail toggle */}
          {(engWarnings.length > 0 || expanded) && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                padding: '6px 12px', fontSize: 11, fontWeight: 600,
                background: '#FFFFFF', color: severity.color,
                border: `1px solid ${severity.border}`,
                borderRadius: 5, cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >{expanded ? 'Sembunyikan' : 'Detail'}</button>
          )}
        </div>
      </div>

      {/* MIDDLE: 4 KPI badges */}
      <div style={{ background: 'rgba(255,255,255,0.55)', borderTop: `1px solid ${severity.border}90`, borderBottom: `1px solid ${severity.border}90` }}>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {(() => {
            // Compute Effective Headway (time-weighted across sched groups)
            const effHwy = calcEffectiveHeadway(m, sched, route);
            const isOperasional = headwayMode === 'dinamis';
            const eventsCount = (route.busStatusEvents || []).length;
            const hasOpsImpact = isOperasional && eventsCount > 0 && effHwy.hasDeviation;

            // Choose primary value: effective if Operasional+impact, baseline otherwise
            const primaryVal = hasOpsImpact ? effHwy.effective : effHwy.baseline;
            const primaryLabel = hasOpsImpact ? 'Headway Effective' : 'Headway Baseline';
            const primarySub = hasOpsImpact
              ? `baseline ${fmtNum(effHwy.baseline, 1)}m · Δ ${effHwy.deviationPct > 0 ? '+' : ''}${effHwy.deviationPct.toFixed(0)}%`
              : `${fmtNum(minH, 1)}–${fmtNum(maxH, 1)}m range`;

            return [
              { label: primaryLabel, value: fmtNum(primaryVal, 1), unit: 'menit', sub: primarySub, badge: hasOpsImpact ? '⚡' : null, badgeColor: '#92400E', badgeBg: '#FEF3C7' },
              { label: 'Bus Beroperasi', value: sched.totalBuses, unit: `dari ${route.armada}`, sub: sched.totalBuses === route.armada ? 'operasi penuh' : `${route.armada - sched.totalBuses} standby` },
              { label: 'Trip Harian', value: sched.trips.length, unit: m.isPP ? 'trip' : 'loop', sub: `utilisasi ${fmtPct(avgUtil, 0)}` },
              { label: 'Cakupan Operasi', value: fmtDurH(stats.totalHours), unit: '', sub: stats.windowLabel },
            ].map((k, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRight: i < 3 ? `1px solid ${severity.border}60` : 'none' }}>
                <div className="flex items-center gap-1.5" style={{ marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: TOKENS.textMuted, fontWeight: 600 }}>{k.label}</span>
                  {k.badge && (
                    <span title="Mode Operasional aktif - headway effective dihitung dari sched per window" style={{ fontSize: 9, fontWeight: 700, color: k.badgeColor, background: k.badgeBg, padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>
                      {k.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span style={{ fontSize: 22, fontWeight: 600, color: TOKENS.textPrimary, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{k.value}</span>
                  {k.unit && <span style={{ fontSize: 11, color: TOKENS.textMuted }}>{k.unit}</span>}
                </div>
                <div style={{ fontSize: 11, color: TOKENS.textMuted, marginTop: 2 }}>{k.sub}</div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* BOTTOM: Inline chips — insights + warnings */}
      {(topInsights.length > 0 || engWarnings.length > 0) && (
        <div style={{ padding: '8px 18px' }}>
          <div className="flex items-center gap-2 flex-wrap">
            {topInsights.map((ins, i) => {
              const chipColor = ins.severity === 'critical'
                ? { bg: '#FFFFFF', border: '#FCA5A5', text: '#991B1B' }
                : ins.severity === 'warn'
                ? { bg: '#FFFFFF', border: '#FCD34D', text: '#92400E' }
                : { bg: '#FFFFFF', border: '#BFDBFE', text: '#1E40AF' };
              return (
                <div key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', fontSize: 11,
                  background: chipColor.bg, border: `1px solid ${chipColor.border}`, color: chipColor.text,
                  borderRadius: 12,
                }} title={ins.description}>
                  💡 <span style={{ fontWeight: 600 }}>{ins.title}</span>
                </div>
              );
            })}
            {engWarnings.length > 0 && (
              <button
                onClick={onOpenWawasan}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', fontSize: 11, fontWeight: 600,
                  background: '#FFFFFF', border: `1px solid ${severity.border}`, color: severity.color,
                  borderRadius: 12, cursor: 'pointer',
                }}
              >
                {criticalCount > 0 ? '🚨' : '⚠'} {engWarnings.length} engineering warning · Buka Wawasan →
              </button>
            )}
          </div>
        </div>
      )}

      {/* EXPANDED: Engineering details + full narrative */}
      {expanded && (
        <div style={{ padding: '14px 18px', background: '#FFFFFF', borderTop: `1px solid ${severity.border}` }}>
          {/* Full narrative */}
          <div style={{ marginBottom: 14, padding: '10px 12px', background: '#F8FAFC', borderRadius: 6, border: '1px dashed #CBD5E1' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
              Cerita Operasi Hari Ini
            </div>
            <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
              {longNarrative}
            </div>
          </div>

          {/* Warnings detail */}
          {engWarnings.length > 0 && (
            <div className="space-y-2" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Engineering Warnings ({engWarnings.length})
              </div>
              {engWarnings.map((w, i) => {
                const colors = w.severity === 'critical'
                  ? { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: '🚨' }
                  : { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', icon: '⚠' };
                return (
                  <div key={i} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 6, padding: '8px 12px' }}>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span style={{ fontSize: 12 }}>{colors.icon}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: colors.text, letterSpacing: '0.06em', background: '#FFFFFF', padding: '1px 6px', borderRadius: 3 }}>
                        {w.category}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{w.title}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#52525B', marginTop: 4, marginLeft: 22, lineHeight: 1.5 }}>
                      {w.message}
                    </div>
                    <div style={{ fontSize: 11, color: colors.text, marginTop: 2, marginLeft: 22, fontStyle: 'italic' }}>
                      💡 {w.action}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quality breakdown */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Quality Breakdown (Per Dimensi)
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(engQuality.breakdown).map(([k, v]) => {
                const labels = { pvr: 'PVR', recovery: 'Recovery', capacity: 'Capacity', reliability: 'Reliability', driver: 'Driver', spm: 'SPM' };
                const color = v >= 90 ? '#059669' : v >= 75 ? '#10B981' : v >= 60 ? '#F59E0B' : '#DC2626';
                return (
                  <div key={k} style={{ background: '#FAFAFA', borderRadius: 4, padding: '6px 8px', textAlign: 'center', borderLeft: `3px solid ${color}` }}>
                    <div style={{ fontSize: 10, color: '#71717A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{labels[k]}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{Math.round(v)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ServiceStoryBanner = ({ route, m, sched, buses, stats }) => {
  const allHeadways = sched.ritGroups.map(g => g.headway);
  const maxH = Math.max(...allHeadways);
  const minH = Math.min(...allHeadways);
  const avgH = allHeadways.reduce((s, h) => s + h, 0) / allHeadways.length;
  const avgUtil = buses.length > 0 ? buses.filter(b => b.tripCount > 0).reduce((s, b) => s + b.utilizationPct, 0) / Math.max(1, buses.filter(b => b.tripCount > 0).length) : 0;

  // Determine overall service status
  let status = { label: 'OPTIMAL', desc: 'Layanan sesuai standar BRT', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', dot: '#059669' };
  if (maxH > 20 || avgH > 18) {
    status = { label: 'PERLU PERHATIAN', desc: 'Headway terlalu lama saat off-peak', bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#DC2626' };
  } else if (maxH > 15 || avgH > 13 || avgUtil < 0.4) {
    status = { label: 'CUKUP BAIK', desc: 'Ada ruang perbaikan di periode tertentu', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#D97706' };
  }

  const tripsPerBus = sched.totalBuses > 0 ? Math.round(sched.trips.length / sched.totalBuses) : 0;
  const totalKm = buses.reduce((s, b) => s + b.totalKm, 0);
  const kmPerBus = sched.totalBuses > 0 ? totalKm / sched.totalBuses : 0;

  // Plain language narrative
  const narrative = `${route.nama} beroperasi dari pukul ${stats.windowLabel} dengan ${sched.totalBuses} unit bus aktif. Layanan dibagi ke ${(sched.rits || []).length} RIT (1 RIT = 1 putaran lengkap dispatch armada) dalam ${sched.ritGroups.length} armada window, menghasilkan ${sched.trips.length} ${m.isPP ? 'trip 1-arah' : 'putaran loop'} sepanjang ${fmtDurH(stats.totalHours)} operasi. Headway berkisar ${fmtNum(minH, 1)}–${fmtNum(maxH, 1)} menit (rata-rata ${fmtNum(avgH, 1)} mnt). Total ${fmtNum(totalKm, 0)} km akan ditempuh seluruh armada hari ini.`;

  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div className="p-5" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
        <div className="flex items-start justify-between gap-5 mb-3">
          <div className="flex-1 min-w-0">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: status.bg, border: `1px solid ${status.border}`, borderRadius: 16, padding: '4px 12px', marginBottom: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: status.dot }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: status.text, letterSpacing: '0.05em' }}>STATUS PELAYANAN: {status.label}</span>
              <span style={{ fontSize: 11, color: status.text, opacity: 0.8 }}>· {status.desc}</span>
            </div>
            <p style={{ fontSize: 13.5, color: TOKENS.textSecondary, lineHeight: 1.65, margin: 0 }}>
              {narrative}
            </p>
          </div>
        </div>
      </div>

      {/* Hero KPIs — 4 numbers a layperson can understand */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        <div className="p-4" style={{ borderRight: `1px solid ${TOKENS.border}` }}>
          <div style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Penumpang Tunggu</div>
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontSize: 26, fontWeight: 600, color: status.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{fmtNum(avgH, 1)}</span>
            <span style={{ fontSize: 12, color: TOKENS.textMuted }}>menit rata-rata</span>
          </div>
          <div style={{ fontSize: 11, color: TOKENS.textMuted, marginTop: 4 }}>
            terpendek {fmtNum(minH, 1)}m · terpanjang {fmtNum(maxH, 1)}m
          </div>
        </div>
        <div className="p-4" style={{ borderRight: `1px solid ${TOKENS.border}` }}>
          <div style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Bus Beroperasi</div>
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontSize: 26, fontWeight: 600, color: TOKENS.textPrimary, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{sched.totalBuses}</span>
            <span style={{ fontSize: 12, color: TOKENS.textMuted }}>dari {route.armada} unit</span>
          </div>
          <div style={{ fontSize: 11, color: TOKENS.textMuted, marginTop: 4 }}>
            {sched.totalBuses === route.armada ? 'operasi penuh' : `${route.armada - sched.totalBuses} unit standby`}
          </div>
        </div>
        <div className="p-4" style={{ borderRight: `1px solid ${TOKENS.border}` }}>
          <div style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Beban Kerja</div>
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontSize: 26, fontWeight: 600, color: TOKENS.textPrimary, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{tripsPerBus}</span>
            <span style={{ fontSize: 12, color: TOKENS.textMuted }}>{m.isPP ? 'trip' : 'loop'}/bus</span>
          </div>
          <div style={{ fontSize: 11, color: TOKENS.textMuted, marginTop: 4 }}>
            ≈ {fmtNum(kmPerBus, 0)} km per bus · utilisasi {fmtPct(avgUtil, 0)}
          </div>
        </div>
        <div className="p-4">
          <div style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Cakupan Waktu</div>
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontSize: 26, fontWeight: 600, color: TOKENS.textPrimary, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{fmtDurH(stats.totalHours)}</span>
            <span style={{ fontSize: 12, color: TOKENS.textMuted }}>operasi</span>
          </div>
          <div style={{ fontSize: 11, color: TOKENS.textMuted, marginTop: 4 }}>
            {stats.windowLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Hero Visualization: Headway Profile across the Day ─────────────────────

const HeadwayProfileChart = ({ ritGroups, winStart, winEnd }) => {
  // Build step data from rit groups
  const data = [];
  ritGroups.forEach(g => {
    data.push({ time: g.startMin / 60, headway: Number(g.headway.toFixed(2)), ritGroup: g.id, kategori: g.periodes[0]?.kategori || '—' });
    data.push({ time: g.endMin / 60, headway: Number(g.headway.toFixed(2)), ritGroup: g.id, kategori: g.periodes[0]?.kategori || '—' });
  });

  const maxH = ritGroups.length > 0 ? Math.max(...ritGroups.map(g => g.headway)) : 30;
  const yMax = Math.max(25, Math.ceil(maxH * 1.2 / 5) * 5);

  const fmtTimeAxis = (v) => {
    const h = Math.floor(v);
    const m = Math.round((v - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: TOKENS.textPrimary, margin: 0 }}>Profil Headway Sepanjang Hari</h3>
            <p style={{ fontSize: 12, color: TOKENS.textMuted, marginTop: 4, lineHeight: 1.5, maxWidth: 580 }}>
              Berapa lama penumpang menunggu bus pada setiap jam. Garis turun = bus lebih sering datang (lebih baik).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ fontSize: 11 }}>
            <span className="inline-flex items-center gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#059669', opacity: 0.18, border: '1px solid #05966966' }} />
              <span style={{ color: TOKENS.textMuted }}>Baik (≤10m)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#D97706', opacity: 0.18, border: '1px solid #D9770666' }} />
              <span style={{ color: TOKENS.textMuted }}>Standar (10-20m)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#DC2626', opacity: 0.18, border: '1px solid #DC262666' }} />
              <span style={{ color: TOKENS.textMuted }}>Perhatian (&gt;20m)</span>
            </span>
          </div>
        </div>
      </div>
      <div className="px-3 py-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid stroke={TOKENS.border} strokeDasharray="2 4" vertical={true} />
            <XAxis
              dataKey="time"
              type="number"
              domain={[winStart / 60, winEnd / 60]}
              tickFormatter={fmtTimeAxis}
              ticks={Array.from({ length: Math.ceil((winEnd - winStart) / 60) + 1 }, (_, i) => winStart / 60 + i)}
              stroke={TOKENS.textMuted}
              tick={{ fontSize: 10, fill: TOKENS.textMuted }}
              axisLine={{ stroke: TOKENS.border }}
              tickLine={{ stroke: TOKENS.border }}
            />
            <YAxis
              domain={[0, yMax]}
              stroke={TOKENS.textMuted}
              tick={{ fontSize: 10, fill: TOKENS.textMuted }}
              tickFormatter={(v) => `${v}`}
              axisLine={{ stroke: TOKENS.border }}
              tickLine={{ stroke: TOKENS.border }}
              label={{ value: 'mnt', angle: 0, position: 'top', offset: 10, fill: TOKENS.textMuted, fontSize: 10 }}
            />
            {/* Reference bands for service quality */}
            <ReferenceArea y1={0} y2={10} fill="#059669" fillOpacity={0.06} />
            <ReferenceArea y1={10} y2={20} fill="#D97706" fillOpacity={0.06} />
            <ReferenceArea y1={20} y2={yMax} fill="#DC2626" fillOpacity={0.06} />
            <ReferenceLine y={10} stroke="#059669" strokeDasharray="2 3" strokeOpacity={0.5} />
            <ReferenceLine y={20} stroke="#D97706" strokeDasharray="2 3" strokeOpacity={0.5} />
            <Tooltip
              labelFormatter={fmtTimeAxis}
              formatter={(value, name, props) => [`${value} mnt`, `RIT-${String(props.payload.ritGroup).padStart(2, '0')} · ${props.payload.kategori}`]}
              contentStyle={{ background: TOKENS.surface, border: `1px solid ${TOKENS.borderStrong}`, borderRadius: 6, fontSize: 11, padding: '6px 10px' }}
              cursor={{ stroke: TOKENS.brand, strokeWidth: 1 }}
            />
            <Line
              type="stepAfter"
              dataKey="headway"
              stroke={TOKENS.brand}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="px-5 py-3" style={{ background: TOKENS.surfaceMuted, borderTop: `1px solid ${TOKENS.border}`, fontSize: 11.5, color: TOKENS.textMuted, lineHeight: 1.55 }}>
        <strong style={{ color: TOKENS.textSecondary, fontWeight: 600 }}>Cara membaca:</strong>{' '}
        Headway adalah jeda waktu antar bus yang lewat di satu titik. Penumpang ideal mendapat bus setiap ≤10 menit (zona hijau). Lebih dari 20 menit (zona merah) dianggap kurang nyaman dan menurunkan minat penumpang. Garis horizontal datar menunjukkan armada window — blok waktu dengan jumlah armada konstan.
      </div>
    </div>
  );
};

// ─── Insight Engine: Auto-detect operational issues ─────────────────────────

const generateInsights = (route, m, sched, buses) => {
  const insights = [];
  const activeBuses = buses.filter(b => b.tripCount > 0);

  // 0. SERVICE GAP — periode aktif tapi 0 effective bus (akibat status events overlap)
  const events = route.busStatusEvents || [];
  const sisipanArr = route.sisipanArmada || [];
  const serviceGaps = [];
  for (const p of route.periode) {
    if (!p.on || p.kategori === 'Tutup') continue;
    const pStart = parseHM((p.jam || '00:00-00:00').split('-')[0]);
    const pEnd = parseHM((p.jam || '00:00-00:00').split('-')[1]);
    // BUG FIX: hitung effective armada termasuk slot+standby sisipanArmada (bukan p.sisipan legacy
    // yg sdh selalu 0 setelah migrasi). Slot sisipan menambah bus ke rotation, standby tambah trip ekstra.
    const armadaBase = Number(p.armadaPeriode) || 0;
    const slotDelta = sisipanArr
      .filter(s => (s.mode || 'slot') === 'slot' && Number(s.startMin) < pEnd && Number(s.endMin) > pStart)
      .reduce((sum, s) => sum + (Number(s.deltaArmada) || 0), 0);
    const standbyDelta = sisipanArr
      .filter(s => s.mode === 'standby' && Number(s.startMin) < pEnd && Number(s.endMin) > pStart)
      .reduce((sum, s) => sum + (Number(s.deltaArmada) || 0), 0);
    const baseEff = Math.max(0, armadaBase + slotDelta);
    const totalEff = baseEff + standbyDelta;
    if (totalEff === 0) continue;
    let activeCount = 0;
    // Bus IDs yang relevan: 1..baseEff (slot) + (route.armada+1)..(route.armada+standbyDelta) (standby).
    // Standby bus IDs di scheduler dimulai dari route.armada + 1.
    const busIds = [];
    for (let b = 1; b <= baseEff; b++) busIds.push(b);
    const armadaTotal = Number(route.armada) || 0;
    for (let b = 1; b <= standbyDelta; b++) busIds.push(armadaTotal + b);
    for (const b of busIds) {
      // Check if any non-active event overlaps this period
      const blocked = events.some(e =>
        e.busId === b && e.status !== 'active' &&
        Number(e.startMin) < pEnd && Number(e.endMin) > pStart
      );
      if (!blocked) activeCount++;
    }
    if (activeCount === 0) {
      serviceGaps.push({ kode: p.kode, jam: p.jam, nama: p.nama });
    }
  }
  if (serviceGaps.length > 0) {
    insights.push({
      severity: 'critical',
      title: `${serviceGaps.length} periode tanpa pelayanan`,
      description: `${serviceGaps.map(g => `${g.kode} (${g.jam}, ${g.nama})`).join('; ')} aktif tapi semua bus berstatus non-Aktif. Tidak ada trip di-generate untuk window ini → service gap untuk penumpang.`,
      action: 'Buka Konfigurasi → Kebijakan → Status per Bus',
    });
  }

  // 1. Underutilized buses
  const underUtil = activeBuses.filter(b => b.utilizationPct < 0.4);
  if (underUtil.length > 0) {
    insights.push({
      severity: 'warn',
      title: `${underUtil.length} bus dengan utilisasi rendah`,
      description: `Bus ${underUtil.map(b => `B${String(b.id).padStart(2, '0')}`).join(', ')} hanya bekerja ${underUtil.map(b => fmtPct(b.utilizationPct, 0)).join(' / ')} dari waktu duty mereka. Pertimbangkan menjadwalkan trip tambahan, atau jika sudah optimal, kurangi armada di periode sepi.`,
      action: 'Buka Konfigurasi → Kebijakan Periode',
    });
  }

  // 2. Overutilized buses (no recovery time)
  const overUtil = activeBuses.filter(b => b.utilizationPct > 0.85);
  if (overUtil.length > 0) {
    insights.push({
      severity: 'critical',
      title: `${overUtil.length} bus over-utilized (>85%)`,
      description: `Bus ${overUtil.map(b => `B${String(b.id).padStart(2, '0')}`).join(', ')} bekerja sangat padat — recovery time tidak cukup, berisiko keterlambatan kumulatif yang menumpuk sepanjang hari. Tambah armada di periode tersebut atau perpanjang layover terminal.`,
      action: 'Buka Konfigurasi → Rute & Halte (untuk layover) atau Kebijakan Periode (untuk armada)',
    });
  }

  // 3. Headway variation too high
  const allH = sched.ritGroups.map(g => g.headway);
  if (allH.length >= 2) {
    const ratio = Math.max(...allH) / Math.min(...allH);
    if (ratio > 2.5) {
      insights.push({
        severity: 'info',
        title: `Variasi headway ${ratio.toFixed(1)}× antar periode`,
        description: `Headway terpendek ${fmtNum(Math.min(...allH), 1)} mnt vs terpanjang ${fmtNum(Math.max(...allH), 1)} mnt. ${ratio > 3 ? 'Variasi sangat besar — pertimbangkan menambah periode transisi (mis. armada 4 antara peak 5 dan off-peak 3) untuk perubahan layanan yang lebih halus.' : 'Variasi normal untuk operasi peak/off-peak, dalam batas wajar.'}`,
        action: ratio > 3 ? 'Buka Konfigurasi → Kebijakan Periode untuk menambah periode transisi' : null,
      });
    }
  }

  // 4. Long break (split shift)
  const splitShifts = activeBuses.filter(b => {
    if (b.trips.length < 2) return false;
    for (let i = 0; i < b.trips.length - 1; i++) {
      if (b.trips[i + 1].depMinutes - b.trips[i].arrMinutes > 120) return true;
    }
    return false;
  });
  if (splitShifts.length > 0) {
    insights.push({
      severity: 'info',
      title: `${splitShifts.length} bus dengan jeda split-shift > 2 jam`,
      description: `Bus ${splitShifts.map(b => `B${String(b.id).padStart(2, '0')}`).join(', ')} memiliki jeda panjang antar Rit (umumnya antara peak pagi dan peak sore). Manfaatkan window ini untuk maintenance preventif, isi BBM, atau pergantian shift sopir tanpa mengganggu layanan.`,
      action: null,
    });
  }

  // 5. Operating window very long
  if (activeBuses.length > 0) {
    const totalH = (Math.max(...activeBuses.map(b => b.lastArr)) - Math.min(...activeBuses.map(b => b.firstDep))) / 60;
    if (totalH > 18) {
      insights.push({
        severity: 'warn',
        title: 'Window operasi sangat panjang (>18 jam)',
        description: `Total span operasi ${totalH.toFixed(1)} jam. Pastikan rotasi sopir mengikuti UU Naker (max 8 jam/shift). Direkomendasikan minimum 2.5 shift kru per bus untuk keselamatan dan kepatuhan.`,
        action: 'Buka Konfigurasi → Biaya & Kontrak (atur Jumlah Shift Kru/Bus)',
      });
    }
  }

  // 6. Service gaps within operating window
  const sortedRits = [...sched.ritGroups].sort((a, b) => a.startMin - b.startMin);
  const gaps = [];
  for (let i = 0; i < sortedRits.length - 1; i++) {
    const gap = sortedRits[i + 1].startMin - sortedRits[i].endMin;
    if (gap > 30) {
      gaps.push({ from: sortedRits[i], to: sortedRits[i + 1], mins: gap });
    }
  }
  if (gaps.length > 0) {
    insights.push({
      severity: 'warn',
      title: `${gaps.length} gap layanan terdeteksi dalam window operasi`,
      description: `Ada ${gaps.length} blok waktu dimana tidak ada bus melayani: ${gaps.map(g => `${fmtHM(g.from.endMin)}–${fmtHM(g.to.startMin)} (${g.mins} mnt)`).join('; ')}. Penumpang yang datang di window ini akan menunggu hingga rit berikutnya. Pertimbangkan menyambung periode atau memberi tahu publik dengan jelas.`,
      action: 'Buka Konfigurasi → Kebijakan Periode',
    });
  }

  return insights;
};

const InsightsCallout = ({ insights }) => {
  if (insights.length === 0) {
    return (
      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '14px 18px' }}>
        <div className="flex items-center gap-2.5">
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#059669', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>✓</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>Tidak ada masalah operasional terdeteksi</div>
            <div style={{ fontSize: 12, color: '#065F46', opacity: 0.8, marginTop: 2 }}>
              Semua armada terdistribusi dengan baik, headway konsisten, tidak ada gap layanan dalam jam operasi.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const colors = {
    critical: { bg: '#FEF2F2', border: '#FECACA', dot: '#DC2626', text: '#991B1B', label: 'KRITIS' },
    warn:     { bg: '#FFFBEB', border: '#FDE68A', dot: '#D97706', text: '#92400E', label: 'PERHATIAN' },
    info:     { bg: '#EFF6FF', border: '#BFDBFE', dot: '#2563EB', text: '#1E40AF', label: 'INFO' },
  };

  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, overflow: 'hidden' }}>
      {insights.map((ins, i) => {
        const c = colors[ins.severity];
        return (
          <div key={i} className="flex items-start gap-3 px-5 py-4" style={{ borderBottom: i < insights.length - 1 ? `1px solid ${TOKENS.border}` : 'none', background: c.bg + '30' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: c.dot, color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 9, fontWeight: 700, color: c.text, background: c.bg, padding: '2px 7px', borderRadius: 3, letterSpacing: '0.06em', border: `1px solid ${c.border}` }}>{c.label}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: TOKENS.textPrimary }}>{ins.title}</span>
              </div>
              <p style={{ fontSize: 12.5, color: TOKENS.textSecondary, lineHeight: 1.6, margin: 0 }}>{ins.description}</p>
              {ins.action && (
                <div style={{ marginTop: 6, fontSize: 11, color: TOKENS.brand, fontWeight: 500 }}>
                  → {ins.action}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────

function TabJadwalOps({ route, updateRoute, routes, activeId }) {
  const m = useMemo(() => calcMetrics(route), [route]);
  const [direction, setDirection] = useState('berangkat');
  const [viewMode, setViewMode] = useState('trip'); // 'trip' (per-trip dispatch view) | 'jam' (per-hour passenger view)
  const [jdView, setJdView] = useState('operasi'); // 'operasi' | 'perbus' | 'insight'
  const [openDrawer, setOpenDrawer] = useState(null); // null | 'rute' | 'periode' | 'sisipan' | 'status' | 'biaya' | 'utilisasi' | 'sensitivitas' | 'optimasi' | 'komparasi' | 'multirute'
  const [headwayMode, setHeadwayMode] = useState('statis'); // 'statis' (default) | 'dinamis' — apakah schedule respect status events
  // View options (Combo 1+2+3 togglable)
  const [spotlightSisipan, setSpotlightSisipan] = useState(true);   // Ide 1: ⭐ marker
  const [colorMode, setColorMode] = useState('periode');             // Ide 2: 'bus' | 'periode' | 'window'
  const [tripTooltip, setTripTooltip] = useState(true);              // Ide 3: hover detail card
  // Time range filter — focus on specific window
  const [timeRangeStart, setTimeRangeStart] = useState('');          // '' = no filter, e.g., '09:00'
  const [timeRangeEnd, setTimeRangeEnd] = useState('');              // '' = no filter, e.g., '11:00'
  const sched = useMemo(
    () => generateSchedule(route, m, { respectStatusEvents: headwayMode === 'dinamis' }),
    [route, m, headwayMode]
  );
  const buses = useMemo(() => generateBusUtilization(sched, route, m), [sched, route, m]);

  // ── ENGINEERING VALIDATION — warnings + quality score (closes feedback loop) ──
  const engWarnings = useMemo(() => calcEngineeringWarnings(route, m, sched, buses), [route, m, sched, buses]);
  const engQuality = useMemo(() => calcScheduleQualityScore(route, m, sched, buses), [route, m, sched, buses]);

  // ── TIME RANGE FILTER — apply to schedule data shown in views ──
  // Filter trips yang dispatch dalam window: depMinutes ∈ [start, end].
  // Trip dengan arrival > end tetap masuk (loose end).
  const filterActive = !!(timeRangeStart || timeRangeEnd);
  const filteredTrips = useMemo(() => {
    if (!filterActive || !sched.trips) return sched.trips || [];
    let sMin = 0, eMin = 24 * 60 - 1;
    try {
      sMin = timeRangeStart ? parseHM(timeRangeStart) : 0;
      eMin = timeRangeEnd ? parseHM(timeRangeEnd) : 24 * 60 - 1;
      if (isNaN(sMin)) sMin = 0;
      if (isNaN(eMin)) eMin = 24 * 60 - 1;
    } catch (e) {
      return sched.trips;
    }
    return sched.trips.filter(t => t.depMinutes >= sMin && t.depMinutes <= eMin);
  }, [sched.trips, timeRangeStart, timeRangeEnd, filterActive]);

  // Filtered rits — derive from filteredTrips
  const filteredRits = useMemo(() => {
    if (!filterActive) return sched.rits || [];
    if (!sched.rits || !filteredTrips) return [];
    const filteredTripIds = new Set(filteredTrips.map(t => t.id));
    const ritNumbers = new Set(filteredTrips.map(t => t.ritNumber));
    return sched.rits
      .filter(r => ritNumbers.has(r.number))
      .map(r => ({
        ...r,
        trips: (r.trips || []).filter(t => filteredTripIds.has(t.id)),
        tripCount: (r.trips || []).filter(t => filteredTripIds.has(t.id)).length,
      }));
  }, [sched.rits, filteredTrips, filterActive]);

  // Counters for drawer button badges (override count)
  const sisipanCount = useMemo(() => (route.sisipanArmada || []).length, [route.sisipanArmada]);
  const statusOverrideCount = useMemo(() => (route.busStatusEvents || []).length, [route.busStatusEvents]);

  if (sched.trips.length === 0) {
    return (
      <div style={{ background: TOKENS.bg, minHeight: 'calc(100vh - 64px)' }} className="-m-4">
        <div className="flex items-center justify-center" style={{ minHeight: 600 }}>
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: 32, maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Status Operasi</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: TOKENS.textPrimary, marginBottom: 8 }}>Belum Ada Jadwal</h2>
            <p style={{ fontSize: 13, color: TOKENS.textMuted, lineHeight: 1.6, marginBottom: 16 }}>
              Jadwal operasional belum dapat di-generate karena belum ada periode aktif dengan armada lebih dari 0.
            </p>
            <div style={{ fontSize: 12, color: TOKENS.textMuted, fontFamily: 'ui-monospace, monospace', textAlign: 'left', background: TOKENS.surfaceMuted, padding: 12, borderRadius: 6 }}>
              1. Buka <strong>Konfigurasi → Kebijakan Periode</strong><br />
              2. Aktifkan ≥ 1 periode<br />
              3. Set jumlah armada per periode
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Operating window: aligned strictly to USER-DEFINED active periode boundaries
  // (bukan dari trip times aktual yang bisa overshoot saat trip arrive past periode end)
  const activeP = (sched.parsedPeriode || []).filter(p =>
    p.on && p.kategori !== 'Tutup' && (Number(p.armadaPeriode) || 0) > 0
  );
  const periodeStart = activeP.length > 0
    ? Math.min(...activeP.map(p => p.startMin))
    : 5 * 60;
  const periodeEnd = activeP.length > 0
    ? Math.max(...activeP.map(p => p.endMin))
    : 22 * 60;
  const winStart = Math.floor(periodeStart / 60) * 60;
  const winEnd = Math.ceil(periodeEnd / 60) * 60;
  const pxPerHour = 130;

  const hours = [];
  for (let h = winStart; h < winEnd; h += 60) {
    hours.push({ minutes: h, label: fmtHM(h), periode: findPeriodeAt(h, sched.parsedPeriode) });
  }

  const totalRouteKm = route.halte[route.halte.length - 1]?.jarakKum || 0;
  const headwayRange = sched.ritGroups.length
    ? `${fmtNum(Math.min(...sched.ritGroups.map(g => g.headway)), 0)}–${fmtNum(Math.max(...sched.ritGroups.map(g => g.headway)), 0)}`
    : '0';

  const stats = {
    headwayRange,
    windowLabel: `${fmtHM(winStart)}–${fmtHM(winEnd)}`,
    totalHours: (winEnd - winStart) / 60,
  };

  // Build matrix data
  const directions = m.isPP
    ? [
        { key: 'berangkat', label: 'Berangkat', flow: 'Titik Awal → Titik Akhir', halte: route.halte },
        { key: 'pulang', label: 'Pulang', flow: 'Titik Akhir → Titik Awal', halte: [...route.halte].reverse() },
      ]
    : [
        { key: 'berangkat', label: 'Operasi Loop', flow: 'Sirkular kembali ke titik awal', halte: route.halte },
      ];

  const buildHalteRows = (dir) => {
    const tripsDir = filteredTrips.filter(t => t.direction === dir.key);
    return dir.halte.map((halte, halteIdx) => {
      const arrivals = tripsDir.map(trip => {
        const ht = trip.halteTimes[halteIdx];
        return ht ? { time: ht.arrival, busId: trip.busId, tripId: trip.id, periode: trip.periode, isSisipan: !!trip.isSisipan } : null;
      }).filter(Boolean).sort((a, b) => a.time - b.time);
      const buckets = hours.map(h => arrivals.filter(a => a.time >= h.minutes && a.time < h.minutes + 60));
      const jarakDisplay = dir.key === 'pulang' ? totalRouteKm - halte.jarakKum : halte.jarakKum;
      return { halte, halteIdx, arrivals, buckets, jarakDisplay };
    });
  };

  const activeDir = directions.find(d => d.key === direction) || directions[0];
  const activeHalteRows = buildHalteRows(activeDir);

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={{ background: TOKENS.bg, minHeight: 'calc(100vh - 64px)', color: TOKENS.textPrimary, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }} className="-m-4">
      {/* PAGE HEADER */}
      <header style={{ background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.border}` }}>
        <div className="px-7 py-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span style={{ fontSize: 10, fontWeight: 600, color: TOKENS.brand, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Penjadwalan Operasi</span>
                <span style={{ color: TOKENS.borderStrong }}>·</span>
                <span style={{ fontSize: 11, color: TOKENS.textMuted }}>{today}</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: TOKENS.textPrimary, letterSpacing: '-0.02em', marginBottom: 6 }}>
                <InlineEditableText
                  value={route.nama}
                  onChange={v => updateRoute({ ...route, nama: v })}
                  style={{ fontSize: 24, fontWeight: 600, color: TOKENS.textPrimary, letterSpacing: '-0.02em' }}
                  placeholder="Nama Rute"
                />
              </h1>
              <div className="flex items-center gap-3" style={{ fontSize: 12.5, color: TOKENS.textSecondary }}>
                <span style={{ background: TOKENS.brandTint, color: TOKENS.brand, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  {route.tipeRute === 'PP' ? 'PULANG-PERGI' : 'LOOP'}
                </span>
                <span>{route.halte.length} halte</span>
                <span style={{ color: TOKENS.borderStrong }}>·</span>
                <span>{fmtNum(totalRouteKm, 2)} km per arah</span>
                <span style={{ color: TOKENS.borderStrong }}>·</span>
                <span>{fmtDurH(route.jamOps)} operasi/hari</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div style={{ fontSize: 10.5, color: TOKENS.textSubtle, fontFamily: 'ui-monospace, monospace' }}>
                DOC-JOH/{String(route.id).padStart(3, '0')} · v1.0
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-7 py-6 space-y-5">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* UNIFIED HERO — Single source of truth: status + KPI + warnings + insights */}
        {/* Menggantikan 3 banner sebelumnya (Status pill + ServiceStory + Eng Quality) */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <UnifiedHero
          route={route} m={m} sched={sched} buses={buses} stats={stats}
          engQuality={engQuality} engWarnings={engWarnings}
          insights={generateInsights(route, m, sched, buses)}
          onOpenWawasan={() => setOpenDrawer('wawasan')}
          headwayMode={headwayMode}
        />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* VIEW TABS — prominent navigation (was hidden in toolbar before)   */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, padding: 4 }}>
          <div className="flex items-center gap-1">
            {[
              { key: 'operasi', label: 'Operasi', subtitle: 'Jadwal & detail RIT', icon: CalendarClock },
              { key: 'perbus',  label: 'Per Bus', subtitle: 'Pemanfaatan & Marey', icon: Bus },
              { key: 'insight', label: 'Insight', subtitle: 'Analisis otomatis', icon: Activity, badge: generateInsights(route, m, sched, buses).length },
            ].map(s => {
              const isActive = jdView === s.key;
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => setJdView(s.key)}
                  style={{
                    flex: 1, minWidth: 0,
                    padding: '10px 14px',
                    background: isActive ? TOKENS.brandTint : 'transparent',
                    border: 'none', borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    color: isActive ? TOKENS.brandStrong : TOKENS.textSecondary,
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.12s ease',
                    position: 'relative',
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, lineHeight: 1.2 }}>
                      {s.label}
                      {s.badge > 0 && (
                        <span style={{ marginLeft: 6, padding: '1px 6px', fontSize: 10, fontWeight: 700, background: isActive ? TOKENS.brand : TOKENS.surfaceMuted, color: isActive ? '#FFFFFF' : TOKENS.textMuted, borderRadius: 9, fontVariantNumeric: 'tabular-nums' }}>
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10.5, color: isActive ? TOKENS.brandStrong + 'AA' : TOKENS.textMuted, fontWeight: 400, marginTop: 1 }}>
                      {s.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* TOOL BAR — Inline access ke semua engineering tools (drawers)    */}
        {/* "Semua tools rekayasa schedule berada tepat di sini"             */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, padding: '10px 14px' }}>
          <div className="flex items-center gap-3 flex-wrap">
            {/* SETUP TOOLS */}
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 9.5, color: TOKENS.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 2 }}>Setup</span>
              <ToolButton icon={Route}    label="Rute & Halte" onClick={() => setOpenDrawer('rute')} />
              <ToolButton icon={Clock}    label="Periode" onClick={() => setOpenDrawer('periode')} />
              <ToolButton icon={Plus}     label="Sisipan" onClick={() => setOpenDrawer('sisipan')} badge={sisipanCount} />
              <ToolButton icon={Bus}      label="Status Bus" onClick={() => setOpenDrawer('status')} badge={statusOverrideCount} />
              <ToolButton icon={DollarSign} label="Biaya" onClick={() => setOpenDrawer('biaya')} />
            </div>

            <div style={{ width: 1, height: 22, background: TOKENS.border }} />

            {/* ANALYSIS TOOLS */}
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 9.5, color: TOKENS.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 2 }}>Rekayasa</span>
              <ToolButton icon={Activity}    label="Sensitivitas" onClick={() => setOpenDrawer('sensitivitas')} />
              <ToolButton icon={TrendingUp}  label="Optimasi" onClick={() => setOpenDrawer('optimasi')} badge={route.optimasi ? '•' : null} />
              <ToolButton icon={GitCompare}  label="Komparasi" onClick={() => setOpenDrawer('komparasi')} />
              <ToolButton icon={LayoutDashboard} label="Multi-Rute" onClick={() => setOpenDrawer('multirute')} />
              <ToolButton icon={AlertTriangle} label="Disruption" onClick={() => setOpenDrawer('disruption')} />
              <ToolButton icon={CheckCircle2} label="Wawasan" onClick={() => setOpenDrawer('wawasan')} />
            </div>

            <div style={{ width: 1, height: 22, background: TOKENS.border }} />

            {/* HEADWAY MODE TOGGLE — Perencanaan vs Operasional */}
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 10.5, color: TOKENS.textMuted, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginRight: 2 }} title="Mode perhitungan headway: Baseline (ideal) vs Effective (operasional)">Mode</span>
              <div className="inline-flex items-center" style={{ background: TOKENS.surfaceMuted, border: `1px solid ${TOKENS.border}`, borderRadius: 6, padding: 2 }}>
                {[
                  {
                    key: 'statis',
                    label: 'Perencanaan',
                    sub: '(Baseline)',
                    desc: 'BASELINE / SCHEDULED HEADWAY (TCQSM Layer 1)\n\nFormula: headway = cycleTime ÷ armada\n\nMode "ideal world" — semua bus dianggap available. Status events (break/service/off) di-IGNORE untuk perhitungan, hanya overlay visual.\n\nGunakan untuk: planning baseline, kapasitas teoritis, comparison "what would be without disruptions".',
                    icon: '📋',
                    activeColor: '#0F766E',
                    activeBg: '#F0FDFA',
                    activeBorder: '#5EEAD4',
                  },
                  {
                    key: 'dinamis',
                    label: 'Operasional',
                    sub: '(Effective)',
                    desc: 'OPERATIONS EFFECTIVE HEADWAY (TCQSM Layer 2)\n\nFormula: headway = cycleTime ÷ activeBusIds\n\nMode "real world ops" — schedule split per status event boundary. Bus yang break/service/off di-EXCLUDE dari rotasi sehingga headway adjust real-time.\n\nGunakan untuk: simulasi disruption, validasi rencana mitigasi, "what will actually happen".',
                    icon: '⚡',
                    activeColor: '#92400E',
                    activeBg: '#FEF3C7',
                    activeBorder: '#FCD34D',
                  },
                ].map(mode => {
                  const isActive = headwayMode === mode.key;
                  const eventsCount = (route.busStatusEvents || []).length;
                  const isDynamic = mode.key === 'dinamis';
                  return (
                    <button
                      key={mode.key}
                      onClick={() => setHeadwayMode(mode.key)}
                      title={mode.desc}
                      style={{
                        padding: '5px 11px', fontSize: 11.5, fontWeight: isActive ? 700 : 500,
                        background: isActive ? mode.activeBg : 'transparent',
                        color: isActive ? mode.activeColor : TOKENS.textMuted,
                        border: 'none', borderRadius: 4, cursor: 'pointer',
                        boxShadow: isActive ? `0 1px 2px rgba(0,0,0,0.06), inset 0 0 0 1px ${mode.activeBorder}` : 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 12 }}>{mode.icon}</span>
                      {mode.label}
                      <span style={{ fontSize: 9.5, opacity: 0.7, fontWeight: 500 }}>{mode.sub}</span>
                      {isActive && isDynamic && eventsCount > 0 && (
                        <span style={{ background: mode.activeColor, color: '#FFFFFF', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>
                          {eventsCount} event
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* No-op warning: dinamis mode tapi tidak ada events */}
              {headwayMode === 'dinamis' && (route.busStatusEvents || []).length === 0 && (
                <span title="Tidak ada Status Bus events — Mode Operasional sama dengan Perencanaan" style={{ fontSize: 10, color: '#A16207', background: '#FEF9C3', border: '1px solid #FDE68A', padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
                  ⓘ Tidak berdampak (0 events)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* VIEW: OPERASI — schedule matrix & rit detail                     */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {jdView === 'operasi' && <>
        {/* LAYER 6 — JADWAL HALTE × TRIP / JAM (operator + penumpang)        */}
        {/* "Pukul berapa bus tiba di halte saya?" / "Trip ini siapa yg pegang?" */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div style={{ background: TOKENS.textMuted, color: '#FFFFFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 3 }}>6</div>
            <span style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Jadwal per Halte</span>
            <span style={{ fontSize: 11, color: TOKENS.textMuted, fontStyle: 'italic' }}>
              {viewMode === 'trip' ? '— format dispatcher (kolom = trip, terlihat rotasi bus)' : '— format penumpang (kolom = jam, mudah baca jadwal)'}
            </span>

            {/* Mode Operasional indicator — icons hidden because schedule absorbed events */}
            {headwayMode === 'dinamis' && (route.busStatusEvents || []).length > 0 && (
              <span title={`Mode Operasional aktif — schedule sudah re-generated dengan ${(route.busStatusEvents || []).length} status events. Per-trip status icons tidak ditampilkan karena trip yang affected sudah di-exclude/re-routed otomatis.`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '2px 8px', borderRadius: 10 }}>
                ⚡ Mode Operasional · icons disembunyikan (schedule sudah absorb)
              </span>
            )}

            {/* STANDBY DIAGNOSTIC — warn jika ada standby sisipan tapi 0 trips */}
            {(() => {
              const stbConfigured = (route.sisipanArmada || []).filter(s => s.mode === 'standby' && Number(s.deltaArmada) > 0);
              const stbActualTrips = sched.trips.filter(t => t.isStandby).length;
              if (stbConfigured.length > 0 && stbActualTrips === 0) {
                return (
                  <span title="Standby sisipan dikonfigurasi tapi tidak generate trip. Cek: window cukup panjang? cycleTime/delta < window?"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#991B1B', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: 10 }}>
                    ⚠ Standby ({stbConfigured.length}) tidak generate trip
                  </span>
                );
              }
              if (stbConfigured.length > 0 && stbActualTrips > 0) {
                return (
                  <span title={`${stbConfigured.length} standby sisipan menghasilkan ${stbActualTrips} extra trips`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#065F46', background: '#D1FAE5', border: '1px solid #6EE7B7', padding: '2px 8px', borderRadius: 10 }}>
                    ✦ {stbActualTrips} standby trip dari {stbConfigured.length} sisipan
                  </span>
                );
              }
              // Diagnostic untuk slot sisipan dengan delta > 0 yang user mungkin maksudnya standby
              const slotConfigured = (route.sisipanArmada || []).filter(s => (s.mode || 'slot') === 'slot' && Number(s.deltaArmada) > 0);
              if (slotConfigured.length > 0) {
                return (
                  <span title={`${slotConfigured.length} slot sisipan recalc headway. Kalau seharusnya standby (tidak shift jadwal), edit dan ubah mode.`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '2px 8px', borderRadius: 10 }}>
                    ⭐ {slotConfigured.length} slot sisipan aktif
                  </span>
                );
              }
              return null;
            })()}

            <div className="ml-auto flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="inline-flex items-center" style={{ background: TOKENS.surfaceMuted, border: `1px solid ${TOKENS.border}`, borderRadius: 6, padding: 2 }}>
                <button
                  onClick={() => setViewMode('trip')}
                  style={{
                    padding: '4px 11px', fontSize: 11, fontWeight: 500,
                    background: viewMode === 'trip' ? TOKENS.surface : 'transparent',
                    color: viewMode === 'trip' ? TOKENS.brand : TOKENS.textMuted,
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    boxShadow: viewMode === 'trip' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                  title="Format dispatcher: kolom = trip, header berlapis (Policy/RIT/Trip/Bus)"
                >
                  Per Trip
                </button>
                <button
                  onClick={() => setViewMode('jam')}
                  style={{
                    padding: '4px 11px', fontSize: 11, fontWeight: 500,
                    background: viewMode === 'jam' ? TOKENS.surface : 'transparent',
                    color: viewMode === 'jam' ? TOKENS.brand : TOKENS.textMuted,
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    boxShadow: viewMode === 'jam' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                  title="Format penumpang: kolom = jam, banyak kedatangan per cell"
                >
                  Per Jam
                </button>
              </div>

              {/* Direction Toggle (PP only) */}
              {m.isPP && (
                <div className="inline-flex items-center" style={{ background: TOKENS.surfaceMuted, border: `1px solid ${TOKENS.border}`, borderRadius: 6, padding: 2 }}>
                  {directions.map(d => (
                    <button
                      key={d.key}
                      onClick={() => setDirection(d.key)}
                      style={{
                        padding: '4px 11px', fontSize: 11, fontWeight: 500,
                        background: direction === d.key ? TOKENS.surface : 'transparent',
                        color: direction === d.key ? TOKENS.textPrimary : TOKENS.textMuted,
                        border: 'none', borderRadius: 4, cursor: 'pointer',
                        boxShadow: direction === d.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      }}
                    >
                      {d.key === 'berangkat' ? '→' : '←'} {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: 11, color: TOKENS.textMuted, marginBottom: 8 }}>
            <strong style={{ color: TOKENS.textSecondary, fontWeight: 500 }}>{activeDir.label}</strong> · {activeDir.flow}
          </div>

          {/* FILTER WAKTU — focus on specific range with dual viewpoint */}
          <div className="flex items-center gap-3 flex-wrap" style={{
            background: filterActive ? '#FFFBEB' : TOKENS.surfaceMuted,
            border: `1px solid ${filterActive ? '#FDE68A' : TOKENS.border}`,
            borderRadius: 6, padding: '7px 12px', marginBottom: 8, fontSize: 11,
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 9.5, color: filterActive ? '#92400E' : TOKENS.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Filter Waktu
            </span>

            {/* Range inputs */}
            <div className="flex items-center gap-1.5">
              <input
                type="time"
                value={timeRangeStart}
                onChange={e => setTimeRangeStart(e.target.value)}
                placeholder="--:--"
                style={{
                  width: 82, padding: '3px 6px', fontSize: 11.5,
                  border: `1px solid ${filterActive ? '#F59E0B' : TOKENS.border}`,
                  borderRadius: 4, background: '#FFFFFF',
                  color: TOKENS.textPrimary, fontVariantNumeric: 'tabular-nums', outline: 'none',
                }}
              />
              <span style={{ fontSize: 11, color: TOKENS.textMuted }}>—</span>
              <input
                type="time"
                value={timeRangeEnd}
                onChange={e => setTimeRangeEnd(e.target.value)}
                placeholder="--:--"
                style={{
                  width: 82, padding: '3px 6px', fontSize: 11.5,
                  border: `1px solid ${filterActive ? '#F59E0B' : TOKENS.border}`,
                  borderRadius: 4, background: '#FFFFFF',
                  color: TOKENS.textPrimary, fontVariantNumeric: 'tabular-nums', outline: 'none',
                }}
              />
            </div>

            {/* Match counter & reset */}
            {filterActive && (
              <>
                <span style={{ fontSize: 10.5, color: '#92400E', fontWeight: 600, marginLeft: 'auto' }}>
                  {filteredTrips.length} dari {sched.trips.length} trip
                  <span style={{ color: '#A1A1AA', fontWeight: 400, marginLeft: 4 }}>
                    ({sched.trips.length > 0 ? Math.round((filteredTrips.length / sched.trips.length) * 100) : 0}%)
                  </span>
                </span>
                <button
                  onClick={() => { setTimeRangeStart(''); setTimeRangeEnd(''); }}
                  style={{
                    padding: '3px 9px', fontSize: 10.5, fontWeight: 500,
                    background: 'transparent',
                    color: '#92400E',
                    border: '1px solid #F59E0B',
                    borderRadius: 4, cursor: 'pointer',
                  }}
                >
                  ✕ Reset
                </button>
              </>
            )}
            {!filterActive && (
              <span style={{ fontSize: 10.5, color: TOKENS.textMuted, fontStyle: 'italic', marginLeft: 'auto' }}>
                Kosongkan untuk lihat semua trip
              </span>
            )}
          </div>

          {/* TAMPILAN TOOLBAR — view options for spotlight, color mode, hover detail */}
          {viewMode === 'trip' && (
            <div className="flex items-center gap-3 flex-wrap" style={{ background: TOKENS.surfaceMuted, border: `1px solid ${TOKENS.border}`, borderRadius: 6, padding: '7px 12px', marginBottom: 8, fontSize: 11 }}>
              <span style={{ fontSize: 9.5, color: TOKENS.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tampilan</span>

              {/* Spotlight Sisipan toggle */}
              <button
                onClick={() => setSpotlightSisipan(!spotlightSisipan)}
                title="Tandai bus tambahan dari sisipan dengan ⭐ + warna emas"
                style={{
                  padding: '3px 9px', fontSize: 11, fontWeight: 500,
                  background: spotlightSisipan ? '#FEF3C7' : '#FFFFFF',
                  color: spotlightSisipan ? '#92400E' : TOKENS.textMuted,
                  border: `1px solid ${spotlightSisipan ? '#F59E0B' : TOKENS.border}`,
                  borderRadius: 4, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                <span style={{ fontSize: 10 }}>⭐</span>
                <span>Spotlight Sisipan</span>
                <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 2 }}>{spotlightSisipan ? 'ON' : 'OFF'}</span>
              </button>

              <div style={{ width: 1, height: 18, background: TOKENS.border }} />

              {/* Color mode segmented control */}
              <span style={{ fontSize: 10.5, color: TOKENS.textMuted, fontWeight: 500 }}>Pewarnaan:</span>
              <div className="inline-flex items-center" style={{ background: '#FFFFFF', border: `1px solid ${TOKENS.border}`, borderRadius: 4, padding: 1 }}>
                {[
                  { key: 'bus',     label: 'Bus',     desc: 'Warna sel = identitas bus (untuk lihat rotasi armada)' },
                  { key: 'periode', label: 'Periode', desc: 'Warna sel = kategori periode Peak/Off-Peak (untuk lihat pola waktu)' },
                  { key: 'window',  label: 'Window',  desc: 'Warna sel = armada window (untuk lihat perubahan armada/sisipan)' },
                ].map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => setColorMode(mode.key)}
                    title={mode.desc}
                    style={{
                      padding: '3px 9px', fontSize: 10.5, fontWeight: colorMode === mode.key ? 600 : 500,
                      background: colorMode === mode.key ? TOKENS.brandTint : 'transparent',
                      color: colorMode === mode.key ? TOKENS.brandStrong : TOKENS.textMuted,
                      border: 'none', borderRadius: 3, cursor: 'pointer',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div style={{ width: 1, height: 18, background: TOKENS.border }} />

              {/* Hover Detail toggle */}
              <button
                onClick={() => setTripTooltip(!tripTooltip)}
                title="Tampilkan kartu detail saat hover trip cell (bus, RIT, periode, layover)"
                style={{
                  padding: '3px 9px', fontSize: 11, fontWeight: 500,
                  background: tripTooltip ? '#EFF6FF' : '#FFFFFF',
                  color: tripTooltip ? '#1E40AF' : TOKENS.textMuted,
                  border: `1px solid ${tripTooltip ? '#3B82F6' : TOKENS.border}`,
                  borderRadius: 4, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                <span style={{ fontSize: 10 }}>💡</span>
                <span>Detail Hover</span>
                <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 2 }}>{tripTooltip ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}

          {viewMode === 'jam' ? (
            <StopHourMatrix
              halteRows={activeHalteRows}
              hours={hours}
              pxPerHour={pxPerHour}
              totalRouteKm={totalRouteKm}
              isPulang={direction === 'pulang'}
              busStatusEvents={headwayMode === 'dinamis' ? [] : (route.busStatusEvents || [])}
              spotlightSisipan={spotlightSisipan}
            />
          ) : (
            <TripBasedMatrix
              trips={filteredTrips.filter(t => t.direction === activeDir.key)}
              halte={activeDir.halte}
              isPulang={direction === 'pulang'}
              totalRouteKm={totalRouteKm}
              busStatusEvents={headwayMode === 'dinamis' ? [] : (route.busStatusEvents || [])}
              spotlightSisipan={spotlightSisipan}
              colorMode={colorMode}
              tripTooltip={tripTooltip}
            />
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* LAYER 7 — REFERENSI (RIT cycles + armada windows)                 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div style={{ background: TOKENS.textMuted, color: '#FFFFFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 3 }}>7</div>
            <span style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Detail RIT</span>
            <span style={{ fontSize: 11, color: TOKENS.textMuted, fontStyle: 'italic' }}>— rincian setiap RIT (1 putaran lengkap dispatch) + ringkasan armada window</span>
          </div>
          <RitDetailTable rits={filteredRits} ritGroups={sched.ritGroups} busStatusEvents={headwayMode === 'dinamis' ? [] : (route.busStatusEvents || [])} />
        </div>
        </>}

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* VIEW: PER BUS — utilization + Marey timeline                     */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {jdView === 'perbus' && <>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ background: TOKENS.textMuted, color: '#FFFFFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 3 }}>A</div>
              <span style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pemanfaatan Armada</span>
              <span style={{ fontSize: 11, color: TOKENS.textMuted, fontStyle: 'italic' }}>— beban kerja per unit bus</span>
            </div>
            <BusUtilizationList buses={buses} isPP={m.isPP} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ background: TOKENS.textMuted, color: '#FFFFFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 3 }}>B</div>
              <span style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Marey Diagram</span>
              <span style={{ fontSize: 11, color: TOKENS.textMuted, fontStyle: 'italic' }}>— garis waktu setiap bus, kapan jalan dan kapan istirahat</span>
            </div>
            <MareyDiagram
              buses={buses}
              hours={hours}
              winStart={winStart}
              winEnd={winEnd}
              pxPerHour={pxPerHour}
              isPP={m.isPP}
            />
          </div>
        </>}

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* VIEW: INSIGHT — pattern chart + auto-detected anomalies          */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {jdView === 'insight' && <>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ background: TOKENS.brand, color: '#FFFFFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 3 }}>A</div>
              <span style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Profil Headway 24 Jam</span>
              <span style={{ fontSize: 11, color: TOKENS.textMuted, fontStyle: 'italic' }}>— "kapan layanan padat, kapan jarang?"</span>
            </div>
            <HeadwayProfileChart ritGroups={sched.ritGroups} winStart={winStart} winEnd={winEnd} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ background: TOKENS.brand, color: '#FFFFFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 3 }}>B</div>
              <span style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Catatan & Rekomendasi</span>
              <span style={{ fontSize: 11, color: TOKENS.textMuted, fontStyle: 'italic' }}>— anomali yang terdeteksi otomatis</span>
            </div>
            <InsightsCallout insights={generateInsights(route, m, sched, buses)} />
          </div>
        </>}

        {/* DOCUMENT FOOTER */}
        <footer className="mt-8 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${TOKENS.border}`, fontSize: 10.5, color: TOKENS.textSubtle }}>
          <div>TransitOptima · Penjadwalan Operasional Harian · Disusun untuk pengambilan keputusan operasi</div>
          <div style={{ fontFamily: 'ui-monospace, monospace' }}>Generated {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · {today}</div>
        </footer>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* DRAWERS — All engineering tools accessible inline                   */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      <Drawer
        open={openDrawer === 'rute'}
        onClose={() => setOpenDrawer(null)}
        title="Rute & Halte"
        subtitle="Konfigurasi tipe rute, jam operasi, layover, dan rangkaian halte"
        icon={Route}
        width={920}
      >
        <TabParameter route={route} updateRoute={updateRoute} mode="eksisting" />
      </Drawer>

      <Drawer
        open={openDrawer === 'periode'}
        onClose={() => setOpenDrawer(null)}
        title="Kebijakan Periode"
        subtitle="Atur jam, nama, kategori, dan armada untuk tiap blok waktu"
        icon={Clock}
        width={1100}
      >
        <TabPeakOffPeak route={route} updateRoute={updateRoute} defaultSection="periode" />
      </Drawer>

      <Drawer
        open={openDrawer === 'sisipan'}
        onClose={() => setOpenDrawer(null)}
        title="Sisipan Armada"
        subtitle="Tambah/kurangi bus pada periode tertentu (event, cuaca, dll)"
        icon={Plus}
        width={1000}
      >
        <TabPeakOffPeak route={route} updateRoute={updateRoute} defaultSection="sisipan" />
      </Drawer>

      <Drawer
        open={openDrawer === 'status'}
        onClose={() => setOpenDrawer(null)}
        title="Status Operasi per Bus"
        subtitle="Tetapkan kondisi tiap bus per periode (Aktif/Break/Service/Standby/OFF)"
        icon={Bus}
        width={1100}
      >
        <TabPeakOffPeak route={route} updateRoute={updateRoute} defaultSection="status" />
      </Drawer>

      <Drawer
        open={openDrawer === 'biaya'}
        onClose={() => setOpenDrawer(null)}
        title="Biaya & Skema Kontrak"
        subtitle="Cost model + 5 skema kontrak (BTS, Sewa, Subsidi, PBC, KPBU)"
        icon={DollarSign}
        width={1100}
      >
        <TabBiaya route={route} updateRoute={updateRoute} />
      </Drawer>

      <Drawer
        open={openDrawer === 'wawasan'}
        onClose={() => setOpenDrawer(null)}
        title="Wawasan & Standar Engineering"
        subtitle="Audit kepatuhan, formula KPI, standar referensi (TCQSM, Permenhub, ILO)"
        icon={CheckCircle2}
        width={1200}
      >
        <TabWawasan route={route} updateRoute={updateRoute} />
      </Drawer>

      <Drawer
        open={openDrawer === 'disruption'}
        onClose={() => setOpenDrawer(null)}
        title="Disruption Scenario Simulator"
        subtitle="What-if analysis: bus breakdown, traffic, demand surge"
        icon={AlertTriangle}
        width={1100}
      >
        <TabDisruption route={route} updateRoute={updateRoute} setOpenDrawer={setOpenDrawer} />
      </Drawer>

      <Drawer
        open={openDrawer === 'sensitivitas'}
        onClose={() => setOpenDrawer(null)}
        title="Sensitivitas Headway"
        subtitle="Reaksi terhadap perubahan jumlah armada"
        icon={Activity}
        width={900}
      >
        <TabSensitivitas route={route} />
      </Drawer>

      <Drawer
        open={openDrawer === 'optimasi'}
        onClose={() => setOpenDrawer(null)}
        title="Skenario Optimasi"
        subtitle="Bangun skenario alternatif untuk dibandingkan dengan eksisting"
        icon={TrendingUp}
        width={1000}
      >
        <TabOptimasi route={route} updateRoute={updateRoute} />
      </Drawer>

      <Drawer
        open={openDrawer === 'komparasi'}
        onClose={() => setOpenDrawer(null)}
        title="Komparasi Skenario"
        subtitle="Side-by-side eksisting vs optimasi"
        icon={GitCompare}
        width={1100}
      >
        <TabKomparasi route={route} />
      </Drawer>

      <Drawer
        open={openDrawer === 'multirute'}
        onClose={() => setOpenDrawer(null)}
        title="Dashboard Multi-Rute"
        subtitle="Ringkasan semua rute dalam satu pandangan"
        icon={LayoutDashboard}
        width={1200}
      >
        <TabDashboard routes={routes} activeId={activeId} />
      </Drawer>
    </div>
  );
}

// ============================================================================
// TAB UTILISASI BUS — PER BUS (untuk Manajer Armada)
// ============================================================================
function TabUtilisasi({ route }) {
  const m = useMemo(() => calcMetrics(route), [route]);
  const sched = useMemo(() => generateSchedule(route, m), [route, m]);
  const buses = useMemo(() => generateBusUtilization(sched, route, m), [sched, route, m]);

  const stats = useMemo(() => {
    if (buses.length === 0) return { avgUtil: 0, totalTrips: 0, totalKm: 0, minUtil: 0, maxUtil: 0 };
    const utils = buses.map(b => b.utilizationPct);
    return {
      avgUtil: utils.reduce((s, u) => s + u, 0) / utils.length,
      minUtil: Math.min(...utils),
      maxUtil: Math.max(...utils),
      totalTrips: buses.reduce((s, b) => s + b.tripCount, 0),
      totalKm: buses.reduce((s, b) => s + b.totalKm, 0),
    };
  }, [buses]);

  if (buses.length === 0 || sched.trips.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bus className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
        <h3 className="text-lg font-semibold text-zinc-700 mb-2">Belum Ada Data Utilisasi</h3>
        <p className="text-sm text-zinc-500">Aktifkan periode dengan armada &gt; 0 untuk men-generate jadwal & utilisasi.</p>
      </Card>
    );
  }

  // Operating window (utk timeline)
  const winStart = Math.min(...sched.ritGroups.map(g => g.startMin));
  const winEnd = Math.max(...sched.ritGroups.map(g => g.endMin));
  const winSpan = winEnd - winStart;

  return (
    <div className="space-y-4">
      {/* AGGREGATE STATS */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="Total Bus Aktif" value={sched.totalBuses} unit="bus" icon={Bus} accent="cyan" />
        <KpiCard label="Avg Utilisasi" value={fmtPct(stats.avgUtil)} icon={Gauge} accent={stats.avgUtil >= 0.7 ? 'emerald' : stats.avgUtil >= 0.5 ? 'amber' : 'rose'} />
        <KpiCard label="Min Utilisasi" value={fmtPct(stats.minUtil)} icon={TrendingDown} accent="rose" />
        <KpiCard label="Max Utilisasi" value={fmtPct(stats.maxUtil)} icon={TrendingUp} accent="emerald" />
        <KpiCard label="Total Trip Distribusi" value={stats.totalTrips} unit={`trip / ${fmtNum(stats.totalKm, 0)} km`} icon={Activity} accent="violet" />
      </div>

      {/* COMPARATIVE BAR CHART */}
      <Card className="p-3">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
          <BarChart3 size={12} />
          Perbandingan Utilisasi & Beban Trip per Bus
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={buses.map(b => ({
            bus: `B${b.id}`,
            utilisasi: Number((b.utilizationPct * 100).toFixed(1)),
            trip: b.tripCount,
            km: Number(b.totalKm.toFixed(1)),
          }))}>
            <CartesianGrid stroke="#D4D4D8" strokeDasharray="3 3" />
            <XAxis dataKey="bus" stroke="#71717A" fontSize={11} />
            <YAxis yAxisId="left" stroke="#047857" fontSize={11} label={{ value: 'Utilisasi (%)', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#7C3AED" fontSize={11} label={{ value: 'Trip', angle: 90, position: 'insideRight', fill: '#a78bfa', fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D4D4D8', borderRadius: 6, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="utilisasi" fill="#047857" name="Utilisasi (%)" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="trip" fill="#7C3AED" name="Trip count" radius={[3, 3, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* PER-BUS CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {buses.map(b => {
          const utilStatus = b.utilizationPct >= 0.7 ? 'emerald' : b.utilizationPct >= 0.5 ? 'amber' : 'rose';
          const utilColor = utilStatus === 'emerald' ? 'text-emerald-700' : utilStatus === 'amber' ? 'text-amber-700' : 'text-rose-700';
          const utilBg = utilStatus === 'emerald' ? 'bg-emerald-500/10' : utilStatus === 'amber' ? 'bg-amber-500/10' : 'bg-rose-500/10';

          return (
            <Card key={b.id} className="overflow-hidden">
              {/* Header */}
              <div className={`px-3 py-2 border-b border-zinc-200 flex items-center justify-between ${utilBg}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                    <Bus size={16} className="text-zinc-700" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 font-mono" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      BUS-{String(b.id).padStart(2, '0')}
                      {b.isStandby && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#065F46', background: '#D1FAE5', border: '1px solid #6EE7B7', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em' }} title="Standby bus — operates only during sisipan window">
                          ✦ STANDBY
                        </span>
                      )}
                      {b.isSlotSisipan && !b.isStandby && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em' }} title="Sisipan slot bus">
                          ⭐ SISIPAN
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {b.isStandby ? 'Operasi standby (terminal availability)' : `Aktif di Rit: ${b.ritsActive.filter(r => r > 0).map(r => `R-${r}`).join(', ') || '—'}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold font-mono ${utilColor}`}>{fmtPct(b.utilizationPct)}</div>
                  <div className="text-[10px] text-zinc-500">utilisasi duty</div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-px bg-zinc-100">
                <div className="p-2 bg-white text-center">
                  <div className="text-[9px] text-zinc-500 uppercase font-mono">Trip</div>
                  <div className="text-sm font-bold font-mono text-emerald-700">{b.tripCount}</div>
                  {m.isPP && <div className="text-[9px] text-zinc-500">{b.berangkatCount}➡ / {b.pulangCount}⬅</div>}
                </div>
                <div className="p-2 bg-white text-center">
                  <div className="text-[9px] text-zinc-500 uppercase font-mono">Total KM</div>
                  <div className="text-sm font-bold font-mono text-emerald-700">{fmtNum(b.totalKm, 0)}</div>
                </div>
                <div className="p-2 bg-white text-center">
                  <div className="text-[9px] text-zinc-500 uppercase font-mono">Aktif</div>
                  <div className="text-sm font-bold font-mono text-amber-700">{fmtDurMin(b.activeMin)}</div>
                </div>
                <div className="p-2 bg-white text-center">
                  <div className="text-[9px] text-zinc-500 uppercase font-mono">Idle</div>
                  <div className="text-sm font-bold font-mono text-zinc-500">{fmtDurMin(b.idleMin)}</div>
                </div>
              </div>

              {/* Mini Gantt timeline */}
              <div className="p-3 border-t border-zinc-200">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] uppercase font-mono text-zinc-500">Timeline Operasi</div>
                  <div className="text-[10px] font-mono text-zinc-500">{fmtHM(b.firstDep)} – {fmtHM(b.lastArr)}</div>
                </div>
                <div className="relative h-6 bg-zinc-100/50 rounded overflow-hidden border border-zinc-200">
                  {/* Hour markers */}
                  {Array.from({ length: Math.ceil(winSpan / 60) + 1 }, (_, i) => {
                    const left = ((i * 60) / winSpan) * 100;
                    return <div key={i} className="absolute h-full border-l border-zinc-200/50" style={{ left: `${left}%` }} />;
                  })}
                  {/* Trip blocks */}
                  {b.trips.map((t, i) => {
                    const left = ((t.depMinutes - winStart) / winSpan) * 100;
                    const width = ((t.arrMinutes - t.depMinutes) / winSpan) * 100;
                    const blockColor = t.direction === 'berangkat'
                      ? 'bg-emerald-500/70 border-emerald-400'
                      : 'bg-violet-500/70 border-violet-400';
                    return (
                      <div
                        key={i}
                        className={`absolute h-full border-l ${blockColor}`}
                        style={{ left: `${left}%`, width: `${Math.max(0.5, width)}%` }}
                        title={`${t.direction} | ${fmtHM(t.depMinutes)}–${fmtHM(t.arrMinutes)} | Trip #${t.id} | ${t.periode?.kategori}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-0.5">
                  <span>{fmtHM(winStart)}</span>
                  <span>{fmtHM((winStart + winEnd) / 2)}</span>
                  <span>{fmtHM(winEnd)}</span>
                </div>
              </div>

              {/* Trip list (collapsible compact) */}
              <details className="border-t border-zinc-200">
                <summary className="px-3 py-2 cursor-pointer text-[11px] font-mono text-zinc-500 hover:text-zinc-800 select-none">
                  ▸ Detail {b.tripCount} trip BUS-{String(b.id).padStart(2, '0')}
                </summary>
                <div className="p-3 pt-0 space-y-1 max-h-60 overflow-auto">
                  {b.trips.map((t, i) => (
                    <div key={i} className={`flex items-center justify-between text-[11px] px-2 py-1 rounded border-l-2 ${KATEGORI_BG[t.periode?.kategori]}`}>
                      <div className="flex items-center gap-2 font-mono">
                        <span>{t.direction === 'berangkat' ? '➡️' : '⬅️'}</span>
                        <span className="text-emerald-700">#{t.id}</span>
                        <span className="text-violet-700">R{t.ritNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-zinc-700">
                        <span>{PERIODE_ICON[t.periode?.kategori]}</span>
                        <span>{fmtHM(t.depMinutes)}–{fmtHM(t.arrMinutes)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </Card>
          );
        })}
      </div>

      {/* LEGEND */}
      <Card className="p-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2">Status Utilisasi</div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500/60 rounded"></div><span className="text-zinc-700">≥ 70% — Optimal</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500/60 rounded"></div><span className="text-zinc-700">50–70% — Cukup</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500/60 rounded"></div><span className="text-zinc-700">&lt; 50% — Boros (terlalu banyak idle)</span></div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2">Block Timeline</div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500/70 rounded"></div><span className="text-zinc-700">Trip Berangkat (titik awal → akhir)</span></div>
              {m.isPP && <div className="flex items-center gap-2"><div className="w-3 h-3 bg-violet-500/70 rounded"></div><span className="text-zinc-700">Trip Pulang (titik akhir → awal)</span></div>}
              <div className="text-[10px] text-zinc-500 italic mt-1">Hover block utk detail trip & periode</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TabOptimasi({ route, updateRoute }) {
  // Optimasi mode: edit route.optimasi yang merupakan salinan modifiable
  const [aksi, setAksi] = useState('armada');

  const startOptimasi = () => {
    const optClone = {
      ...route,
      halte: route.halte.map(h => ({ ...h })),
      periode: route.periode.map(p => ({ ...p })),
      sisipanArmada: (route.sisipanArmada || []).map(s => ({ ...s })),
      busStatusEvents: (route.busStatusEvents || []).map(e => ({ ...e })),
      biaya: { ...route.biaya },
      optimasi: null,
    };
    updateRoute({ ...route, optimasi: migrateRouteSisipan(optClone) });
  };
  const resetOptimasi = () => updateRoute({ ...route, optimasi: null });
  const updateOpt = (next) => {
    // Auto-sync armadaPeriode + jamOps for opt clone (mirror updateActiveRoute behavior)
    const merged = { ...route.optimasi, ...next };
    const armadaTotal = Number(merged.armada) || 0;
    const syncedPeriode = (merged.periode || []).map(p => ({
      ...p,
      armadaPeriode: (p.on && p.kategori !== 'Tutup') ? armadaTotal : 0,
    }));
    const activePeriodes = syncedPeriode.filter(p => p.on && p.kategori !== 'Tutup');
    const computedJamOps = activePeriodes.length > 0
      ? Math.round(activePeriodes.reduce((sum, p) => sum + (Number(p.durasi) || 0), 0) * 10) / 10
      : merged.jamOps;
    const finalOpt = {
      ...merged,
      periode: syncedPeriode,
      jamOps: computedJamOps > 0 ? computedJamOps : merged.jamOps,
    };
    updateRoute({ ...route, optimasi: finalOpt });
  };

  if (!route.optimasi) {
    return (
      <div className="space-y-4">
        <Card className="p-8 text-center">
          <GitCompare className="w-12 h-12 mx-auto text-emerald-700 mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">Mode Optimasi Belum Aktif</h3>
          <p className="text-sm text-zinc-500 mb-4 max-w-md mx-auto">
            Aktifkan mode optimasi untuk membuat skenario rekayasa rute (perpanjang/perpendek rute, ubah armada, atur ulang halte). Data eksisting tetap aman & terpisah.
          </p>
          <Btn variant="primary" icon={Plus} size="lg" onClick={startOptimasi}>
            Mulai Skenario Optimasi
          </Btn>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, t: 'Perpanjang Rute', d: 'Tambah halte di ujung. Cocok kalau ada permintaan ke kawasan baru.' },
            { icon: TrendingDown, t: 'Perpendek Rute', d: 'Hapus halte ujung. Untuk efisiensi atau lemah-nya demand.' },
            { icon: Bus, t: 'Ubah Armada', d: 'Tambah / kurangi unit untuk capai target headway tertentu.' },
            { icon: MapPin, t: 'Tambah/Geser Halte', d: 'Tambah halte di tengah / ubah jarak antar halte.' },
            { icon: Clock, t: 'Ubah Jam Operasi', d: 'Perpanjang / perpendek window operasional harian.' },
            { icon: DollarSign, t: 'Skenario Tarif', d: 'Uji tarif baru, dampak ke laba/rugi & BEP.' },
          ].map(x => (
            <Card key={x.t} className="p-4">
              <x.icon className="w-6 h-6 text-emerald-700 mb-2" />
              <h4 className="text-sm font-semibold text-zinc-800 mb-1">{x.t}</h4>
              <p className="text-xs text-zinc-500">{x.d}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // EDITING MODE
  const opt = route.optimasi;
  const mEks = calcMetrics(route);
  const mOpt = calcMetrics(opt);
  const cEks = calcCost(route, mEks);
  const cOpt = calcCost(opt, mOpt);

  const aksiPanels = {
    armada: (
      <div className="space-y-3">
        <p className="text-xs text-zinc-500">Geser slider untuk mengubah jumlah armada. Headway, frekuensi, biaya, dan revenue akan auto-recalculate.</p>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Jumlah Armada Optimasi</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1" max="20"
              value={opt.armada}
              onChange={e => updateOpt({ armada: parseInt(e.target.value) })}
              className="flex-1"
            />
            <NumInput value={opt.armada} onChange={v => updateOpt({ armada: v })} suffix="bus" min={1} className="w-24" />
          </div>
          <div className="text-xs text-zinc-500 mt-1">Eksisting: {route.armada} bus → Optimasi: <span className="text-emerald-700">{opt.armada} bus ({opt.armada > route.armada ? '+' : ''}{opt.armada - route.armada})</span></div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Layover Optimasi (mnt)</label>
          <NumInput value={opt.layover} onChange={v => updateOpt({ layover: v })} suffix="mnt" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Jam Operasi Optimasi</label>
          <NumInput value={opt.jamOps} onChange={v => updateOpt({ jamOps: v })} suffix="jam" step={0.5} />
        </div>
      </div>
    ),
    perpanjang: (
      <div className="space-y-3">
        <p className="text-xs text-zinc-500">Tambah halte baru di ujung rute. Travel time & dwell baru ikut dihitung ke RTT.</p>
        <Btn icon={Plus} variant="primary" onClick={() => {
          const lastId = Math.max(0, ...opt.halte.map(h => h.id));
          const lastJarak = opt.halte[opt.halte.length - 1].jarakKum;
          const newH = { id: lastId + 1, nama: `Halte Baru ${lastId + 1}`, jarakKum: lastJarak + 2, dwell: 0.5, travelOverride: 5 };
          updateOpt({ halte: [...opt.halte.slice(0, -1), { ...opt.halte[opt.halte.length - 1] }, newH] });
        }}>Tambah Halte di Ujung</Btn>
        <div className="border-t border-zinc-200 pt-3 mt-3">
          <div className="text-xs text-zinc-500 mb-2">Halte di rute optimasi:</div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {opt.halte.map((h, idx) => (
              <div key={h.id} className="flex items-center gap-2 text-xs p-1.5 bg-white rounded">
                <span className="text-zinc-500 font-mono w-6">{idx + 1}.</span>
                <input value={h.nama} onChange={e => {
                  updateOpt({ halte: opt.halte.map(hh => hh.id === h.id ? { ...hh, nama: e.target.value } : hh) });
                }} className="flex-1 bg-transparent text-zinc-800 focus:outline-none focus:bg-zinc-100 px-1 rounded" />
                <input type="number" step="0.1" value={h.jarakKum} onChange={e => {
                  updateOpt({ halte: opt.halte.map(hh => hh.id === h.id ? { ...hh, jarakKum: parseFloat(e.target.value) || 0 } : hh) });
                }} className="w-16 bg-zinc-100 text-right font-mono text-emerald-700 px-1 rounded text-xs" />
                <span className="text-zinc-400 text-[10px]">km</span>
                <button onClick={() => {
                  if (opt.halte.length > 2) updateOpt({ halte: opt.halte.filter(hh => hh.id !== h.id) });
                }} className="text-zinc-400 hover:text-rose-700">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    perpendek: (
      <div className="space-y-3">
        <p className="text-xs text-zinc-500">Hapus halte ujung untuk perpendek rute. Total RTT berkurang, headway tetap dengan armada sama.</p>
        <Btn variant="danger" icon={Trash2} onClick={() => {
          if (opt.halte.length > 2) {
            const removed = opt.halte[opt.halte.length - 2];
            updateOpt({ halte: [...opt.halte.slice(0, -2), opt.halte[opt.halte.length - 1]] });
          }
        }}>Hapus Halte Sebelum Terminal Akhir</Btn>
        <div className="text-xs text-zinc-500">
          Eksisting: {route.halte.length} halte ({fmtNum(mEks.jarakPerArah, 2)} km/arah)<br />
          Optimasi: {opt.halte.length} halte ({fmtNum(mOpt.jarakPerArah, 2)} km/arah)
        </div>
      </div>
    ),
    tarif: (
      <div className="space-y-3">
        <p className="text-xs text-zinc-500">Uji dampak perubahan tarif terhadap pendapatan & break-even.</p>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Tarif Baru (Rp/Pax)</label>
          <NumInput value={opt.biaya.tarif} onChange={v => updateOpt({ biaya: { ...opt.biaya, tarif: v } })} suffix="Rp" step={500} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Avg Pax/Trip (estimasi setelah perubahan tarif)</label>
          <NumInput value={opt.biaya.avgPax} onChange={v => updateOpt({ biaya: { ...opt.biaya, avgPax: v } })} suffix="orang" />
        </div>
        <div className="text-xs text-zinc-500 p-2 bg-zinc-100/60 rounded">
          💡 Tarif naik biasanya menurunkan ridership. Asumsi elastisitas: -0,3 (kenaikan 10% tarif = -3% pax). Sesuaikan avg pax sesuai perkiraan elastisitas pasar Anda.
        </div>
      </div>
    ),
    jamops: (
      <div className="space-y-3">
        <p className="text-xs text-zinc-500">Atur ulang window operasional harian.</p>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Jam Operasi/Hari</label>
          <input type="range" min="4" max="24" step="0.5" value={opt.jamOps} onChange={e => updateOpt({ jamOps: parseFloat(e.target.value) })} className="w-full" />
          <div className="flex justify-between text-xs text-zinc-500 font-mono mt-1">
            <span>4 jam</span><span className="text-emerald-700 text-base">{fmtJamMenit(opt.jamOps)}</span><span>24 jam</span>
          </div>
        </div>
        <div className="text-xs text-zinc-500">
          Eksisting: {fmtJamMenit(route.jamOps)} → Optimasi: {fmtJamMenit(opt.jamOps)} ({opt.jamOps > route.jamOps ? '+' : ''}{fmtJamMenit(Math.abs(opt.jamOps - route.jamOps))})
        </div>
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-300 rounded-lg">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-emerald-700" />
          <div>
            <div className="text-sm font-semibold text-emerald-700">Mode Optimasi Aktif</div>
            <div className="text-xs text-zinc-500">Edit di bawah, lalu lihat tab Komparasi untuk before/after</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" icon={RotateCcw} size="sm" onClick={() => updateOpt({
            armada: route.armada, layover: route.layover, jamOps: route.jamOps,
            halte: route.halte.map(h => ({ ...h })),
            biaya: { ...route.biaya },
          })}>Reset ke Eksisting</Btn>
          <Btn variant="danger" icon={XCircle} size="sm" onClick={resetOptimasi}>Tutup Mode Optimasi</Btn>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <Section title="Pilih Aksi Optimasi" icon={Settings}>
            <div className="space-y-1">
              {[
                ['armada', 'Ubah Armada / Layover / Jam', Bus],
                ['perpanjang', 'Perpanjang Rute (tambah halte)', TrendingUp],
                ['perpendek', 'Perpendek Rute (hapus halte)', TrendingDown],
                ['tarif', 'Skenario Tarif & Pendapatan', DollarSign],
                ['jamops', 'Atur Ulang Jam Operasi', Clock],
              ].map(([k, label, Icon]) => (
                <button
                  key={k}
                  onClick={() => setAksi(k)}
                  className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${aksi === k ? 'bg-emerald-100 border border-emerald-700/50 text-emerald-200' : 'bg-zinc-100/60 hover:bg-zinc-100 text-zinc-700 border border-transparent'}`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </Section>
        </div>

        <div className="col-span-8">
          <Section title={`Editor: ${{ armada: 'Armada & Cycle', perpanjang: 'Perpanjang Rute', perpendek: 'Perpendek Rute', tarif: 'Tarif & Pendapatan', jamops: 'Jam Operasi' }[aksi]}`} icon={Settings}>
            {aksiPanels[aksi]}
          </Section>
        </div>
      </div>

      {/* Quick comparison preview */}
      <Section title="Preview Dampak (Eksisting vs Optimasi)" icon={GitCompare}>
        <ComparisonGrid mEks={mEks} mOpt={mOpt} cEks={cEks} cOpt={cOpt} compact />
      </Section>
    </div>
  );
}

function ComparisonGrid({ mEks, mOpt, cEks, cOpt, compact = false }) {
  const compareItem = (label, eks, opt, unit, betterIfHigher = true, isMoney = false) => {
    const delta = opt - eks;
    const pct = eks !== 0 ? (delta / eks) : 0;
    const isBetter = betterIfHigher ? delta > 0 : delta < 0;
    const isSame = Math.abs(delta) < 0.01;
    const tone = isSame ? 'text-zinc-500' : isBetter ? 'text-emerald-700' : 'text-rose-700';
    const Icon = isSame ? Minus : delta > 0 ? TrendingUp : TrendingDown;
    const fmt = (v) => isMoney ? fmtRp(v) : (typeof v === 'number' ? fmtNum(v, unit === 'pax' || unit === 'trip' || unit === 'bus' ? 0 : 1) : v);
    return (
      <div className={`grid grid-cols-12 gap-2 py-${compact ? '1' : '1.5'} border-b border-zinc-200 items-center text-xs`}>
        <div className="col-span-4 text-zinc-700">{label}</div>
        <div className="col-span-3 text-right font-mono text-zinc-800">{fmt(eks)} <span className="text-[10px] text-zinc-500">{unit}</span></div>
        <div className="col-span-1 text-center"><ChevronRight size={12} className="text-zinc-400 mx-auto" /></div>
        <div className="col-span-3 text-right font-mono text-emerald-700">{fmt(opt)} <span className="text-[10px] text-emerald-700">{unit}</span></div>
        <div className={`col-span-1 text-right font-mono text-xs flex items-center justify-end gap-0.5 ${tone}`}>
          <Icon size={10} />
          {!isSame && fmtPct(Math.abs(pct), 0)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-12 gap-2 pb-2 border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
        <div className="col-span-4">Metrik</div>
        <div className="col-span-3 text-right">Eksisting</div>
        <div className="col-span-1"></div>
        <div className="col-span-3 text-right text-emerald-700">Optimasi</div>
        <div className="col-span-1 text-right">Δ</div>
      </div>
      <div className="text-[10px] uppercase font-mono text-zinc-500 pt-2">Operasional</div>
      {compareItem('Headway', mEks.headway, mOpt.headway, 'mnt', false)}
      {compareItem('Frekuensi', mEks.freqPerJam, mOpt.freqPerJam, '/jam', true)}
      {compareItem('Kec. Komersial', mEks.kecKomersial, mOpt.kecKomersial, 'km/h', true)}
      {compareItem('RTT', mEks.rtt, mOpt.rtt, 'mnt', false)}
      {compareItem('Cycle Time', mEks.cycleTime, mOpt.cycleTime, 'mnt', false)}
      {compareItem('Trip per Hari', mEks.totalTrip, mOpt.totalTrip, 'trip', true)}
      {compareItem('Total km/Hari', mEks.totalKm, mOpt.totalKm, 'km', true)}
      <div className="text-[10px] uppercase font-mono text-zinc-500 pt-2">Finansial</div>
      {compareItem('Total Biaya/Hari', cEks.totalBiaya, cOpt.totalBiaya, '', false, true)}
      {compareItem('Pendapatan/Hari', cEks.totalPendapatan, cOpt.totalPendapatan, '', true, true)}
      {compareItem('Laba/Rugi/Hari', cEks.labaRugi, cOpt.labaRugi, '', true, true)}
      {compareItem('Biaya per km', cEks.biayaPerKm, cOpt.biayaPerKm, '', false, true)}
      {compareItem('Biaya per Pax', cEks.biayaPerPax, cOpt.biayaPerPax, '', false, true)}
      {compareItem('Tarif BEP', cEks.tarifBEP, cOpt.tarifBEP, '', false, true)}
      {compareItem('Pax BEP/Trip', cEks.paxBEPperTrip, cOpt.paxBEPperTrip, 'pax', false)}
    </div>
  );
}

function TabKomparasi({ route }) {
  if (!route.optimasi) {
    return (
      <Card className="p-8 text-center">
        <GitCompare className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
        <h3 className="text-lg font-semibold text-zinc-700 mb-2">Belum Ada Skenario Optimasi</h3>
        <p className="text-sm text-zinc-500 mb-4">Buka tab "Optimasi" untuk membuat skenario rekayasa rute terlebih dahulu.</p>
      </Card>
    );
  }
  const mEks = calcMetrics(route);
  const mOpt = calcMetrics(route.optimasi);
  const cEks = calcCost(route, mEks);
  const cOpt = calcCost(route.optimasi, mOpt);

  const radarData = [
    { metrik: 'Headway', eks: 100 - Math.min(100, mEks.headway * 5), opt: 100 - Math.min(100, mOpt.headway * 5), full: 100 },
    { metrik: 'Frekuensi', eks: Math.min(100, mEks.freqPerJam * 10), opt: Math.min(100, mOpt.freqPerJam * 10), full: 100 },
    { metrik: 'Kecepatan', eks: Math.min(100, mEks.kecKomersial * 3), opt: Math.min(100, mOpt.kecKomersial * 3), full: 100 },
    { metrik: 'Cakupan', eks: Math.min(100, mEks.jarakPerArah * 8), opt: Math.min(100, mOpt.jarakPerArah * 8), full: 100 },
    { metrik: 'Margin', eks: Math.max(0, Math.min(100, 50 + cEks.marginPct * 200)), opt: Math.max(0, Math.min(100, 50 + cOpt.marginPct * 200)), full: 100 },
    { metrik: 'Trip/Hari', eks: Math.min(100, mEks.totalTrip), opt: Math.min(100, mOpt.totalTrip), full: 100 },
  ];

  // Bar comparison data
  const barData = [
    { metrik: 'Headway', eks: mEks.headway, opt: mOpt.headway },
    { metrik: 'Frek/jam', eks: mEks.freqPerJam, opt: mOpt.freqPerJam },
    { metrik: 'Kec.Komers', eks: mEks.kecKomersial, opt: mOpt.kecKomersial },
    { metrik: 'Trip/Hari', eks: mEks.totalTrip, opt: mOpt.totalTrip },
  ];
  const finData = [
    { metrik: 'Biaya/Hari (Jt)', eks: cEks.totalBiaya / 1e6, opt: cOpt.totalBiaya / 1e6 },
    { metrik: 'Pendapatan/Hari (Jt)', eks: cEks.totalPendapatan / 1e6, opt: cOpt.totalPendapatan / 1e6 },
    { metrik: 'Laba/Hari (Jt)', eks: cEks.labaRugi / 1e6, opt: cOpt.labaRugi / 1e6 },
  ];

  // REKOMENDASI VERDICT
  const verdicts = [];
  if (mOpt.headway < mEks.headway) verdicts.push({ ok: true, t: `Headway membaik dari ${fmtNum(mEks.headway, 1)} → ${fmtNum(mOpt.headway, 1)} mnt` });
  if (mOpt.headway > mEks.headway) verdicts.push({ ok: false, t: `Headway memburuk dari ${fmtNum(mEks.headway, 1)} → ${fmtNum(mOpt.headway, 1)} mnt` });
  if (cOpt.labaRugi > cEks.labaRugi) verdicts.push({ ok: true, t: `Profitabilitas naik ${fmtRp(cOpt.labaRugi - cEks.labaRugi)}/hari` });
  if (cOpt.labaRugi < cEks.labaRugi) verdicts.push({ ok: false, t: `Profitabilitas turun ${fmtRp(cEks.labaRugi - cOpt.labaRugi)}/hari` });
  if (mOpt.kecKomersial > mEks.kecKomersial) verdicts.push({ ok: true, t: `Kecepatan komersial meningkat ${fmtNum(mOpt.kecKomersial - mEks.kecKomersial, 1)} km/jam` });
  if (mOpt.totalTrip > mEks.totalTrip) verdicts.push({ ok: true, t: `Kapasitas naik ${mOpt.totalTrip - mEks.totalTrip} trip/hari (${fmtPct((mOpt.totalTrip - mEks.totalTrip) / mEks.totalTrip)})` });
  if (mOpt.statusHeadway.label === 'BAIK' && mEks.statusHeadway.label !== 'BAIK') verdicts.push({ ok: true, t: `Status layanan naik ke 🟢 BAIK` });

  const overallScore = (cOpt.labaRugi - cEks.labaRugi) > 0 && mOpt.headway <= mEks.headway ? 'STRONGLY RECOMMENDED' :
    (mOpt.headway < mEks.headway && cOpt.labaRugi >= cEks.labaRugi * 0.9) ? 'RECOMMENDED' :
    cOpt.labaRugi >= cEks.labaRugi ? 'NEUTRAL — bobot trade-off' : 'NOT RECOMMENDED';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <Section title="Komparasi Lengkap: Eksisting vs Optimasi" icon={GitCompare}>
            <ComparisonGrid mEks={mEks} mOpt={mOpt} cEks={cEks} cOpt={cOpt} />
          </Section>
        </div>

        <div className="col-span-5 space-y-4">
          <Section title="Verdict Rekomendasi" icon={Activity}>
            <div className={`p-4 rounded-lg mb-3 text-center ${overallScore.includes('STRONGLY') ? 'bg-emerald-500/10 border border-emerald-500/40' :
              overallScore.includes('RECOMMENDED') && !overallScore.includes('NOT') ? 'bg-emerald-50 border border-emerald-300' :
                overallScore.includes('NEUTRAL') ? 'bg-amber-500/10 border border-amber-500/40' : 'bg-rose-500/10 border border-rose-500/40'}`}>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono mb-1">Verdict</div>
              <div className={`text-lg font-bold ${overallScore.includes('STRONGLY') ? 'text-emerald-300' :
                overallScore.includes('RECOMMENDED') && !overallScore.includes('NOT') ? 'text-emerald-700' :
                  overallScore.includes('NEUTRAL') ? 'text-amber-300' : 'text-rose-300'}`}>{overallScore}</div>
            </div>
            <div className="space-y-1.5">
              {verdicts.length === 0 && <div className="text-xs text-zinc-500 text-center py-3">Tidak ada perubahan signifikan terdeteksi.</div>}
              {verdicts.map((v, i) => (
                <div key={i} className={`flex items-start gap-2 text-xs p-1.5 rounded ${v.ok ? 'bg-emerald-500/5 text-emerald-300' : 'bg-rose-500/5 text-rose-300'}`}>
                  {v.ok ? <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />}
                  <span>{v.t}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Section title="Operasional KPI" icon={Activity}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid stroke="#E4E4E7" strokeDasharray="3 3" />
                <XAxis dataKey="metrik" stroke="#71717A" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717A" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #D4D4D8', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="eks" fill="#64748b" name="Eksisting" />
                <Bar dataKey="opt" fill="#047857" name="Optimasi" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Finansial Harian (Jt Rp)" icon={DollarSign}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finData}>
                <CartesianGrid stroke="#E4E4E7" strokeDasharray="3 3" />
                <XAxis dataKey="metrik" stroke="#71717A" tick={{ fontSize: 9 }} />
                <YAxis stroke="#71717A" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #D4D4D8', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="eks" fill="#64748b" name="Eksisting" />
                <Bar dataKey="opt" fill="#10b981" name="Optimasi" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Profile Kinerja (Skor 0-100)" icon={Activity}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#D4D4D8" />
                <PolarAngleAxis dataKey="metrik" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: '#475569' }} />
                <Radar name="Eksisting" dataKey="eks" stroke="#71717A" fill="#64748b" fillOpacity={0.3} />
                <Radar name="Optimasi" dataKey="opt" stroke="#047857" fill="#047857" fillOpacity={0.5} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title="Tabel Halte: Eksisting vs Optimasi" icon={MapPin}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-mono uppercase text-zinc-500 mb-2">Eksisting ({route.halte.length} halte, {fmtNum(mEks.jarakPerArah, 2)} km)</div>
            <div className="space-y-1">
              {route.halte.map((h, i) => (
                <div key={h.id} className="flex items-center gap-2 text-xs p-1.5 bg-white rounded">
                  <span className="text-zinc-500 font-mono w-5">{i + 1}.</span>
                  <span className="flex-1 text-zinc-700">{h.nama}</span>
                  <span className="font-mono text-zinc-500">{fmtNum(h.jarakKum, 2)} km</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-emerald-700 mb-2">Optimasi ({route.optimasi.halte.length} halte, {fmtNum(mOpt.jarakPerArah, 2)} km)</div>
            <div className="space-y-1">
              {route.optimasi.halte.map((h, i) => {
                const eksHalte = route.halte.find(eh => eh.nama === h.nama);
                const isNew = !eksHalte;
                return (
                  <div key={h.id} className={`flex items-center gap-2 text-xs p-1.5 rounded ${isNew ? 'bg-emerald-50 border border-emerald-300' : 'bg-white'}`}>
                    <span className="text-zinc-500 font-mono w-5">{i + 1}.</span>
                    <span className={`flex-1 ${isNew ? 'text-emerald-700' : 'text-zinc-700'}`}>{h.nama} {isNew && <span className="text-[10px] text-emerald-700 ml-1">(BARU)</span>}</span>
                    <span className="font-mono text-zinc-500">{fmtNum(h.jarakKum, 2)} km</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function TabDashboard({ routes, activeId }) {
  const dashRoutes = routes.map(r => {
    const m = calcMetrics(r);
    const c = calcCost(r, m);
    return { route: r, m, c };
  });
  const aktif = dashRoutes.find(d => d.route.id === activeId);

  return (
    <div className="space-y-4">
      {aktif && (
        <>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Dashboard Operasional — {aktif.route.nama}</h2>
              <p className="text-xs text-zinc-500">Rute aktif. Switch di sidebar untuk lihat rute lain.</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill band={aktif.m.statusHeadway} size="lg" />
              <StatusPill band={aktif.m.statusKecepatan} size="lg" />
              <StatusPill band={aktif.m.statusFrekuensi} size="lg" />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3">
            <KpiCard label="Armada" value={aktif.route.armada} unit="bus" icon={Bus} accent="cyan" />
            <KpiCard label="Halte" value={aktif.route.halte.length} unit={`(${aktif.m.jumlahHalteIntermediate} intermediate)`} icon={MapPin} accent="violet" />
            <KpiCard label="Headway" value={fmtNum(aktif.m.headway, 1)} unit="mnt" status={aktif.m.statusHeadway} accent="cyan" />
            <KpiCard label="Frekuensi" value={fmtNum(aktif.m.freqPerJam, 1)} unit="/jam" status={aktif.m.statusFrekuensi} accent="emerald" />
            <KpiCard label="Kec.Komersial" value={fmtNum(aktif.m.kecKomersial, 1)} unit="km/h" status={aktif.m.statusKecepatan} accent="violet" />
            <KpiCard label="Trip/Hari" value={aktif.m.totalTrip} unit="trip" icon={Activity} accent="amber" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <KpiCard label="Total Biaya/Hari" value={fmtRp(aktif.c.totalBiaya)} accent="rose" icon={DollarSign} />
            <KpiCard label="Pendapatan/Hari" value={fmtRp(aktif.c.totalPendapatan)} accent="emerald" icon={TrendingUp} />
            <KpiCard
              label="Laba / Rugi"
              value={fmtRp(aktif.c.labaRugi)}
              accent={aktif.c.labaRugi >= 0 ? 'emerald' : 'rose'}
              icon={aktif.c.labaRugi >= 0 ? TrendingUp : TrendingDown}
              sub={`Margin ${fmtPct(aktif.c.marginPct)}`}
            />
          </div>
        </>
      )}

      <Section title={`Multi-Rute Registry (${routes.length} rute terdaftar)`} icon={Route}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-200">
                <th className="text-left py-2 px-2 font-mono">Rute</th>
                <th className="text-right py-2 px-2 font-mono">Armada</th>
                <th className="text-right py-2 px-2 font-mono">Jarak/Arah</th>
                <th className="text-right py-2 px-2 font-mono">RTT</th>
                <th className="text-right py-2 px-2 font-mono">Cycle</th>
                <th className="text-right py-2 px-2 font-mono">Headway</th>
                <th className="text-right py-2 px-2 font-mono">Trip/Hari</th>
                <th className="text-right py-2 px-2 font-mono">Total km/Hari</th>
                <th className="text-right py-2 px-2 font-mono">Biaya/Hari</th>
                <th className="text-right py-2 px-2 font-mono">Laba/Rugi</th>
                <th className="text-center py-2 px-2 font-mono">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashRoutes.map(d => (
                <tr key={d.route.id} className={`border-b border-zinc-200 ${d.route.id === activeId ? 'bg-emerald-500/5' : ''} hover:bg-zinc-100/40`}>
                  <td className="py-1.5 px-2 font-mono">
                    {d.route.id === activeId && <span className="text-emerald-700 mr-1">⭐</span>}
                    <span className={d.route.id === activeId ? 'text-emerald-700 font-bold' : 'text-zinc-800'}>{d.route.nama}</span>
                    {d.route.optimasi && <span className="text-[9px] ml-2 px-1 bg-violet-500/20 text-violet-300 rounded">+OPT</span>}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">{d.route.armada}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{fmtNum(d.m.jarakPerArah, 2)} km</td>
                  <td className="py-1.5 px-2 text-right font-mono">{fmtNum(d.m.rtt, 0)} mnt</td>
                  <td className="py-1.5 px-2 text-right font-mono">{fmtDurMin(d.m.cycleTime)}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-emerald-700">{fmtNum(d.m.headway, 1)} mnt</td>
                  <td className="py-1.5 px-2 text-right font-mono">{d.m.totalTrip}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{fmtNum(d.m.totalKm, 0)}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-rose-300">{fmtRp(d.c.totalBiaya)}</td>
                  <td className={`py-1.5 px-2 text-right font-mono ${d.c.labaRugi >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{fmtRp(d.c.labaRugi)}</td>
                  <td className="py-1.5 px-2 text-center"><StatusPill band={d.m.statusHeadway} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Komparasi Headway antar Rute" icon={Clock}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashRoutes.map(d => ({ rute: d.route.nama, headway: d.m.headway, ideal: 10 }))}>
                <CartesianGrid stroke="#E4E4E7" strokeDasharray="3 3" />
                <XAxis dataKey="rute" stroke="#71717A" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717A" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #D4D4D8', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="headway" fill="#047857" name="Headway aktual" />
                <ReferenceLine y={10} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Ideal ≤10', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Standar ≤20', fill: '#f59e0b', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Profitabilitas antar Rute (Jt Rp/Hari)" icon={DollarSign}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashRoutes.map(d => ({ rute: d.route.nama, biaya: d.c.totalBiaya / 1e6, pendapatan: d.c.totalPendapatan / 1e6, laba: d.c.labaRugi / 1e6 }))}>
                <CartesianGrid stroke="#E4E4E7" strokeDasharray="3 3" />
                <XAxis dataKey="rute" stroke="#71717A" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717A" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #D4D4D8', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="biaya" fill="#f43f5e" name="Biaya" />
                <Bar dataKey="pendapatan" fill="#10b981" name="Pendapatan" />
                <Bar dataKey="laba" fill="#047857" name="Laba" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

const STORAGE_KEY = 'transitoptima-state-v1';

// ── MIGRATION HELPER ──
// Convert legacy periode.sisipan / periode.customHeadway to new sisipanArmada array.
// Idempotent: safe to run multiple times. Returns NEW route object (no mutation).
const migrateRouteSisipan = (route) => {
  if (!route) return route;
  // If already has sisipanArmada array (even empty), no migration needed for periode legacy
  // BUT we still convert any leftover legacy data
  const existing = Array.isArray(route.sisipanArmada) ? route.sisipanArmada : [];
  const migrated = [...existing];
  let nextId = (existing.reduce((m, s) => Math.max(m, s.id || 0), 0)) + 1;

  const newPeriode = (route.periode || []).map(p => {
    const oldSisipan = Number(p.sisipan) || 0;
    const oldCustomH = Number(p.customHeadway) || 0;
    if (!p.on || (oldSisipan === 0 && oldCustomH === 0)) return p;
    if (p.kategori === 'Tutup') return { ...p, sisipan: 0, customHeadway: 0 };
    // Parse jam string "HH:MM-HH:MM" to minutes
    const m = String(p.jam || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!m) return p;
    const startMin = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    const endMin = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
    // Check if equivalent sisipan already exists (idempotent guard)
    const exists = migrated.some(s =>
      s.startMin === startMin && s.endMin === endMin &&
      s.deltaArmada === oldSisipan && (Number(s.customHeadway) || 0) === oldCustomH
    );
    if (!exists) {
      migrated.push({
        id: nextId++,
        startMin, endMin,
        deltaArmada: oldSisipan,
        customHeadway: oldCustomH,
        catatan: p.catatan ? `[migrasi ${p.kode}] ${p.catatan}` : `[migrasi ${p.kode}] ${p.nama}`,
      });
    }
    // Strip legacy fields
    return { ...p, sisipan: 0, customHeadway: 0 };
  });

  // Sync armadaPeriode = route.armada for all active periodes (single source of truth)
  // Also recompute durasi from jam string (handle any stale data)
  const armadaTotal = Number(route.armada) || 0;
  const finalPeriode = newPeriode.map(p => {
    // Recompute durasi from jam string for accuracy
    const [jStart, jEnd] = (p.jam || '00:00-00:00').split('-');
    const sMin = parseHM(jStart);
    const eMin = parseHM(jEnd);
    let durMin;
    if (eMin > sMin) durMin = eMin - sMin;
    else if (eMin < sMin) durMin = (24 * 60 - sMin) + eMin; // wrap midnight
    else durMin = 0;
    const recomputedDurasi = +(durMin / 60).toFixed(2);
    return {
      ...p,
      durasi: recomputedDurasi,
      armadaPeriode: (p.on && p.kategori !== 'Tutup') ? armadaTotal : 0,
    };
  });

  // Auto-derive jamOps from active periodes
  const activePeriodes = finalPeriode.filter(p => p.on && p.kategori !== 'Tutup');
  const computedJamOps = activePeriodes.length > 0
    ? Math.round(activePeriodes.reduce((sum, p) => sum + (Number(p.durasi) || 0), 0) * 10) / 10
    : (Number(route.jamOps) || 0);

  return {
    ...route,
    kapasitasBus: Number(route.kapasitasBus) || 80,
    demandPHPDV: Number(route.demandPHPDV) || 0,
    periode: finalPeriode,
    sisipanArmada: migrated,
    jamOps: computedJamOps > 0 ? computedJamOps : (Number(route.jamOps) || 0),
  };
};

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState('jadwal');
  const [loading, setLoading] = useState(true);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const saveTimer = useRef(null);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          if (parsed.routes && parsed.routes.length > 0) {
            // Apply migration to convert legacy periode.sisipan to sisipanArmada array
            const migratedRoutes = parsed.routes.map(migrateRouteSisipan);
            setRoutes(migratedRoutes);
            setActiveId(parsed.activeId || migratedRoutes[0].id);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // No previous state - bootstrap with seed data from Excel
      }
      const seed = [
        {
          ...newRoute(1, 'KORIDOR 1E'),
          armada: 3, layover: 20, jamOps: 16.5,
          halte: [
            { id: 1, nama: 'Titik Awal - ASN 1', jarakKum: 0, dwell: 0, travelOverride: 0 },
            { id: 2, nama: 'Kemenko 3', jarakKum: 1.0, dwell: 0, travelOverride: 4 },
            { id: 3, nama: 'TKB / BI', jarakKum: 2.0, dwell: 0, travelOverride: 4 },
            { id: 4, nama: 'ASN 1 PC / Swissotel', jarakKum: 2.8, dwell: 0, travelOverride: 3 },
            { id: 5, nama: 'Kantor OIKN', jarakKum: 3.8, dwell: 0, travelOverride: 4 },
            { id: 6, nama: 'Kemenkes', jarakKum: 4.8, dwell: 0, travelOverride: 4 },
            { id: 7, nama: 'Qubika', jarakKum: 5.6, dwell: 0, travelOverride: 3 },
            { id: 8, nama: 'Titik Akhir - ASN 1', jarakKum: 6.357, dwell: 0, travelOverride: 3 },
          ],
        },
        {
          ...newRoute(2, 'KORIDOR 2'),
          armada: 3, layover: 11, jamOps: 8,
          halte: [
            { id: 1, nama: 'Terminal Awal - Rest Area', jarakKum: 0, dwell: 0, travelOverride: 0 },
            { id: 2, nama: 'Kemenkes', jarakKum: 2.0, dwell: 0, travelOverride: 8 },
            { id: 3, nama: 'Menara Pandang', jarakKum: 3.5, dwell: 0, travelOverride: 4 },
            { id: 4, nama: 'Kemenko 3', jarakKum: 4.5, dwell: 0, travelOverride: 3 },
            { id: 5, nama: 'TKB / BI', jarakKum: 5.5, dwell: 0, travelOverride: 4 },
            { id: 6, nama: 'ASN 1 PC / Swissotel', jarakKum: 6.5, dwell: 0, travelOverride: 3 },
            { id: 7, nama: 'Kantor OIKN', jarakKum: 7.7, dwell: 0, travelOverride: 4 },
            { id: 8, nama: 'Terminal Akhir - Rest Area', jarakKum: 9.7, dwell: 0, travelOverride: 8 },
          ],
        },
        {
          ...newRoute(3, 'KORIDOR 3'),
          armada: 4, layover: 5, jamOps: 8,
          halte: [
            { id: 1, nama: 'Terminal Awal', jarakKum: 0, dwell: 0, travelOverride: 0 },
            { id: 2, nama: 'Terminal Akhir', jarakKum: 10, dwell: 0, travelOverride: 20 },
          ],
        },
      ];
      setRoutes(seed.map(migrateRouteSisipan));
      setActiveId(2);
      setLoading(false);
    })();
  }, []);

  // Auto-save on state changes (debounced)
  useEffect(() => {
    if (loading || routes.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify({ routes, activeId }));
      } catch (e) {
        console.error('Save failed', e);
      }
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [routes, activeId, loading]);

  const activeRoute = routes.find(r => r.id === activeId);
  const updateActiveRoute = useCallback((next) => {
    // Auto-sync armadaPeriode = route.armada for ALL active periodes
    // (single source of truth: route.armada drives all per-periode armada values)
    const armadaTotal = Number(next.armada) || 0;
    const syncedPeriode = (next.periode || []).map(p => ({
      ...p,
      armadaPeriode: (p.on && p.kategori !== 'Tutup') ? armadaTotal : 0,
    }));
    // Auto-derive jamOps from active periodes (single source of truth)
    const activePeriodes = syncedPeriode.filter(p => p.on && p.kategori !== 'Tutup');
    const computeJamOps = (periodes) => {
      if (!periodes.length) return 0;
      const total = periodes.reduce((sum, p) => sum + (Number(p.durasi) || 0), 0);
      return Math.round(total * 10) / 10; // round to 1 decimal
    };
    const computedJamOps = computeJamOps(activePeriodes);
    const finalNext = {
      ...next,
      periode: syncedPeriode,
      jamOps: computedJamOps > 0 ? computedJamOps : next.jamOps,
    };
    setRoutes(prev => prev.map(r => r.id === activeId ? finalNext : r));
  }, [activeId]);

  const addRoute = () => {
    if (!newRouteName.trim()) return;
    const nextId = Math.max(0, ...routes.map(r => r.id)) + 1;
    const fresh = migrateRouteSisipan(newRoute(nextId, newRouteName.trim()));
    setRoutes([...routes, fresh]);
    setActiveId(nextId);
    setNewRouteName('');
    setShowAddRoute(false);
    setTab('konfigurasi');
  };

  const deleteRoute = (id) => {
    if (routes.length <= 1) {
      alert('Minimal harus ada 1 rute.');
      return;
    }
    if (!confirm(`Hapus rute "${routes.find(r => r.id === id)?.nama}"?`)) return;
    const next = routes.filter(r => r.id !== id);
    setRoutes(next);
    if (id === activeId) setActiveId(next[0].id);
  };

  const duplicateRoute = (id) => {
    const src = routes.find(r => r.id === id);
    if (!src) return;
    const nextId = Math.max(0, ...routes.map(r => r.id)) + 1;
    const dup = JSON.parse(JSON.stringify(src));
    dup.id = nextId;
    dup.nama = `${src.nama} (Copy)`;
    dup.optimasi = null;
    setRoutes([...routes, migrateRouteSisipan(dup)]);
    setActiveId(nextId);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ routes, activeId, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transitoptima-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: TOKENS.bg, color: TOKENS.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: TOKENS.brand, color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Bus className="w-5 h-5" />
          </div>
          <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Memuat TransitOptima…</div>
        </div>
      </div>
    );
  }

  // Tab grouping for sidebar
  const navGroups = [
    {
      label: 'Workspace',
      featured: true,
      items: [
        { key: 'jadwal', label: 'Penjadwalan', desc: 'Command center utama · semua tools tersedia inline' },
      ],
    },
  ];

  const tabMeta = {};

  const isMainPage = tab === 'jadwal';
  const meta = tabMeta[tab];

  return (
    <div style={{ minHeight: '100vh', background: TOKENS.bg, color: TOKENS.textPrimary, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      {/* TOP HEADER (slim, professional) */}
      <header style={{ background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.border}`, position: 'sticky', top: 0, zIndex: 20 }}>
        <div className="flex items-center justify-between" style={{ padding: '10px 20px' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, borderRadius: 7, background: TOKENS.brand, color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bus size={17} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TOKENS.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.1 }}>TransitOptima</div>
              <div style={{ fontSize: 10.5, color: TOKENS.textMuted, marginTop: 1 }}>Bus Headway Planning System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ fontSize: 11, color: TOKENS.textMuted }}>
              {routes.length} rute terdaftar
            </div>
            <button
              onClick={exportData}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 500, color: TOKENS.textSecondary,
                background: TOKENS.surface, border: `1px solid ${TOKENS.border}`,
                padding: '5px 11px', borderRadius: 6, cursor: 'pointer',
              }}
            >
              <Download size={12} /> Export
            </button>
          </div>
        </div>
      </header>

      <div className="flex" style={{ minHeight: 'calc(100vh - 53px)' }}>
        {/* SIDEBAR */}
        <aside style={{ width: 256, background: TOKENS.surface, borderRight: `1px solid ${TOKENS.border}`, padding: '20px 0', flexShrink: 0 }}>
          {/* Route selector */}
          <div className="px-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Rute Terdaftar</span>
              <button
                onClick={() => setShowAddRoute(true)}
                style={{ width: 20, height: 20, borderRadius: 5, background: 'transparent', border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Tambah rute baru"
              >
                <Plus size={11} />
              </button>
            </div>
            <div className="space-y-1">
              {routes.map(r => {
                const rm = calcMetrics(r);
                const isActive = r.id === activeId;
                const headwayColor = rm.statusHeadway?.label === 'BAIK' ? '#059669' : rm.statusHeadway?.label === 'STANDAR' ? '#D97706' : '#DC2626';
                return (
                  <div
                    key={r.id}
                    onClick={() => setActiveId(r.id)}
                    style={{
                      padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                      background: isActive ? TOKENS.brandTint : 'transparent',
                      border: `1px solid ${isActive ? '#A7F3D0' : 'transparent'}`,
                    }}
                    className="group"
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: isActive ? TOKENS.brandStrong : TOKENS.textPrimary }}>{r.nama}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={(e) => { e.stopPropagation(); duplicateRoute(r.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TOKENS.textMuted, padding: 0 }} title="Duplikat">
                          <Copy size={11} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteRoute(r.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TOKENS.textMuted, padding: 0 }} title="Hapus">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5" style={{ fontSize: 10.5, color: TOKENS.textMuted }}>
                      <span>{r.armada} bus</span>
                      <span style={{ color: TOKENS.borderStrong }}>·</span>
                      <span>{fmtNum(rm.jarakPerArah, 1)} km</span>
                      <span style={{ color: TOKENS.borderStrong }}>·</span>
                      <span style={{ color: headwayColor, fontWeight: 600 }}>H{fmtNum(rm.headway, 0)}m</span>
                      {r.optimasi && <span style={{ background: '#EDE9FE', color: '#5B21B6', padding: '0 5px', borderRadius: 3, fontSize: 9, fontWeight: 600, marginLeft: 'auto' }}>OPT</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {showAddRoute && (
              <div className="mt-2" style={{ background: TOKENS.surfaceMuted, border: `1px solid ${TOKENS.border}`, borderRadius: 6, padding: 8 }}>
                <input
                  autoFocus
                  type="text"
                  value={newRouteName}
                  onChange={e => setNewRouteName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addRoute(); if (e.key === 'Escape') setShowAddRoute(false); }}
                  placeholder="Nama rute baru…"
                  style={{ width: '100%', background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 4, padding: '5px 8px', fontSize: 12, color: TOKENS.textPrimary, marginBottom: 6, outline: 'none' }}
                />
                <div className="flex gap-1">
                  <button
                    onClick={addRoute}
                    style={{ background: TOKENS.brand, color: '#FFFFFF', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Tambah
                  </button>
                  <button
                    onClick={() => { setShowAddRoute(false); setNewRouteName(''); }}
                    style={{ background: 'transparent', color: TOKENS.textMuted, border: `1px solid ${TOKENS.border}`, borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation groups */}
          {navGroups.map(g => (
            <div key={g.label} className="mb-4">
              <div className="px-4 mb-2">
                <span style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{g.label}</span>
              </div>
              <div>
                {g.items.map(item => {
                  const isActive = tab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setTab(item.key)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '7px 16px',
                        background: isActive ? TOKENS.brandTint : 'transparent',
                        borderLeft: `3px solid ${isActive ? TOKENS.brand : 'transparent'}`,
                        color: isActive ? TOKENS.brandStrong : TOKENS.textSecondary,
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        border: 'none',
                        borderLeftWidth: 3,
                        borderLeftStyle: 'solid',
                        borderLeftColor: isActive ? TOKENS.brand : 'transparent',
                      }}
                      className="hover:bg-zinc-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span>{item.label}</span>
                        {item.key === 'optimasi' && activeRoute?.optimasi && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED' }} />
                        )}
                      </div>
                      {item.desc && (
                        <div style={{ fontSize: 10.5, color: isActive ? TOKENS.brand : TOKENS.textMuted, fontWeight: 400, marginTop: 1 }}>
                          {item.desc}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Glosarium at bottom */}
          <div className="mt-6 mx-4 pt-4" style={{ borderTop: `1px solid ${TOKENS.border}` }}>
            <div style={{ fontSize: 10, color: TOKENS.textMuted, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Glosarium</div>
            <div className="space-y-1.5" style={{ fontSize: 10.5, color: TOKENS.textMuted, lineHeight: 1.5 }}>
              <div><strong style={{ color: TOKENS.textSecondary }}>Headway</strong> jeda antar bus = Cycle ÷ Armada</div>
              <div><strong style={{ color: TOKENS.textSecondary }}>Cycle</strong> RTT + Layover Total</div>
              <div><strong style={{ color: TOKENS.textSecondary }}>RIT</strong> 1 putaran dispatch lengkap (Bus#1→#n→#1)</div>
              <div><strong style={{ color: TOKENS.textSecondary }}>Armada Window</strong> blok waktu dgn jumlah armada konstan</div>
              <div><strong style={{ color: TOKENS.textSecondary }}>Layover</strong> waktu istirahat di terminal</div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {!activeRoute ? (
            <div className="p-7">
              <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 8, padding: 32, textAlign: 'center', color: TOKENS.textMuted }}>
                Pilih rute di sidebar atau tambah rute baru.
              </div>
            </div>
          ) : (
            <TabJadwalOps
              route={activeRoute}
              updateRoute={updateActiveRoute}
              routes={routes}
              activeId={activeId}
            />
          )}
        </main>
      </div>
    </div>
  );
}

