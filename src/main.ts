import './styles.css';
import { createGame, applyCommand, observe, canonicalHash } from './core/game';
import { chooseAction } from './core/ai';
import { serializeGame, deserializeGame, exportReplay, replayGame } from './core/persistence';
import { TECH_STATS, UNIT_STATS } from './core/types';
import type { Action, GameState, KnownTile, Observation, Point, Tech, UnitKind } from './core/types';
import { WorldMap } from './ui/map';

const HUMAN = 0;
const SAVE_KEY = 'project4x-save-1';
const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const requestSession = crypto.randomUUID();
let state: GameState = createGame('霧境初航-01');
let view: Observation = observe(state, HUMAN);
let selection: Point | null = null;
let selectedUnitId: string | null = null;
let requestNumber = 0;
let generation = 0;
let aiRunning = false;
let aiPaused = false;
let aiTimer: ReturnType<typeof setTimeout> | undefined;
let dirty = false;
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
const helpButton = button('玩法', () => openDialog(helpDialog), 'header-button');
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
const zoomIn = button('+', () => map.zoomBy(1.25), 'icon-button');
zoomIn.setAttribute('aria-label', '放大地圖');
const homeButton = button('中心', () => inspectCenter());
const overviewButton = button('全圖', () => map.overview());
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
sidebar.append(factionPanel.node, inspectPanel.node, unitPanel.node, techPanel.node, journeyPanel.node);
boardLayout.append(board, sidebar);

const footer = el('footer', 'turn-bar');
const turnStatus = el('div', 'turn-status');
const activeLabel = el('strong');
const statusMessage = el('p', 'status-message', '選取斥候，踏入霧中。');
statusMessage.setAttribute('role', 'status');
statusMessage.setAttribute('aria-live', 'polite');
turnStatus.append(activeLabel, statusMessage);
const continueAI = button('繼續對手回合', () => { aiPaused = false; beginAI(); }, 'secondary-button');
continueAI.hidden = true;
const endTurnButton = button('結束回合', () => dispatch({ type: 'EndTurn' }), 'primary-button end-turn');
const endShortcut = el('span', 'keycap', 'E');
endTurnButton.append(endShortcut);
footer.append(turnStatus, continueAI, endTurnButton);
shell.append(header, boardLayout, footer);
app.append(shell);
const map = new WorldMap(canvas, (point) => clickTile(point));

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
  button('匯出保存', () => download(serializeGame(state), '保存', '.json')),
  button('匯入保存', () => saveInput.click()),
);
const saveInput = el('input');
saveInput.type = 'file'; saveInput.accept = '.json,application/json'; saveInput.hidden = true;
saveInput.addEventListener('change', () => importFile(saveInput, false));
const replayBlock = el('section', 'dialog-section');
replayBlock.append(el('h3', '', '可驗證的回放'), el('p', 'muted', '回放會重新套用命令並核對結果。驗證只檢查檔案，不會覆蓋目前遊戲。'));
const replayRow = el('div', 'dialog-actions');
replayRow.append(button('匯出回放', () => download(exportReplay(state), '回放', '.json')), button('驗證回放', () => replayInput.click()));
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
newGameRow.append(seedInput, button('重新開局', () => newGame(), 'danger-button'));
newGameBlock.append(seedLabel, newGameRow, el('p', 'muted', '相同種子與規則版本會生成相同世界。更換文字即可展開新地圖。'));
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
  return view.active === HUMAN && view.winner === null && view.pendingRelic === null && !aiRunning;
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
  render();
  map.home();
}

function tileAt(point: Point | null): KnownTile | null {
  return point ? view.tiles.find((tile) => tile.x === point.x && tile.y === point.y) ?? null : null;
}

function selectUnit(id: string, focus = true): void {
  const unit = view.units.find((u) => u.id === id && u.owner === HUMAN);
  if (!unit) return;
  selectedUnitId = id;
  selection = { x: unit.x, y: unit.y };
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
  render();
}

