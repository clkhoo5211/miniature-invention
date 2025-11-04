export interface IpnsPublishResult {
  cid: string;
  ipnsName: string;
}

async function kuboAdd(apiUrl: string, content: Blob): Promise<string> {
  const form = new FormData();
  form.append('file', content, 'build.tar.gz');
  const res = await fetch(`${apiUrl}/api/v0/add?pin=true`, { method: 'POST', body: form });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`IPFS add failed: ${res.status} - ${errorText}`);
  }
  const text = await res.text();
  const lines = text.split('\n').filter(Boolean);
  const line = lines[lines.length - 1] || '{}';
  const json = JSON.parse(line);
  if (!json.Hash) {
    throw new Error('IPFS add did not return a Hash');
  }
  return json.Hash as string;
}

async function kuboIpnsPublish(apiUrl: string, cid: string, key = 'self'): Promise<string> {
  const url = `${apiUrl}/api/v0/name/publish?arg=${encodeURIComponent(`/ipfs/${cid}`)}&key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`IPNS publish failed: ${res.status} - ${errorText}`);
  }
  const json = await res.json();
  if (!json.Name) {
    throw new Error('IPNS publish did not return a Name');
  }
  return json.Name as string;
}

export async function publishToIpns(
  buildTarGz: Blob,
  options: { kuboApiUrl: string; keyName?: string }
): Promise<IpnsPublishResult> {
  const cid = await kuboAdd(options.kuboApiUrl, buildTarGz);
  const ipnsName = await kuboIpnsPublish(options.kuboApiUrl, cid, options.keyName);
  return { cid, ipnsName };
}
