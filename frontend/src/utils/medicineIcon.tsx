// Returns a styled div with an emoji + colour representing a medicine category.
// Use this instead of <img> so no image uploads are ever needed.

const CATEGORY_MAP: Record<string, { emoji: string; bg: string; color: string }> = {
  antibiotic:    { emoji: '🦠', bg: '#FEE2E2', color: '#DC2626' },
  painkiller:    { emoji: '💊', bg: '#FEF3C7', color: '#D97706' },
  antifungal:    { emoji: '🍄', bg: '#F3E8FF', color: '#7C3AED' },
  antacid:       { emoji: '🧪', bg: '#DCFCE7', color: '#16A34A' },
  respiratory:   { emoji: '🌬️', bg: '#DBEAFE', color: '#2563EB' },
  antihistamine: { emoji: '🤧', bg: '#FCE7F3', color: '#DB2777' },
  diabetes:      { emoji: '🩸', bg: '#FEE2E2', color: '#DC2626' },
  hypertension:  { emoji: '❤️', bg: '#FEE2E2', color: '#DC2626' },
  cholesterol:   { emoji: '🫀', bg: '#DBEAFE', color: '#2563EB' },
  antimalarial:  { emoji: '🦟', bg: '#DCFCE7', color: '#16A34A' },
  vitamin:       { emoji: '✨', bg: '#FEF3C7', color: '#D97706' },
  supplement:    { emoji: '💪', bg: '#FEF3C7', color: '#D97706' },
  cream:         { emoji: '🧴', bg: '#F0FDF4', color: '#15803D' },
  inhaler:       { emoji: '💨', bg: '#DBEAFE', color: '#2563EB' },
  syrup:         { emoji: '🍯', bg: '#FEF9C3', color: '#CA8A04' },
  injection:     { emoji: '💉', bg: '#F0F9FF', color: '#0284C7' },
};

const DEFAULT = { emoji: '💊', bg: '#F1F5F9', color: '#64748B' };

function getStyle(category?: string | null, name?: string | null) {
  const key = (category || name || '').toLowerCase().trim();
  for (const [k, v] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(k)) return v;
  }
  return DEFAULT;
}

interface MedicineIconProps {
  category?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  borderRadius?: number;
}

export function MedicineIcon({ category, name, imageUrl, size = 44, borderRadius = 12 }: MedicineIconProps) {
  const style = getStyle(category, name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || ''}
        style={{ width: size, height: size, borderRadius, objectFit: 'cover', flexShrink: 0 }}
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius, flexShrink: 0,
      background: style.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.45,
    }}>
      {style.emoji}
    </div>
  );
}
