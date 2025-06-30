export interface Sig {
  signer: string;           // e.g. "Sober-Body"
  alg: 'ed25519';
  value: string;            // base64
}

export interface Deck {
  id: string;
  title: string;
  lang: string;             // BCP-47
  lines: string[];
  tags?: string[];          // NEW  e.g. ["topic:groceries", "official"]
  sig?: Sig;                // NEW  optional
  updated?: number;
}
