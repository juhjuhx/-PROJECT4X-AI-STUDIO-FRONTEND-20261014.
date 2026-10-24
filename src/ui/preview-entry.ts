import type { RulesetId } from '../core/rulesets';

export function entryRuleset(search: string): RulesetId {
  return new URLSearchParams(search).get('preview') === 'demo03' ? 'demo03-preview-1' : 'g1-ccts-1';
}
export function storageKeys(ruleset: string): Readonly<{save: string; progress: string}> {
  if (ruleset === 'g1-ccts-1') return {save:'project4x-save-1',progress:'project4x-demo-progress-1'};
  if (ruleset === 'demo03-preview-1') return {save:'project4x-demo03-preview-save-2',progress:'project4x-demo03-preview-progress-1'};
  throw new Error('不支援的保存版本');
}
