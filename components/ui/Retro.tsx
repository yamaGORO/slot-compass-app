import Link from 'next/link';
import { cn } from '@/lib/utils';

type RetroCommand = {
  href?: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function RetroPage({
  children,
  reportTitle = '期待値報告書',
  brandTitle = 'SLOT COMPASS',
  systemLabel = 'VALUE REPORT SYSTEM',
  commands,
  message,
}: {
  children: React.ReactNode;
  reportTitle?: string;
  brandTitle?: string;
  systemLabel?: string;
  commands?: RetroCommand[];
  message?: React.ReactNode;
}) {
  return (
    <div className="retro-screen px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-[960px] space-y-3 pb-24">
        <RetroHeader
          reportTitle={reportTitle}
          brandTitle={brandTitle}
          systemLabel={systemLabel}
          commands={commands}
        />
        {children}
        {message && <RetroMessage>{message}</RetroMessage>}
      </div>
    </div>
  );
}

export function RetroHeader({
  reportTitle,
  brandTitle,
  systemLabel,
  commands,
}: {
  reportTitle: string;
  brandTitle: string;
  systemLabel: string;
  commands?: RetroCommand[];
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-start">
      <div className="retro-frame retro-frame-compact">
        <div className="retro-panel-body px-3 py-3">
          <p className="retro-title text-[15px] sm:text-[18px]">{brandTitle}</p>
          <p className="retro-label mt-1">{systemLabel}</p>
        </div>
      </div>
      <div className="space-y-2 min-w-[132px]">
        <div className="retro-frame retro-frame-compact">
          <div className="retro-panel-body px-3 py-2 text-center">
            <p className="retro-title">{reportTitle}</p>
          </div>
        </div>
        {commands && commands.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {commands.map((command) => (
              command.href ? (
                <Link key={command.label} href={command.href} className="retro-command text-center">
                  {command.label}
                </Link>
              ) : (
                <button
                  key={command.label}
                  type="button"
                  onClick={command.onClick}
                  disabled={command.disabled}
                  className="retro-command"
                >
                  {command.label}
                </button>
              )
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export function RetroPanel({
  title,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('retro-frame', className)}>
      <div className={cn('retro-panel-body', bodyClassName)}>
        {title && <h2 className="retro-title mb-3">{title}</h2>}
        {children}
      </div>
    </section>
  );
}

export function RetroDataRow({
  label,
  children,
  description,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="retro-row py-2">
      <div className="min-w-0">
        <p className="retro-label">{label}</p>
        {description && <p className="mt-1 text-[9px] leading-tight text-[#9fb0dd] retro-text">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function RetroInput({
  value,
  onChange,
  unit,
  type = 'text',
  inputMode = 'text',
  ariaLabel,
  placeholder = '',
}: {
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  type?: 'text' | 'password';
  inputMode?: 'text' | 'numeric' | 'decimal';
  ariaLabel: string;
  placeholder?: string;
}) {
  return (
    <div className="retro-input-shell">
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="retro-input"
        aria-label={ariaLabel}
      />
      {unit && <span className="retro-label text-[11px]">{unit}</span>}
    </div>
  );
}

export function RetroSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="retro-input-shell">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="retro-select appearance-none"
        aria-label={ariaLabel}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="retro-label">▼</span>
    </div>
  );
}

export function RetroMetric({
  label,
  value,
  unit,
  tone = 'normal',
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: 'normal' | 'accent' | 'danger';
}) {
  const color = tone === 'accent' ? 'text-[#ffe17b]' : tone === 'danger' ? 'text-[#ff8c8c]' : 'text-white';

  return (
    <div className="retro-frame retro-frame-compact">
      <div className="retro-panel-body px-3 py-3 text-center">
        <p className="retro-label">{label}</p>
        <p className={cn('retro-value mt-2 break-words text-xl leading-tight', color)}>
          {value}
          {unit && <span className="ml-1 text-xs">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export function RetroMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="retro-message">
      <div className="px-4 py-4 text-[12px] font-bold leading-relaxed retro-text text-white">
        {children}
      </div>
    </div>
  );
}

export function RetroButton({
  children,
  onClick,
  disabled,
  className,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn('retro-command', className)}>
      {children}
    </button>
  );
}
