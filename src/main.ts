import './styles.css';
import { createGameSession } from './session/game-session';
import type { DeepReadonly } from './session/contracts';
import { getRuleset, technologyDefinition, unitDefinition } from './core/rulesets';
import { entryRuleset, storageKeys } from './ui/preview-entry';
import type { Action, KnownTile, Point, Tech, UnitKind } from './core/types';
import { WorldMap } from './ui/map';
import { recruitmentStatus } from './ui/recruitment';
import { createDemoShell } from './demo/shell';
import { bindProgressToSave, readBoundProgress } from './demo/local-progress';

const HUMAN = 0;
const initialRuleset = entryRuleset(window.location.search);
const nextRulesetLabel = initialRuleset === 'demo03-preview-1' ? 'Demo03隔離預覽' : 'G1既有規則';
const currentStorage = () => storageKeys(gameplay.getObservation().ruleset);
const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const requestSession = crypto.randomUUID();
const { gameplay, files, dispose } = createGameSession({ seed: '霧境初航-01', ruleset: initialRuleset, reducedMotion });
let view = gameplay.getObservation();
let selection: Point | null = null;
let selectedUnitId: string | null = null;
let requestNumber = 0;
let lastFocus: HTMLElement | null = null;
const journey: string[] = ['第一幅地圖已展開。選取斥候，向金色邊線的格子出發。'];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label: string, onClick: () => void, className = ''): HTMLButtonElement {
  const node = el('button', className, label);
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

function section(title: string, className = ''): { node: HTMLElement; body: HTMLDivElement } {
  const node = el('section', `panel-section ${className}`);
  node.append(el('h2', '', title));
  const body = el('div');
  node.append(body);
  return { node, body };
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function notify(message: string, isError = false): void {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('is-error', isError);
  if (recordDialog.open) {
    recordFeedback.textContent = message;
    recordFeedback.classList.toggle('is-error', isError);
  }
  if (!isError) {
    journey.unshift(message);
    journey.splice(6);
    renderJourney();
  }
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('找不到遊戲容器。');
const shell = el('div', 'game-shell');
const header = el('header', 'game-header');
const brand = el('div', 'brand');
const brandSeal = el('div', 'brand-seal', '4X');
brandSeal.setAttribute('aria-hidden', 'true');
const brandCopy = el('div');
brandCopy.append(el('h1', '', '霧境初航'), el('p', 'brand-subtitle', 'PROJECT-4X · 探索、征服與重建'));
brand.append(brandSeal, brandCopy);
const resources = el('div', 'resources');
const goldMetric = el('div', 'resource');
const goldValue = el('strong', 'resource-value');
goldMetric.append(el('span', 'resource-label', '金幣'), goldValue);
const incomeMetric = el('div', 'resource');
const incomeValue = el('strong', 'resource-value');
incomeMetric.append(el('span', 'resource-label', '下回合收入'), incomeValue);
const turnMetric = el('div', 'resource turn-resource');
const turnValue = el('strong', 'resource-value');
turnMetric.append(el('span', 'resource-label', '回合'), turnValue);
resources.append(goldMetric, incomeMetric, turnMetric);
const recordButton = button('航行紀錄', () => openDialog(recordDialog), 'header-button');
const helpButton = button('選單', () => demo.openMenu(), 'header-button');
const headerActions = el('div', 'header-actions');
headerActions.append(recordButton, helpButton);
header.append(brand, resources, headerActions);

const boardLayout = el('main', 'board-layout');
const board = el('section', 'board');
board.setAttribute('aria-label', '探索世界地圖');
const mapBar = el('div', 'map-bar');
const mapTitle = el('div', 'map-title');
const mapHeading = el('h2', '', '已知世界');
const exploredLabel = el('span', 'explored-label');
mapTitle.append(mapHeading, exploredLabel);
const mapControls = el('div', 'map-controls');
const zoomOut = button('−', () => map.zoomBy(1 / 1.25), 'icon-button');
zoomOut.setAttribute('aria-label', '縮小地圖');
zoomOut.title = '縮小地圖 (−)';
const zoomIn = button('+', () => map.zoomBy(1.25), 'icon-button');
zoomIn.setAttribute('aria-label', '放大地圖');
zoomIn.title = '放大地圖 (+)';
const homeButton = button('中心', () => inspectCenter());
homeButton.title = '返回中心 (Home)';
const overviewButton = button('全圖', () => map.overview());
overviewButton.title = '全圖總覽';
mapControls.append(zoomOut, zoomIn, homeButton, overviewButton);
mapBar.append(mapTitle, mapControls);
const canvasWrap = el('div', 'canvas-wrap');
const canvas = el('canvas', 'world-canvas');
canvas.tabIndex = 0;
canvas.setAttribute('role', 'application');
canvas.setAttribute('aria-label', '世界地圖。點選己方單位，再點金色移動格；拖曳平移、滾輪或雙指縮放。鍵盤 N 選下一單位、方向鍵選格、Enter 執行，E 結束回合。');
const mapCaption = el('div', 'map-caption');
const mapHint = el('span', '', '拖曳平移 · 滾輪／雙指縮放');
const coordinates = el('span', 'coordinates', '尚未選格');
mapCaption.append(mapHint, coordinates);
const winnerBanner = el('div', 'winner-banner');
winnerBanner.hidden = true;
canvasWrap.append(canvas, winnerBanner);
board.append(mapBar, canvasWrap, mapCaption);

const sidebar = el('aside', 'sidebar');
sidebar.setAttribute('aria-label', '城邦與行動');
sidebar.setAttribute('data-tab', 'inspect');

const deckNav = el('nav', 'deck-nav');
deckNav.setAttribute('role', 'tablist');
deckNav.setAttribute('aria-label', '指揮面板分頁');

const tabInspect = button('探險與部隊', () => switchTab('inspect'), 'deck-tab active');
tabInspect.setAttribute('role', 'tab');
tabInspect.setAttribute('aria-selected', 'true');
tabInspect.id = 'tab-inspect';

const tabTech = button('科技研發', () => switchTab('tech'), 'deck-tab');
tabTech.setAttribute('role', 'tab');
tabTech.setAttribute('aria-selected', 'false');
tabTech.id = 'tab-tech';

const tabJourney = button('城邦手札', () => switchTab('journey'), 'deck-tab');
tabJourney.setAttribute('role', 'tab');
tabJourney.setAttribute('aria-selected', 'false');
tabJourney.id = 'tab-journey';

deckNav.append(tabInspect, tabTech, tabJourney);

let activeTab: 'inspect' | 'tech' | 'journey' = 'inspect';

function switchTab(tab: 'inspect' | 'tech' | 'journey'): void {
  activeTab = tab;
  tabInspect.classList.toggle('active', tab === 'inspect');
  tabInspect.setAttribute('aria-selected', String(tab === 'inspect'));
  tabTech.classList.toggle('active', tab === 'tech');
  tabTech.setAttribute('aria-selected', String(tab === 'tech'));
  tabJourney.classList.toggle('active', tab === 'journey');
  tabJourney.setAttribute('aria-selected', String(tab === 'journey'));
  sidebar.setAttribute('data-tab', tab);
}

const factionPanel = section('曦原城邦', 'faction-panel');
const factionLife = el('span', 'life-tag');
const factionDescription = el('p', 'muted');
const factionNumbers = el('div', 'faction-numbers');
factionPanel.body.append(factionLife, factionDescription, factionNumbers);
const inspectPanel = section('探險隊', 'inspect-panel');
const unitPanel = section('部隊', 'unit-panel');
const unitHeading = unitPanel.node.querySelector('h2')!;
const nextUnitButton = button('下一支部隊  N', () => selectNextUnit(), 'small-button');
unitHeading.append(nextUnitButton);
const techPanel = section('知識', 'tech-panel');
const journeyPanel = section('航行手札', 'journey-panel');
sidebar.append(deckNav, inspectPanel.node, unitPanel.node, techPanel.node, factionPanel.node, journeyPanel.node);
boardLayout.append(board, sidebar);

const footer = el('footer', 'turn-bar');
const turnStatus = el('div', 'turn-status');
const activeLabel = el('strong');
const statusMessage = el('p', 'status-message', '選取斥候，踏入霧中。');
statusMessage.setAttribute('role', 'status');
statusMessage.setAttribute('aria-live', 'polite');
turnStatus.append(activeLabel, statusMessage);
const continueAI = button('繼續對手回合', () => { const result = gameplay.resumeAI(gameplay.getSnapshot().stamp); if (!result.ok) notify(result.error.message, true); }, 'secondary-button');
continueAI.hidden = true;
const endTurnButton = button('結束回合', () => dispatch({ type: 'EndTurn' }), 'primary-button end-turn');
const endShortcut = el('span', 'keycap', 'E');
endTurnButton.append(endShortcut);
footer.append(turnStatus, continueAI, endTurnButton);
shell.append(header, boardLayout, footer);
app.append(shell);
const map = new WorldMap(canvas, (point) => clickTile(point));
(window as unknown as { __map?: WorldMap }).__map = map;

const recordDialog = el('dialog', 'game-dialog record-dialog');
const recordTitle = el('h2', '', '航行紀錄');
const recordClose = button('關閉', () => closeDialog(recordDialog), 'dialog-close');
const recordHead = el('div', 'dialog-heading');
recordHead.append(recordTitle, recordClose);
const recordDescription = el('p', 'muted', '保存會保留地圖、回合與完整指令；重新開局與讀檔前會提醒未保存進度。');
const saveNotice = el('p', 'save-notice');
const recordFeedback = el('p', 'record-feedback');
recordFeedback.setAttribute('role', 'status');
const saveRow = el('div', 'dialog-actions');
saveRow.append(
  button('保存進度', () => saveLocal(), 'primary-button'),
  button('讀取保存', () => loadLocal()),
  button('匯出保存', () => download('save')),
  button('匯入保存', () => saveInput.click()),
);
const saveInput = el('input');
saveInput.type = 'file'; saveInput.accept = '.json,application/json'; saveInput.hidden = true;
saveInput.addEventListener('change', () => importFile(saveInput, false));
const replayBlock = el('section', 'dialog-section');
replayBlock.append(el('h3', '', '可驗證的回放'), el('p', 'muted', '回放會重新套用命令並核對結果。驗證只檢查檔案，不會覆蓋目前遊戲。'));
const replayRow = el('div', 'dialog-actions');
replayRow.append(button('匯出回放', () => download('replay')), button('驗證回放', () => replayInput.click()));
const replayResult = el('p', 'replay-result');
replayResult.setAttribute('role', 'status');
const replayInput = el('input');
replayInput.type = 'file'; replayInput.accept = '.json,application/json'; replayInput.hidden = true;
replayInput.addEventListener('change', () => importFile(replayInput, true));
replayBlock.append(replayRow, replayResult, replayInput);
const newGameBlock = el('section', 'dialog-section');
newGameBlock.append(el('h3', '', '再次出航'));
const seedLabel = el('label', '', '世界種子');
seedLabel.htmlFor = 'world-seed';
const seedInput = el('input', 'seed-input');
seedInput.id = 'world-seed'; seedInput.maxLength = 120; seedInput.value = view.seed;
const newGameRow = el('div', 'seed-row');
newGameRow.append(seedInput, button(initialRuleset === 'demo03-preview-1' ? '重新開局（Demo03隔離預覽）' : '重新開局', () => newGame(), 'danger-button'));
newGameBlock.append(el('p', 'next-game-ruleset', `下一新局：${nextRulesetLabel}。載入的戰局維持原規則。`), seedLabel, newGameRow, el('p', 'muted', '相同種子與規則版本會生成相同世界。更換文字即可展開新地圖。'));
recordDialog.append(recordHead, recordDescription, saveNotice, recordFeedback, saveRow, saveInput, replayBlock, newGameBlock);

const helpDialog = el('dialog', 'game-dialog help-dialog');
const helpHead = el('div', 'dialog-heading');
helpHead.append(el('h2', '', '霧境初航：出發指南'), button('關閉', () => closeDialog(helpDialog), 'dialog-close'));
const helpIntro = el('p', '', '從一座城邦出發，探索霧中村莊與遺跡，讓對手失去所有部隊和據點。');
const helpSteps = el('ol', 'help-steps');
[
  ['探索', '選取己方部隊。金色邊線標示合法目的格，點一下即可移動；每支部隊每回合可移動一次、攻擊一次。水域與山峰不能通行。'],
  ['擴張', '部隊走入村莊或敵方據點後，按「占領據點」。己方據點每回合收入 2 金幣；同回合每個空據點可招募一次。按地圖上方「中心」查看招募；按 Escape 可取消部隊選取，再點其他據點。'],
  ['發現', '首次看見未取用遺跡，必須立即選擇 4 金幣或最多 3 格未知地形情報。情報不會提供敵軍位置。'],
  ['發展', '耕作增加據點收入；弓術解鎖遠距弓兵；尋徑立即擴大斥候視野。研究與招募都會消耗金幣。'],
  ['流亡', '失去政治中心後，只要仍有部隊或據點就能續戰。持續控制據點跨過完整對手回合，可免費主動建立新中心。'],
].forEach(([title, text]) => { const li = el('li'); li.append(el('strong', '', title), el('p', '', text)); helpSteps.append(li); });
const shortcuts = el('p', 'shortcut-help', '鍵盤：N 下一部隊 · 方向鍵選格 · Enter 移動／攻擊 · E 結束回合 · Home 查看中心 · Escape 取消部隊選取。方向鍵選格後，詳情會提供合法行動。');
helpDialog.append(helpHead, helpIntro, helpSteps, shortcuts, el('p', 'muted', 'MVP 0.1 · 本機單人對 AI · 已知世界之外，仍是未知。'));

const relicDialog = el('dialog', 'game-dialog relic-dialog');
relicDialog.setAttribute('aria-labelledby', 'relic-title');
const relicArt = el('div', 'relic-art'); relicArt.setAttribute('aria-hidden', 'true');
const relicTitle = el('h2', '', '霧中，有一道古老的光'); relicTitle.id = 'relic-title';
const relicText = el('p', '', '探險隊發現未知金屬遺跡。此刻的選擇，將改變這段航程。');
const relicChoices = el('div', 'relic-choices');
const relicGold = button('', () => dispatch({ type: 'ResolveRelic', choice: 'gold' }), 'relic-choice');
relicGold.append(el('strong', '', '帶走金幣'), el('span', 'choice-value', '+4'), el('span', '', '立即補充招募與研究的資源'));
const relicIntel = button('', () => dispatch({ type: 'ResolveRelic', choice: 'intel' }), 'relic-choice');
const intelValue = el('span', 'choice-value');
const intelDescription = el('span');
relicIntel.append(el('strong', '', '解讀地形'), intelValue, intelDescription);
relicChoices.append(relicGold, relicIntel);
const relicError = el('p', 'is-error'); relicError.setAttribute('role', 'alert');
relicDialog.append(relicArt, el('span', 'dialog-overline', '首次發現 · 必須立即選擇'), relicTitle, relicText, relicChoices, relicError);
relicDialog.addEventListener('cancel', (event) => event.preventDefault());
[recordDialog, helpDialog, relicDialog].forEach((dialog) => {
  document.body.append(dialog);
  if (dialog !== relicDialog) dialog.addEventListener('click', (event) => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(dialog); } });
});

function openDialog(dialog: HTMLDialogElement): void {
  if (view.pendingRelic) return;
  lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (dialog === recordDialog) {
    seedInput.value = view.seed;
    updateSaveNotice();
  }
  if (!dialog.open) dialog.showModal();
}

function closeDialog(dialog: HTMLDialogElement): void {
  dialog.close();
  lastFocus?.focus();
}

function canAct(): boolean {
  return view.active === HUMAN && view.winner === null && view.pendingRelic === null && gameplay.getSnapshot().ai.phase !== 'running';
}

function sameAction(a: Action, b: Action): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isLegal(action: Action): boolean {
  return view.legalActions.some((legal) => sameAction(legal, action));
}

function makeActionButton(label: string, action: Action, className = ''): HTMLButtonElement {
  const node = button(label, () => dispatch(action), className);
  node.disabled = !canAct() || !isLegal(action);
  return node;
}

function selectedUnit() {
  return view.units.find((unit) => unit.id === selectedUnitId && unit.owner === HUMAN) ?? null;
}

function inspectCenter(): void {
  const center = view.tiles.find((tile) => tile.site?.id === view.faction.centerId);
  selectedUnitId = null;
  selection = center ? { x: center.x, y: center.y } : null;
  switchTab('inspect');
  render();
  map.home();
}

function tileAt(point: Point | null): DeepReadonly<KnownTile> | null {
  return point ? view.tiles.find((tile) => tile.x === point.x && tile.y === point.y) ?? null : null;
}

function selectUnit(id: string, focus = true): void {
  const unit = view.units.find((u) => u.id === id && u.owner === HUMAN);
  if (!unit) return;
  selectedUnitId = id;
  selection = { x: unit.x, y: unit.y };
  switchTab('inspect');
  if (focus) map.focus(unit);
  render();
}

function selectNextUnit(): void {
  const units = view.units.filter((u) => u.owner === HUMAN);
  if (!units.length) return;
  const available = units.filter((u) => !u.moved || !u.acted);
  const candidates = available.length ? available : units;
  const index = candidates.findIndex((u) => u.id === selectedUnitId);
  selectUnit(candidates[(index + 1) % candidates.length].id);
}

function clickTile(point: Point): void {
  if (view.pendingRelic) return;
  const unit = view.units.find((u) => u.x === point.x && u.y === point.y);
  if (unit?.owner === HUMAN) { selectUnit(unit.id, false); return; }
  const chosen = selectedUnit();
  if (chosen && canAct()) {
    const attack = view.legalActions.find((a) => a.type === 'Attack' && a.unitId === chosen.id && a.targetId === unit?.id);
    const move = view.legalActions.find((a) => a.type === 'Move' && a.unitId === chosen.id && a.to.x === point.x && a.to.y === point.y);
    if (attack) { dispatch(attack); return; }
    if (move) { dispatch(move); return; }
  }
  selection = point;
  switchTab('inspect');
  render();
}

function actionLabel(action: Action): string {
  switch (action.type) {
    case 'Move': return `探險隊移至 ${action.to.x + 1} · ${action.to.y + 1}。`;
    case 'Attack': return '部隊已交戰。傷亡與可用行動已更新。';
    case 'Capture': return '旗幟已升起，據點加入你的城邦。';
    case 'Recruit': return `${unitDefinition(view.ruleset,action.kind).name}加入探險隊。`;
    case 'Research': return `已習得「${technologyDefinition(view.ruleset,action.tech).name}」。`;
    case 'ResolveRelic': return action.choice === 'gold' ? '遺跡帶來 4 金幣。' : '古老的紋路揭開了更多地形。';
    case 'EstablishCapital': return '新中心已建立，城邦結束流亡。';
    case 'EndTurn': return '對手行動中。';
  }
}

function dispatch(action: Action): void {
  const before = view;
  const { sessionId, generation, version } = gameplay.getSnapshot().stamp;
  const result = gameplay.submitAction({ sessionId, generation, requestId: `ui-${requestSession}-${generation}-${++requestNumber}`, expectedVersion: version, action });
  if (!result.ok) {
    notify(result.error.message, true);
    if (relicDialog.open) relicError.textContent = result.error.message;
    return;
  }
  if (result.disposition === 'duplicate') return;
  view = result.snapshot.observation;
  demo.accepted(action, before, view);
  if (action.type === 'Move') selection = action.to;
  if (action.type === 'Recruit') {
    const site = view.tiles.find((t) => t.site?.id === action.siteId);
    const unit = site && view.units.find((u) => u.owner === HUMAN && u.x === site.x && u.y === site.y);
    if (unit) { selectedUnitId = unit.id; selection = { x: unit.x, y: unit.y }; }
  }
  notify(actionLabel(action));
  render();
}

function render(): void {
  view = gameplay.getObservation();
  brandCopy.querySelector('.brand-subtitle')!.textContent = view.ruleset === 'demo03-preview-1' ? 'Demo03 隔離玩法預覽 · 測試數值，尚未完成平衡驗收' : 'PROJECT-4X · 探索、征服與重建';
  const aiPaused = gameplay.getSnapshot().ai.phase === 'paused';
  if (selectedUnitId && !selectedUnit()) selectedUnitId = null;
  goldValue.textContent = String(view.faction.gold);
  const ownSites = view.tiles.filter((t) => t.site?.owner === HUMAN);
  const ownUnits = view.units.filter((u) => u.owner === HUMAN);
  const income = ownSites.length * (2 + (view.faction.techs.includes('farm') ? 1 : 0));
  incomeValue.textContent = `+${income}`;
  turnValue.textContent = String(view.turn);
  exploredLabel.textContent = `${view.tiles.filter((t) => t.visibility !== 'unknown').length} / ${view.width * view.height} 格已知`;
  factionLife.textContent = view.faction.life === 'exiled' ? '流亡中' : view.faction.life === 'eliminated' ? '已淘汰' : '中心安定';
  factionLife.classList.toggle('exiled', view.faction.life === 'exiled');
  const center = ownSites.find((t) => t.site?.id === view.faction.centerId);
  factionDescription.textContent = center ? `政治中心 · ${center.site!.name}` : view.faction.life === 'exiled' ? '旗幟仍在。守住據點跨過完整對手回合，就能主動重建中心。' : '你的航程已告一段落。';
  factionNumbers.replaceChildren(el('span', '', `${ownSites.length} 據點`), el('span', '', `${ownUnits.length} 部隊`));
  coordinates.textContent = selection ? `座標 ${selection.x + 1} · ${selection.y + 1}` : '尚未選格';
  canvas.setAttribute('aria-description', `${exploredLabel.textContent}。${coordinates.textContent}。${selectedUnit() ? `已選取${unitDefinition(view.ruleset,selectedUnit()!.kind).name}` : '未選取部隊'}。`);
  activeLabel.textContent = view.winner !== null ? '此局已結束' : aiPaused ? '對手已暫停' : view.active === HUMAN ? '輪到你了' : '對手行動中';
  continueAI.hidden = !aiPaused;
  endTurnButton.disabled = !canAct() || !isLegal({ type: 'EndTurn' });
  endTurnButton.firstChild!.textContent = view.active === HUMAN ? '結束回合' : '對手行動中';
  winnerBanner.hidden = view.winner === null;
  if (view.winner !== null) {
    winnerBanner.replaceChildren(el('span', '', view.winner === HUMAN ? '征服完成' : '此局落幕'), el('strong', '', view.winner === HUMAN ? '霧境，留下你的旗幟。' : '另一支旗幟留在霧境。'), el('p', '', '開啟「航行紀錄」保存回放，或用新種子再次出航。'));
  }
  renderInspection(); renderUnits(); renderTech(); renderJourney();
  map.update(view, { tile: selection, unitId: selectedUnitId });
  updateRelic();
  if (recordDialog.open) updateSaveNotice();
  demo.render();
}

function renderInspection(): void {
  const body = inspectPanel.body;
  body.replaceChildren();
  const unit = selectedUnit();
  const tile = tileAt(selection);
  const title = inspectPanel.node.querySelector('h2')!;
  if (unit) {
    title.textContent = unitDefinition(view.ruleset,unit.kind).name;
    const stats = unitDefinition(view.ruleset,unit.kind);
    const status = el('div', 'unit-status');
    status.append(el('span', unit.moved ? 'spent' : '', unit.moved ? '已移動' : '可移動'), el('span', unit.acted ? 'spent' : '', unit.acted ? '已攻擊' : '可攻擊'));
    const hp = el('div', 'hp-display');
    const hpBar = el('div', 'hp-track');
    const hpFill = el('span'); hpFill.style.width = `${100 * unit.hp / stats.hp}%`; hpBar.append(hpFill);
    hp.append(el('strong', '', `${unit.hp} / ${stats.hp} 生命`), hpBar);
    body.append(status, hp, el('p', 'unit-stats', `移動 ${stats.move} · 射程 ${stats.range} · 攻擊 ${stats.attack} · 防禦 ${stats.defense}`));
    const legal = view.legalActions.filter((a) => ('unitId' in a && a.unitId === unit.id));
    const moveCount = legal.filter((a) => a.type === 'Move').length;
    body.append(el('p', 'instruction', moveCount ? `點選金色邊線格移動 · ${moveCount} 個目的地` : '選取另一支部隊，或查看此格的據點。'));
    const moves = el('details', 'move-list');
    moves.append(el('summary', '', '以按鈕選擇移動格'));
    const moveActions = el('div', 'tile-actions');
    legal.forEach((a) => { if (a.type === 'Move') moveActions.append(makeActionButton(`${a.to.x + 1} · ${a.to.y + 1}`, a)); });
    if (moveActions.childElementCount) { moves.append(moveActions); body.append(moves); }
    const attackActions = el('div', 'inspect-actions');
    legal.forEach((a) => {
      if (a.type === 'Attack') {
        const enemy = view.units.find((u) => u.id === a.targetId);
        attackActions.append(makeActionButton(enemy ? `攻擊${unitDefinition(view.ruleset,enemy.kind).name} (${enemy.hp} HP)` : '攻擊目標', a, 'attack-button'));
      }
      if (a.type === 'Capture') attackActions.append(makeActionButton('占領據點', a, 'primary-button'));
    });
    body.append(attackActions);
  } else {
    title.textContent = tile?.visibility === 'unknown' ? '未踏之地' : tile?.site?.name ?? '探險隊';
    body.append(el('p', 'instruction', tile?.visibility === 'unknown' ? '這片霧尚未散去。派部隊靠近，讓未知成為地圖。' : '點選己方部隊，展開探索。金色旗幟屬於你的城邦。'));
  }
  if (tile && tile.visibility !== 'unknown') {
    const names = { plain: '平原', forest: '森林', hill: '丘陵', mountain: '山峰', water: '水域' };
    const tileLine = el('p', 'tile-line', `此格 · ${tile.terrain ? names[tile.terrain] : '未知'}${tile.visibility === 'explored' ? ' · 曾經探索，目前視野外' : ''}`);
    body.append(tileLine);
    if (tile.site) {
      const site = tile.site;
      const siteBlock = el('div', 'site-block');
      const isCapital = site.centerOf !== undefined;
      const siteTitle = el('h3', '', isCapital ? `★ ${site.name}（政治中心）` : site.name);
      const siteStatusText = site.owner === HUMAN
        ? '己方據點 · 可招募部隊'
        : site.owner === null
        ? '荒野村落 · 派遣部隊進駐即可宣布占領'
        : site.owner === undefined
        ? '據點目前在視野外，所有權未知'
        : '敵方據點 · 擊敗守軍進駐後可占領';
      siteBlock.append(siteTitle, el('p', 'muted', siteStatusText));

      if (site.owner === HUMAN) {
        const occupyingUnit = view.units.find((u) => u.x === tile.x && u.y === tile.y);
        const canRecruitAny = view.legalActions.some((a) => a.type === 'Recruit' && a.siteId === site.id);
        const recruitment = recruitmentStatus(view, site.id);
        const recruitLabel = {occupied:'據點佔用中','pending-relic':'先處置遺跡',waiting:'等待己方回合',available:'空防可徵召','insufficient-gold':'金幣不足',unavailable:'目前無可用徵召'}[recruitment];

        if (occupyingUnit) {
          const alert = el('div', 'garrison-alert');
          const badge = el('div', 'garrison-badge', '⚠️ 城內已有部隊駐防');
          const desc = el('p', 'garrison-text', `駐軍：${unitDefinition(view.ruleset,occupyingUnit.kind).name} (${occupyingUnit.hp} HP)。`);
          const caution = el('p', 'garrison-warn', '請先移開駐軍，才能在此招募。');
          const moveOutBtn = button(`選取${unitDefinition(view.ruleset,occupyingUnit.kind).name}並指揮移出`, () => selectUnit(occupyingUnit.id), 'secondary-button full-width');
          alert.append(badge, desc);
          if (occupyingUnit.owner === HUMAN) alert.append(caution, moveOutBtn);
          else { badge.textContent = '敵方部隊佔據據點'; alert.append(el('p', 'garrison-warn', '需先排除敵軍才能徵召。')); }
          siteBlock.append(alert);
        } else if (canRecruitAny && view.turn <= 2) {
          const guide = el('div', 'recruit-guide-banner', '💡 指揮官提示：城內空防且金幣充足，立即招募新軍！');
          siteBlock.append(guide);
        }

        const recruitSection = el('div', 'recruit-section');
        const recruitHeader = el('div', 'recruit-header');
        recruitHeader.append(el('h4', '', '徵召新軍'), el('span', 'recruit-meta', recruitLabel));
        recruitSection.append(recruitHeader);

        const recruits = el('div', 'recruit-list');
        getRuleset(view.ruleset).units.forEach(({id:kind}) => {
          const stat = unitDefinition(view.ruleset,kind);
          const action: Action = { type: 'Recruit', siteId: site.id, kind };
          const legal = isLegal(action);
          const item = el('div', 'recruit-card');
          const info = el('div', 'recruit-info');
          const nameEl = el('strong', '', stat.name);
          const statDetail = el('span', 'recruit-stats', `生命 ${stat.hp} · 攻 ${stat.attack} · 防 ${stat.defense} · 移 ${stat.move}${stat.range > 1 ? ` · 射程 ${stat.range}` : ''}`);
          info.append(nameEl, statDetail);

          let reason = '';
          if (legal) {
            reason = `招募 ${stat.name} (-${stat.cost} 金)`;
          } else if (occupyingUnit) {
            reason = '需先移開駐軍';
          } else if (!canAct() || recruitment === 'unavailable') {
            reason = recruitLabel;
          } else if (view.faction.gold < stat.cost) {
            reason = `金幣不足 (${view.faction.gold}/${stat.cost}G)`;
          } else if (getRuleset(view.ruleset).technologies.some(t => !view.faction.techs.includes(t.id) && t.effects.some(e => e.type === 'unlockUnit' && e.unit === kind))) {
            const required = getRuleset(view.ruleset).technologies.find(t => t.effects.some(e => e.type === 'unlockUnit' && e.unit === kind))!;
            reason = `需先研發【${required.name}】`;
          } else {
            reason = '暫不可招募';
          }

          const btn = makeActionButton(legal ? `${stat.name} · ${stat.cost} 金` : reason, action, legal ? 'primary-button' : 'secondary-button');
          item.append(info, btn);
          recruits.append(item);
        });
        recruitSection.append(recruits);
        siteBlock.append(recruitSection);

        const establish: Action = { type: 'EstablishCapital', siteId: site.id };
        if (view.faction.life === 'exiled') {
          siteBlock.append(makeActionButton('建立新政治中心 · 免費', establish, 'primary-button'));
          if (!isLegal(establish)) siteBlock.append(el('p', 'muted', '需持續控制此據點跨過完整對手回合，方能宣布新首都。'));
        }
      }
      body.append(siteBlock);
    }
    if (tile.relic?.resolved) body.append(el('p', 'muted', '遺跡的遠古餽贈已揭曉並融入文明。'));
  }
  if (unit && selection && (selection.x !== unit.x || selection.y !== unit.y)) {
    const destination: Action = { type: 'Move', unitId: unit.id, to: selection };
    if (isLegal(destination)) body.append(makeActionButton(`移至 ${selection.x + 1} · ${selection.y + 1}`, destination, 'primary-button'));
  }
}

function renderUnits(): void {
  unitPanel.body.replaceChildren();
  const units = view.units.filter((u) => u.owner === HUMAN);
  nextUnitButton.disabled = !units.length || view.pendingRelic !== null;
  if (!units.length) unitPanel.body.append(el('p', 'muted', '暫無部隊。在空的己方據點招募，再次出發。'));
  const list = el('div', 'unit-list');
  units.forEach((unit) => {
    const node = button('', () => selectUnit(unit.id), unit.id === selectedUnitId ? 'unit-row selected' : 'unit-row');
    const glyph = el('span', `unit-glyph ${unit.kind}`, ({infantry:'步',scout:'斥',archer:'弓',shieldGuard:'盾',mobileScout:'巡'} as const)[unit.kind]); glyph.setAttribute('aria-hidden', 'true');
    const copy = el('span', 'unit-copy');
    copy.append(el('strong', '', unitDefinition(view.ruleset,unit.kind).name), el('span', '', `${unit.x + 1} · ${unit.y + 1} / ${unit.hp} HP`));
    node.append(glyph, copy, el('span', 'unit-ready', unit.moved && unit.acted ? '已行動' : '待命'));
    node.setAttribute('aria-pressed', String(unit.id === selectedUnitId));
    list.append(node);
  });
  unitPanel.body.append(list);
}

function renderTech(): void {
  techPanel.body.replaceChildren();
  const currentTechs = getRuleset(view.ruleset).technologies.map(t => t.id);
  const researchedCount = currentTechs.filter((t) => view.faction.techs.includes(t)).length;
  const overview = el('div', 'tech-overview');
  overview.append(
    el('p', 'muted', `智慧典籍進度：已習得 ${researchedCount} / ${currentTechs.length} 項當代知識。`),
  );
  techPanel.body.append(overview);

  currentTechs.forEach((tech, index) => {
    const known = view.faction.techs.includes(tech);
    const stat = technologyDefinition(view.ruleset,tech);
    const canAfford = view.faction.gold >= stat.cost;
    const row = el('div', known ? 'tech-row researched' : 'tech-row');
    const copy = el('div', 'tech-copy');
    const titleRow = el('div', 'tech-title-row');
    titleRow.append(el('span', 'tech-number', `0${index + 1}`), el('h3', '', stat.name));
    if (known) titleRow.append(el('span', 'tech-researched-seal', '已習得 ✓'));
    copy.append(titleRow, el('p', '', stat.description));

    const action: Action = { type: 'Research', tech };
    const research = makeActionButton(known ? '已習得' : `${stat.cost} 金`, action, known ? 'secondary-button' : 'primary-button');
    research.title = known ? '已完成研究' : `研究「${stat.name}」（需 ${stat.cost} 金幣）`;
    if (!known && stat.prerequisites.some(id => !view.faction.techs.includes(id))) copy.append(el('p','muted',`前置：${stat.prerequisites.map(id => technologyDefinition(view.ruleset,id).name).join('、')}`));
    row.append(copy, research);
    techPanel.body.append(row);
  });


}

function renderJourney(): void {
  journeyPanel.body.replaceChildren();
  journey.slice(0, 3).forEach((entry, i) => journeyPanel.body.append(el('p', i === 0 ? 'journey-entry latest' : 'journey-entry', entry)));
}

function updateRelic(): void {
  if (demo.isMenuOpen()) return;
  if (view.pendingRelic) {
    [recordDialog, helpDialog].forEach((dialog) => { if (dialog.open) dialog.close(); });
    const count = view.pendingRelic.intelCount;
    intelValue.textContent = `${count} 格`;
    intelDescription.textContent = count ? '揭開未知地形，不包含敵軍情報' : '沒有可揭開的未知格，請選擇金幣';
    relicIntel.disabled = count === 0;
    relicGold.disabled = !isLegal({ type: 'ResolveRelic', choice: 'gold' });
    if (!relicDialog.open) { relicError.textContent = ''; relicDialog.showModal(); relicGold.focus(); }
  } else if (relicDialog.open) { relicDialog.close(); canvas.focus({ preventScroll: true }); }
}

function updateSaveNotice(): void {
  try {
    saveNotice.textContent = `${gameplay.getSnapshot().hasUnsavedChanges ? '目前有未保存的進度' : '目前進度尚未變更'} · ${localStorage.getItem(currentStorage().save) ? '本機有一份保存' : '本機尚無保存'} · 種子 ${view.seed}`;
  } catch (error) { saveNotice.textContent = `本機保存無法存取：${errorText(error)}。仍可匯出檔案。`; }
}

function saveLocal(): void {
  const result = files.save();
  if (!result.ok) { notify(result.error.message, true); return; }
  const keys = currentStorage();
  const savedRuleset = view.ruleset;
  try {
    localStorage.setItem(keys.save, result.file.text);
    const acknowledged = files.acknowledgeSave(result.file.stamp);
    if (!acknowledged.ok) { notify(acknowledged.error.message, true); return; }
    const journal = demo.getProgress();
    void bindProgressToSave(result.file.text, journal, savedRuleset).then(sidecar => {
      if (localStorage.getItem(keys.save) === result.file.text) localStorage.setItem(keys.progress, sidecar);
    }).catch(error => notify(`戰局已保存，但探索手札保存失敗：${errorText(error)}`, true));
    notify('進度已保存在此瀏覽器。也可匯出檔案備份。');
    updateSaveNotice();
  } catch (error) { notify(`保存失敗：${errorText(error)}。請使用匯出保存。`, true); updateSaveNotice(); }
}

function confirmReplacement(nextGame?: string): boolean {
  return !gameplay.getSnapshot().hasUnsavedChanges || window.confirm(`目前有未保存的進度。${nextGame ? `下一新局將採${nextGame}。` : ''}是否捨棄目前進度？取消後可先按「保存進度」或「匯出保存」。`);
}

function showReplacement(message: string): void {
  demo.reset(gameplay.getObservation());
  selectedUnitId = null; selection = null;
  journey.length = 0;
  notify(message);
  render(); map.home(); selectNextUnit();
  if (recordDialog.open) closeDialog(recordDialog);
}

function newGame(): void {
  const seed = seedInput.value.trim();
  if (!seed) { notify('請輸入世界種子。', true); seedInput.focus(); return; }
  if (!window.confirm(`重新開局會結束目前航程，下一新局將採${nextRulesetLabel}。請確認需要的進度已保存或匯出。`)) return;
  const result = files.newGame(seed, gameplay.getSnapshot().stamp);
  if (result.ok) showReplacement(`以「${seed}」展開新的航程。`);
  else notify(`建立世界失敗：${result.error.message}`, true);
}

async function loadLocal(isCurrent: () => boolean = () => true): Promise<boolean> {
  const expected = gameplay.getSnapshot().stamp;
  const keys = currentStorage();
  try {
    const text = localStorage.getItem(keys.save);
    if (!text) { notify('此瀏覽器尚無保存。可選擇匯入保存檔。', true); return false; }
    if (!confirmReplacement()) return false;
    let journal = null;
    let journalError: unknown = null;
    try {
      const sidecar = localStorage.getItem(keys.progress);
      if (sidecar) journal = await readBoundProgress(text, sidecar);
    } catch (error) { journalError = error; }
    const now = gameplay.getSnapshot().stamp;
    if (!isCurrent() || now.sessionId !== expected.sessionId || now.generation !== expected.generation || now.version !== expected.version) return false;
    const result = files.load(text, expected);
    if (!result.ok) { notify(`讀取失敗：${result.error.message}`, true); return false; }
    showReplacement('已讀取本機保存。');
    // Restore synchronously after replacement, before the incoming AI timer can run.
    if (journal) demo.restore(journal);
    if (journalError) notify(`戰局已讀取，但探索手札未能恢復：${errorText(journalError)}`, true);
    return true;
  } catch (error) { notify(`讀取失敗：${errorText(error)}`, true); return false; }
}

function download(kind: 'save' | 'replay'): void {
  const result = kind === 'save' ? files.save() : files.exportReplay();
  if (!result.ok) { notify(result.error.message, true); return; }
  const blob = new Blob([result.file.text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = el('a'); a.href = url; a.download = result.file.suggestedFilename;
  try { a.click(); } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
  // 瀏覽器下載沒有可靠的落盤回執，只有 localStorage 成功才能 acknowledgeSave。
  notify(`${kind === 'save' ? '保存' : '回放'}已發起匯出。`);
  updateSaveNotice();
}

async function importFile(input: HTMLInputElement, replay: boolean): Promise<void> {
  const file = input.files?.[0];
  const expected = gameplay.getSnapshot().stamp;
  input.value = '';
  if (!file) return;
  try {
    if (file.size > MAX_IMPORT_BYTES) throw new Error('檔案超過 10 MB，請選擇本遊戲的保存或回放檔。');
    const text = await file.text();
    if (replay) {
      const result = files.verifyReplay(text, expected);
      if (!result.ok) throw new Error(result.error.message);
      replayResult.textContent = `驗證通過 · ${result.schema} · ${result.ruleset}`;
      replayResult.classList.remove('is-error');
    } else {
      if (!confirmReplacement()) return;
      const result = files.load(text, expected);
      if (!result.ok) throw new Error(result.error.message);
      showReplacement('已匯入保存，航程接續。');
    }
  } catch (error) {
    const message = `${replay ? '回放驗證' : '匯入'}失敗：${errorText(error)}`;
    if (replay) { replayResult.textContent = message; replayResult.classList.add('is-error'); }
    notify(message, true);
  }
}

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]')) return;
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
  if (event.key.toLowerCase() === 'n') { event.preventDefault(); selectNextUnit(); }
  else if (event.key.toLowerCase() === 'e') { event.preventDefault(); if (!endTurnButton.disabled) dispatch({ type: 'EndTurn' }); }
  else if (event.key === 'Home') { event.preventDefault(); inspectCenter(); }
  else if (event.key === 'Escape') {
    event.preventDefault();
    selectedUnitId = null;
    render();
  }
  else if (target === canvas && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    const p = selection ?? selectedUnit() ?? { x: 0, y: 0 };
    const delta: Record<string, Point> = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
    selection = { x: Math.max(0, Math.min(view.width - 1, p.x + delta[event.key].x)), y: Math.max(0, Math.min(view.height - 1, p.y + delta[event.key].y)) };
    render(); map.focus(selection);
  } else if (target === canvas && event.key === 'Enter' && selection) { event.preventDefault(); clickTile(selection); }
});

