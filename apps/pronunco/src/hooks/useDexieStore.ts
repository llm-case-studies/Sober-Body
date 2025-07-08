import { useEffect, useState } from 'react';
import type { Table } from 'dexie';

export default function useDexieStore<T>(table: Table<T, any>) {
  const [rows, setRows] = useState<T[]>([]);
  useEffect(() => {
    let alive = true;
    table.toArray().then(r => { if (alive) setRows(r); });
    return () => { alive = false; };
  }, [table]);
  return rows;
}