function actionLabel(action: Action): string {
  switch (action.type) {
    case 'Move': return `探險隊移至 ${action.to.x + 1} · ${action.to.y + 1}。`;
    case 'Attack': return '部隊已交戰。傷亡與可用行動已更新。';
    case 'Capture': return '旗幟已升起，據點加入你的城邦。';
    case 'Recruit': return `${UNIT_STATS[action.kind].name}加入探險隊。`;
    case 'Research': return `已習得「${TECH_STATS[action.tech].name}」。`;
    case 'ResolveRelic': return action.choice === 'gold' ? '遺跡帶來 4 金幣。' : '古老的紋路揭開了更多地形。';
    case 'EstablishCapital': return '新中心已建立，城邦結束流亡。';
    case 'EndTurn': return '對手行動中。';
  }
}

function dispatch(action: Action): void {
  if (view.active !== HUMAN || aiRunning || view.winner !== null) return;
  const result = applyCommand(state, { actor: HUMAN, requestId: `ui-${requestSession}-${generation}-${++requestNumber}`, expectedVersion: view.version, action });
  if (!result.ok) {
    const message = result.error ?? '此行動未通過規則驗證。';
    notify(message, true);
    if (relicDialog.open) relicError.textContent = message;
    return;
  }
  state = result.state;
  dirty = true;
  view = observe(state, HUMAN);
  if (action.type === 'Move') selection = action.to;
  if (action.type === 'Recruit') {
    const site = view.tiles.find((t) => t.site?.id === action.siteId);
    const unit = site && view.units.find((u) => u.owner === HUMAN && u.x === site.x && u.y === site.y);
    if (unit) { selectedUnitId = unit.id; selection = { x: unit.x, y: unit.y }; }
  }
  notify(actionLabel(action));
  render();
  if (view.active !== HUMAN && view.winner === null) beginAI();
}

function beginAI(): void {
  if (aiRunning || aiPaused || view.active === HUMAN || view.winner !== null) return;
  aiRunning = true;
  const currentGeneration = generation;
  let actions = 0;
  render();
  const step = () => {
    if (currentGeneration !== generation) return;
    const aiView = observe(state, 1);
    if (aiView.active === HUMAN || aiView.winner !== null) {
      aiRunning = false;
      view = observe(state, HUMAN);
      notify(aiView.winner === null ? '對手完成回合。新的航程開始，收入已到帳。' : '戰局已結束。');
      render();
      return;
    }
    if (actions >= 1000) {
      aiRunning = false; aiPaused = true;
      notify('對手運算達到安全上限，已暫停；按「繼續對手回合」可接續。', true);
      render();
      return;
    }
    if (!aiView.legalActions.length) {
      aiRunning = false; aiPaused = true;
      notify('對手沒有合法候選行動，已暫停。', true); render(); return;
    }
    let action: Action | null;
    try {
      action = chooseAction(aiView);
    } catch (error) {
      aiRunning = false; aiPaused = true;
      notify(`對手決策錯誤：${errorText(error)}`, true); render(); return;
    }
    if (!action) {
      aiRunning = false; aiPaused = true;
      notify('對手沒有回傳合法行動，已暫停。', true); render(); return;
    }
    const result = applyCommand(state, { actor: 1, requestId: `ai-${requestSession}-${generation}-${++requestNumber}`, expectedVersion: aiView.version, action });
    if (!result.ok) {
      aiRunning = false; aiPaused = true;
      notify(`對手行動遭拒：${result.error ?? '未知規則錯誤'}`, true); render(); return;
    }
    state = result.state;
    dirty = true;
    view = observe(state, HUMAN);
    actions++;
    if (view.active === HUMAN || view.winner !== null) {
      aiRunning = false;
      notify(view.winner === null ? '對手完成回合。新的航程開始，收入已到帳。' : '戰局已結束。');
      render();
      return;
    }
    render();
    aiTimer = setTimeout(step, reducedMotion ? 20 : 95);
  };
  aiTimer = setTimeout(step, reducedMotion ? 20 : 180);
}

