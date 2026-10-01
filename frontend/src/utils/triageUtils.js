export const getTriageBadgeStyle = (priority, esiScore) => {
  switch (priority) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/40',
        text: 'text-rose-400',
        dot: 'bg-rose-500 animate-ping',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
        label: `ESI ${esiScore || 1} • CRITICAL`,
      };
    case 'URGENT':
      return {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
        label: `ESI ${esiScore || 2} • URGENT`,
      };
    case 'SEMI_URGENT':
      return {
        bg: 'bg-blue-500/15',
        border: 'border-blue-500/40',
        text: 'text-blue-400',
        dot: 'bg-blue-500',
        glow: 'shadow-[0_0_12px_rgba(59,130,246,0.25)]',
        label: `ESI ${esiScore || 3} • SEMI-URGENT`,
      };
    case 'STABLE':
    default:
      return {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
        label: `ESI ${esiScore || 4} • STABLE`,
      };
  }
};

export const getWardColor = (ward) => {
  switch (ward) {
    case 'ICU':
      return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    case 'Emergency':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'Cardiology':
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    case 'General':
    default:
      return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
  }
};
