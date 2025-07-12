import html2canvas from 'html2canvas';

export async function makeShareCard(score: number, title: string) {
  const node = document.getElementById('share-card-template')!;
  node.querySelector('.phrase')!.textContent = title;
  node.querySelector('.score')!.textContent  = `${score.toFixed(0)}/100`;

  const canvas = await html2canvas(node, { backgroundColor: '#F3F4F6' });
  return await new Promise<Blob>(r => canvas.toBlob(b => r(b!), 'image/png'));
}