function stopAI(): void {
  generation++;
  if (aiTimer !== undefined) clearTimeout(aiTimer);
  aiRunning = false; aiPaused = false;
}

function render(): void {
  view = observe(state, HUMAN);
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
  canvas.setAttribute('aria-description', `${exploredLabel.textContent}。${coordinates.textContent}。${selectedUnit() ? `已選取${UNIT_STATS[selectedUnit()!.kind].name}` : '未選取部隊'}。`);
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
}

function renderInspection(): void {
  const body = inspectPanel.body;
  body.replaceChildren();
  const unit = selectedUnit();
  const tile = tileAt(selection);
  const title = inspectPanel.node.querySelector('h2')!;
  if (unit) {
    title.textContent = UNIT_STATS[unit.kind].name;
    const stats = UNIT_STATS[unit.kind];
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
        attackActions.append(makeActionButton(enemy ? `攻擊${UNIT_STATS[enemy.kind].name} (${enemy.hp} HP)` : '攻擊目標', a, 'attack-button'));
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
      siteBlock.append(el('h3', '', site.name), el('p', 'muted', site.owner === HUMAN ? '己方據點 · 每回合可招募一支部隊' : site.owner === null ? '無主村莊 · 派部隊進入並占領' : site.owner === undefined ? '據點目前在視野外，所有權未知' : '敵方據點 · 進入後可占領'));
      if (site.owner === HUMAN) {
        const recruits = el('div', 'recruit-list');
        (['infantry', 'scout', 'archer'] as UnitKind[]).forEach((kind) => {
          const action: Action = { type: 'Recruit', siteId: site.id, kind };
          const node = makeActionButton(`${UNIT_STATS[kind].name} · ${UNIT_STATS[kind].cost} 金`, action);
          node.title = isLegal(action) ? `招募${UNIT_STATS[kind].name}` : kind === 'archer' && !view.faction.techs.includes('archery') ? '需要先研究弓術' : '需據點空格、足夠金幣，且本回合未招募';
          recruits.append(node);
        });
        siteBlock.append(recruits);
        const establish: Action = { type: 'EstablishCapital', siteId: site.id };
        if (view.faction.life === 'exiled') {
          siteBlock.append(makeActionButton('建立新中心 · 免費', establish, 'primary-button'));
          if (!isLegal(establish)) siteBlock.append(el('p', 'muted', '需持續控制此據點跨過完整對手回合。'));
        }
      }
      body.append(siteBlock);
    }
    if (tile.relic?.resolved) body.append(el('p', 'muted', '遺跡的禮物已被取用。'));
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
    const glyph = el('span', `unit-glyph ${unit.kind}`, unit.kind === 'infantry' ? '步' : unit.kind === 'scout' ? '斥' : '弓'); glyph.setAttribute('aria-hidden', 'true');
    const copy = el('span', 'unit-copy');
    copy.append(el('strong', '', UNIT_STATS[unit.kind].name), el('span', '', `${unit.x + 1} · ${unit.y + 1} / ${unit.hp} HP`));
    node.append(glyph, copy, el('span', 'unit-ready', unit.moved && unit.acted ? '已行動' : '待命'));
    node.setAttribute('aria-pressed', String(unit.id === selectedUnitId));
    list.append(node);
  });
  unitPanel.body.append(list);
}

function renderTech(): void {
  techPanel.body.replaceChildren();
  (['farm', 'archery', 'pathfinding'] as Tech[]).forEach((tech, index) => {
    const known = view.faction.techs.includes(tech);
    const row = el('div', known ? 'tech-row researched' : 'tech-row');
    const copy = el('div', 'tech-copy');
    copy.append(el('span', 'tech-number', `0${index + 1}`), el('h3', '', TECH_STATS[tech].name), el('p', '', TECH_STATS[tech].description));
    const research = makeActionButton(known ? '已習得' : `${TECH_STATS[tech].cost} 金`, { type: 'Research', tech });
    research.title = known ? '已完成研究' : `研究${TECH_STATS[tech].name}`;
    row.append(copy, research); techPanel.body.append(row);
  });
}

