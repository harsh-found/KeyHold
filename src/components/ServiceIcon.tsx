import { useState } from 'react';
import type { Account } from '../lib/types';
import { faviconFor, initials, tint } from '../lib/utils';

export function ServiceIcon({ account, size = 44 }: { account: Pick<Account, 'service' | 'url' | 'iconUrl'>; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = faviconFor(account);
  const showImg = src && !failed;
  const bg = tint(account.service || 'x');
  return (
    <div
      className="relative shrink-0 grid place-items-center overflow-hidden rounded-xl border border-line"
      style={{ width: size, height: size, background: showImg ? 'var(--card)' : bg }}
    >
      {showImg ? (
        <img
          src={src!}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain p-1.5"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <span className="font-display font-semibold text-white" style={{ fontSize: size * 0.4 }}>
          {initials(account.service)}
        </span>
      )}
    </div>
  );
}