const demo = createDemoShell({
  gameplay, mount: sidebar,
  hasSave: () => { try { return Boolean(localStorage.getItem(currentStorage().save)); } catch { return false; } },
  start: seed => {
    if (!confirmReplacement(nextRulesetLabel)) return false;
    const result = files.newGame(seed, gameplay.getSnapshot().stamp);
    if (!result.ok) { notify(result.error.message, true); return false; }
    showReplacement(`以「${seed}」展開探索Demo。`); return true;
  },
  load: loadLocal, save: saveLocal, help: () => openDialog(helpDialog),
  afterClose: () => { render(); canvas.focus({ preventScroll: true }); },
});

let previousAIPhase = gameplay.getSnapshot().ai.phase;
gameplay.subscribe(update => {
  render();
  if (update.cause === 'ai-status') {
    if (update.snapshot.ai.phase === 'paused') notify('對手回合已暫停；可按「繼續對手回合」接續。', true);
    else if (previousAIPhase === 'running' && update.snapshot.ai.phase === 'idle') notify('對手完成回合。新的航程開始，收入已到帳。');
  }
  previousAIPhase = update.snapshot.ai.phase;
  // PresentationEvent 的唯一播放入口；C2 供正式資料，動畫由 Gemini 後續接入。
});
window.addEventListener('pagehide', event => { if (!event.persisted) dispose(); });
const initialScout = view.units.find((unit) => unit.owner === HUMAN && unit.kind === 'scout');
if (initialScout) selectUnit(initialScout.id);
else selectNextUnit();