function renderJourney(): void {
  journeyPanel.body.replaceChildren();
  journey.slice(0, 3).forEach((entry, i) => journeyPanel.body.append(el('p', i === 0 ? 'journey-entry latest' : 'journey-entry', entry)));
}

function updateRelic(): void {
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
    saveNotice.textContent = `${dirty ? '目前有未保存的進度' : '目前進度尚未變更'} · ${localStorage.getItem(SAVE_KEY) ? '本機有一份保存' : '本機尚無保存'} · 種子 ${view.seed}`;
  } catch (error) { saveNotice.textContent = `本機保存無法存取：${errorText(error)}。仍可匯出檔案。`; }
}

function saveLocal(): void {
  try {
    localStorage.setItem(SAVE_KEY, serializeGame(state));
    dirty = false;
    notify('進度已保存在此瀏覽器。也可匯出檔案備份。');
    updateSaveNotice();
  } catch (error) { notify(`保存失敗：${errorText(error)}。請使用匯出保存。`, true); updateSaveNotice(); }
}

function confirmReplacement(): boolean {
  return !dirty || window.confirm('目前有未保存的進度。是否捨棄目前進度？取消後可先按「保存進度」或「匯出保存」。');
}

function replaceGame(next: GameState, message: string, saved: boolean): void {
  stopAI();
  state = next;
  view = observe(state, HUMAN);
  selectedUnitId = null; selection = null; dirty = !saved;
  journey.length = 0;
  notify(message);
  render();
  map.home();
  selectNextUnit();
  if (recordDialog.open) closeDialog(recordDialog);
  if (view.active !== HUMAN && view.winner === null) beginAI();
}

function newGame(): void {
  const seed = seedInput.value.trim();
  if (!seed) { notify('請輸入世界種子。', true); seedInput.focus(); return; }
  if (!window.confirm('重新開局會結束目前航程。請確認需要的進度已保存或匯出。')) return;
  try { replaceGame(createGame(seed), `以「${seed}」展開新的航程。`, false); }
  catch (error) { notify(`建立世界失敗：${errorText(error)}`, true); }
}

function loadLocal(): void {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    if (!text) { notify('此瀏覽器尚無保存。可選擇匯入保存檔。', true); return; }
    const next = deserializeGame(text);
    if (!confirmReplacement()) return;
    replaceGame(next, '已讀取本機保存。', true);
  } catch (error) { notify(`讀取失敗：${errorText(error)}`, true); }
}

function download(text: string, kind: string, extension: string): void {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = el('a'); a.href = url;
  a.download = `霧境初航_${kind}_回合${view.turn}${extension}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (kind === '保存') dirty = false;
  notify(`${kind}已匯出。`);
  updateSaveNotice();
}

async function importFile(input: HTMLInputElement, replay: boolean): Promise<void> {
  const file = input.files?.[0];
  const importGeneration = generation;
  input.value = '';
  if (!file) return;
  try {
    if (file.size > MAX_IMPORT_BYTES) throw new Error('檔案超過 10 MB，請選擇本遊戲的保存或回放檔。');
    const text = await file.text();
    if (generation !== importGeneration) {
      notify('已取消舊檔案讀取；目前已開始另一段航程。');
      return;
    }
    if (replay) {
      const replayed = replayGame(text);
      const replayView = observe(replayed, HUMAN);
      replayResult.textContent = `驗證通過 · ${replayView.turn} 回合 · 結果 ${canonicalHash(replayed)}`;
      replayResult.classList.remove('is-error');
    } else {
      const next = deserializeGame(text);
      if (!confirmReplacement()) return;
      replaceGame(next, '已匯入保存，航程接續。', true);
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

render();
const initialScout = view.units.find((unit) => unit.owner === HUMAN && unit.kind === 'scout');
if (initialScout) selectUnit(initialScout.id);
else selectNextUnit();
