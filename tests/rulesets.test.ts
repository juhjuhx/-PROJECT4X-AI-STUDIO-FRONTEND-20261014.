import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { stableStringify } from '../src/core/game';
import { UNIT_STATS, TECH_STATS } from '../src/core/types';
import { getRuleset, validateRuleset } from '../src/core/rulesets';

test('固定 bundle 隔離 G1 與預覽內容，內容 hash 綁定所有定義', () => {
  const g1 = getRuleset('g1-ccts-1'), preview = getRuleset('demo03-preview-1');
  assert.deepEqual(g1.units.map(u => u.id), ['infantry', 'scout', 'archer']);
  assert.deepEqual(g1.technologies.map(t => t.id), ['farm', 'archery', 'pathfinding']);
  assert.equal(g1.units.some(u => u.id === 'shieldGuard'), false);
  assert.deepEqual(preview.units.map(u => u.id), ['infantry', 'scout', 'archer', 'shieldGuard', 'mobileScout']);
  const guard = preview.units.find(u => u.id === 'shieldGuard')!;
  assert.deepEqual([guard.cost, guard.hp, guard.attack, guard.defense, guard.range, guard.move, guard.sight], [6,10,3,2,1,1,2]);
  assert.deepEqual(preview.technologies.find(t => t.id === 'militaryMobility')?.prerequisites, ['pathfinding']);
  for (const definition of [g1, preview]) {
    validateRuleset(definition);
    const { contentHash, ...content } = definition;
    assert.equal(contentHash, createHash('sha256').update(stableStringify(content)).digest('hex'));
    for (const unit of definition.units.slice(0,3)) {
      const { id, visual: _visual, role: _role, ...stats } = unit;
      assert.deepEqual(stats, UNIT_STATS[id as keyof typeof UNIT_STATS]);
    }
    for (const tech of definition.technologies.slice(0,3)) {
      const { id, effects: _effects, prerequisites: _prerequisites, ...stats } = tech;
      assert.deepEqual(stats, TECH_STATS[id as keyof typeof TECH_STATS]);
    }
  }
});

test('不可變 bundle、不認未知/prototype ID，呼叫者無法改下局規則', () => {
  const definition = getRuleset('demo03-preview-1');
  assert.throws(() => { (definition.units[0] as { cost: number }).cost = 0; }, TypeError);
  assert.throws(() => { (definition.technologies[4].prerequisites as string[]).push('farm'); }, TypeError);
  assert.equal(getRuleset('demo03-preview-1').units[0].cost, 4);
  for (const id of ['unknown', 'constructor', '__proto__', '']) assert.throws(() => getRuleset(id), /ruleset/);
});

test('內容 validator 拒絕重複 ID、失效引用、循環、非法效果、素材與數值', () => {
  const mutations: ((v: any) => void)[] = [
    v => v.units.push(structuredClone(v.units[0])),
    v => v.technologies.push(structuredClone(v.technologies[0])),
    v => v.technologies[4].prerequisites.push('missing'),
    v => { v.technologies[2].prerequisites = ['militaryMobility']; },
    v => { v.technologies[1].effects[0].unit = 'missing'; },
    v => { v.technologies[0].effects = [{ type: 'win' }]; },
    v => { v.technologies[2].effects[0].amount = Infinity; },
    v => { delete v.units[3].visual.fallback; },
    v => { v.units[3].visual.fallback = '../hidden'; },
    v => { v.units[3].move = 1.5; },
    v => { v.units[3].hp = 0; },
    v => { v.technologies[3].cost = -1; },
    v => { v.namespace = '__proto__'; },
    v => { v.extra = true; },
  ];
  for (const mutate of mutations) {
    const value = structuredClone(getRuleset('demo03-preview-1')); mutate(value);
    const before = structuredClone(value);
    assert.throws(() => validateRuleset(value), /定義無效/);
    assert.deepEqual(value, before, '驗證不能修正或偷偷改輸入');
  }
});
