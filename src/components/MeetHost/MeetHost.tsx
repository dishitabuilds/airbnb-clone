import type { ComponentType } from 'react';

import type { Host } from '@/lib/types';
import * as icons from '@/components/icons';
import type { IconProps } from '@/components/icons';
import { Accuracy, Shield } from '@/components/icons';
import styles from './MeetHost.module.css';

/** `Host.facts[].icon` names an export of `icons.tsx` ("BornIn", "School"). */
function resolveIcon(name: string): ComponentType<IconProps> | null {
  const glyph = (icons as Record<string, unknown>)[name];
  return typeof glyph === 'function' ? (glyph as ComponentType<IconProps>) : null;
}

/**
 * Co-hosts without a photo get a lettered disc. The capture tints them from a
 * two-colour rota — pink for the first, blue for the second — so the tint is
 * chosen by position among the lettered discs, not by the letter itself.
 */
const INITIAL_TINTS = [styles.initialPink, styles.initialBlue];

/** Reviews read "1,463" in the capture; pin the locale so SSR and client agree. */
const NUMBER = new Intl.NumberFormat('en-US');

/**
 * "Meet your host": a bordered profile card plus the host facts on the left, and
 * co-hosts, host details and the payment-safety note on the right.
 */
export function MeetHost({ host }: { host: Host }) {
  let letteredSoFar = 0;

  return (
    <section className={styles.meetHost}>
      <h2 className={styles.title}>Meet your host</h2>

      <div className={styles.layout}>
        {/* Left grid cell: the bordered card, with the host facts beneath it. */}
        <div>
          <div className={styles.card}>
            <div className={styles.identity}>
              <div className={styles.avatar}>
                {/* The host name sits directly beneath, so the photo is decorative. */}
                <img src={host.avatar} alt="" width={88} height={88} />
                <span className={styles.verified}>
                  <Accuracy size={24} />
                </span>
              </div>
              <div className={styles.name}>{host.name}</div>
              <div className={styles.role}>{host.role}</div>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>{NUMBER.format(host.reviews)}</div>
                <div className={styles.statLabel}>Reviews</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>{host.rating}&#9733;</div>
                <div className={styles.statLabel}>Rating</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>{host.yearsHosting}</div>
                <div className={styles.statLabel}>Years hosting</div>
              </div>
            </div>
          </div>

          <ul className={styles.facts}>
            {host.facts.map((fact) => {
              const Icon = resolveIcon(fact.icon);

              return (
                <li className={styles.fact} key={fact.text}>
                  {Icon ? <Icon size={24} /> : null}
                  {fact.text}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right grid cell. */}
        <div>
          <h3 className={styles.subheading}>Co-Hosts</h3>

          <ul className={styles.coHosts}>
            {host.coHosts.map((coHost) => (
              <li className={styles.coHost} key={coHost.name}>
                {coHost.avatar ? (
                  <img
                    className={styles.coHostAvatar}
                    src={coHost.avatar}
                    alt=""
                    width={34}
                    height={34}
                  />
                ) : (
                  <span
                    className={`${styles.initial} ${
                      INITIAL_TINTS[letteredSoFar++ % INITIAL_TINTS.length]
                    }`}
                    aria-hidden="true"
                  >
                    {coHost.name.charAt(0)}
                  </span>
                )}
                <span>{coHost.name}</span>
              </li>
            ))}
          </ul>

          <h3 className={styles.subheading}>Host details</h3>

          <p className={styles.hostDetails}>
            {host.responseRate}
            <br />
            {host.responseTime}
          </p>

          <button className={styles.messageHost} type="button">
            Message host
          </button>

          <p className={styles.protection}>
            <Shield size={24} className={styles.protectionIcon} />
            <span>
              To help protect your payment, always use Airbnb to send money and communicate
              with hosts.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
