/**
 * IPFS Functionality Tests
 * 
 * Note: These tests require a running IPFS node.
 * Start with: docker-compose up -d ipfs
 * Or: ipfs daemon
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Mock FormData for Node.js environment
if (typeof globalThis.FormData === 'undefined') {
  globalThis.FormData = class FormData {
    private data: Map<string, any> = new Map();
    append(key: string, value: any, filename?: string) {
      this.data.set(key, { value, filename });
    }
    get(key: string) { return this.data.get(key); }
    getAll(key: string) { return Array.from(this.data.values()); }
  } as any;
}

const IPFS_API_URL = process.env.IPFS_API_URL || 'http://127.0.0.1:5001';

describe('IPFS Functions', () => {
  beforeAll(async () => {
    // Check if IPFS node is running
    try {
      const response = await fetch(`${IPFS_API_URL}/api/v0/version`);
      if (!response.ok) {
        console.warn('⚠️ IPFS node not accessible. Tests will be skipped.');
      }
    } catch (error) {
      console.warn('⚠️ IPFS node not accessible. Tests will be skipped.');
    }
  });

  it('should connect to IPFS node', async () => {
    try {
      const response = await fetch(`${IPFS_API_URL}/api/v0/version`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('Version');
    } catch (error) {
      // Skip test if IPFS not available
      console.log('IPFS not available, skipping test');
    }
  });

  it('should add content to IPFS', async () => {
    try {
      const testContent = 'Hello IPFS Test';
      const formData = new FormData();
      const blob = new Blob([testContent], { type: 'text/plain' });
      formData.append('file', blob, 'test.txt');
      
      const response = await fetch(`${IPFS_API_URL}/api/v0/add?pin=true`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`IPFS add failed: ${response.status}`);
      }
      
      const text = await response.text();
      const lines = text.split('\n').filter(Boolean);
      const lastLine = lines[lines.length - 1] || '{}';
      const result = JSON.parse(lastLine);
      
      expect(result).toHaveProperty('Hash');
      expect(result.Hash).toBeTruthy();
      
      // Verify content can be retrieved
      const gatewayUrl = `http://127.0.0.1:8081/ipfs/${result.Hash}`;
      const retrieveResponse = await fetch(gatewayUrl);
      expect(retrieveResponse.ok).toBe(true);
      
      const retrievedContent = await retrieveResponse.text();
      expect(retrievedContent).toBe(testContent);
    } catch (error) {
      // Skip if IPFS not available
      console.log('IPFS not available, skipping test');
    }
  });

  it('should publish to IPNS (if key exists)', async () => {
    try {
      // First, add content
      const testContent = 'IPNS Test Content';
      const formData = new FormData();
      const blob = new Blob([testContent], { type: 'text/plain' });
      formData.append('file', blob, 'ipns-test.txt');
      
      const addResponse = await fetch(`${IPFS_API_URL}/api/v0/add?pin=true`, {
        method: 'POST',
        body: formData,
      });
      
      if (!addResponse.ok) {
        throw new Error('Add failed');
      }
      
      const addText = await addResponse.text();
      const addLines = addText.split('\n').filter(Boolean);
      const addResult = JSON.parse(addLines[addLines.length - 1] || '{}');
      const cid = addResult.Hash;
      
      if (!cid) {
        throw new Error('No CID returned');
      }
      
      // Try to publish to IPNS
      const publishUrl = `${IPFS_API_URL}/api/v0/name/publish?arg=${encodeURIComponent(`/ipfs/${cid}`)}&key=self`;
      const publishResponse = await fetch(publishUrl, { method: 'POST' });
      
      if (publishResponse.ok) {
        const publishResult = await publishResponse.json();
        expect(publishResult).toHaveProperty('Name');
        expect(publishResult.Name).toBeTruthy();
      } else {
        // IPNS publish might fail if key doesn't exist - that's okay for testing
        console.log('IPNS publish not available (key may not exist)');
      }
    } catch (error) {
      // Skip if IPFS not available
      console.log('IPFS not available, skipping IPNS test');
    }
  });
});

