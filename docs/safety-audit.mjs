import { build } from 'esbuild';
import ts from 'typescript';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const repo=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const auditDir=resolve(repo, 'node_modules/.cache/safety-audit');
mkdirSync(auditDir,{recursive:true});
const base=process.argv.includes('--baseline');
// Execute the real App session callbacks with controlled React state setters.
// Actual JSX and scene/loading effects use controlled adapters; browser appearance remains separate.
let appCallbacks='',appRender='';
if(!base){
 const appCode=readFileSync(resolve(repo,'src/App.tsx'),'utf8');
 const app=ts.createSourceFile('App.tsx',appCode,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const component=app.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='App');
const callbacks=['begin','checkpoint','exit','openEncounter','retreat','presentEncounter'].map(name=>{
  const statement=component.body.statements.find(node=>ts.isVariableStatement(node)&&node.declarationList.declarations.some(decl=>decl.name.getText(app)===name));
  if(!statement)throw Error('App callback missing: '+name);
  return statement.getText(app);
 });
 let continueCallback;
 function visit(node){
  if(ts.isJsxAttribute(node)&&node.name.getText(app)==='onContinue')continueCallback=node.initializer.expression.getText(app);
  ts.forEachChild(node,visit);
 }
 visit(component);if(!continueCallback)throw Error('App onContinue callback missing');
const loadingEffect=component.body.statements.find(node=>ts.isExpressionStatement(node)&&ts.isCallExpression(node.expression)&&node.expression.expression.getText(app)==='useEffect'&&node.expression.arguments[1]?.getText(app)==='[phase]');
if(!loadingEffect)throw Error('App loading effect missing');
const sceneEffect=component.body.statements.find(node=>ts.isExpressionStatement(node)&&ts.isCallExpression(node.expression)&&node.expression.expression.getText(app)==='useEffect'&&node.expression.arguments[1]?.getText(app)==='[entry, sceneEpoch]');
if(!sceneEffect)throw Error('App scene effect missing');
appCallbacks=callbacks.join('\n')+'\nconst continueSession='+continueCallback+';\nconst runLoadingEffect='+loadingEffect.expression.arguments[0].getText(app)+';\nconst runSceneEffect='+sceneEffect.expression.arguments[0].getText(app)+';';
 const returned=component.body.statements.find(ts.isReturnStatement)?.expression;
 if(!returned)throw Error('App rendering missing');
 appRender=ts.transpileModule('const renderApp=()=>('+returned.getText(app)+');',{fileName:'App-render.tsx',compilerOptions:{jsx:ts.JsxEmit.React,jsxFactory:'jsx',jsxFragmentFactory:'Fragment',target:ts.ScriptTarget.ES2022}}).outputText;
}
const source=String.raw`
import nodeAssert from 'node:assert/strict';
import * as THREE from 'three';
import {GameWorld} from '${repo}/src/three/world.ts';
import {Props} from '${repo}/src/three/props.ts';
import {newGame,loadSave,persistSave,hasUnreadableSave,type SaveGame} from '${repo}/src/game/state.ts';
import {store,initialHud} from '${repo}/src/game/store.ts';
${base ? '' : "import * as saveTabA from 'audit-save-tab-a';\nimport * as saveTabB from 'audit-save-tab-b';\nimport {store as tabStoreA} from 'audit-save-store-a';\nimport {store as tabStoreB} from 'audit-save-store-b';"}
import {npcReply,questById} from '${repo}/src/game/dialogAI.ts';
import {NPCS} from '${repo}/src/game/npc.ts';
import {audio} from '${repo}/src/game/audio.ts';
import {startWorld,stopWorld,getWorld} from '${repo}/src/game/runtime.ts';
let assertions=0;
const assert=new Proxy(nodeAssert,{
 apply(target,thisArg,args){assertions++;return Reflect.apply(target,thisArg,args)},
 get(target,property,receiver){const value=Reflect.get(target,property,receiver);return typeof value==='function'?(...args)=>{assertions++;return Reflect.apply(value,target,args)}:value},
});
const memory=new Map();
let timerSequence=0,cleared=0,frameSequence=0;
const timers=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
globalThis.window={setTimeout:callback=>{const id=++timerSequence;timers.set(id,callback);return id;},clearTimeout:id=>{cleared++;timers.delete(id);},removeEventListener:()=>{},matchMedia:()=>({matches:false})};
globalThis.document={hidden:false,pointerLockElement:null,exitPointerLock:()=>{},removeEventListener:()=>{}};
globalThis.requestAnimationFrame=()=>++frameSequence;
globalThis.cancelAnimationFrame=()=>{};
const save=newGame();
const world=new GameWorld({},save);
Object.assign(world,{ship:{x:0,z:0,heading:0},player:{pos:{x:0,z:0}},renderer:{domElement:{dataset:{}}},clock:{getDelta:()=>.05}});
const props=Object.assign(Object.create(Props.prototype),{driftwood:[]});world.props=props;
const kaj=NPCS.find(n=>n.id==='kaj');
const trace=[];
function collect(n,label){
 props.driftwood=Array.from({length:n},()=>({mesh:{visible:true},x:0,z:0,taken:false,respawnAt:0,spin:0}));
 world.auditCollection();
 assert(props.driftwood.every(d=>d.taken&&!d.mesh.visible&&d.respawnAt===75));
 assert.equal(props.collectDriftwood(0,0,7.5,0),0);
 trace.push({label,wood:save.wood,driftwood:save.driftwood,speed:save.shipSpeedLevel});
}
function dialog(){
 const live=world.getSave();assert.equal(live,save);
 let reply=npcReply(kaj,'aufgabe',live,trace.length);
 // The protected dialog offers first; acceptance requires a conscious reply.
 if(!reply.action)reply=npcReply(kaj,'ich mache es',live,trace.length);
 assert(reply.action);
 if(reply.action.type==='acceptQuest')live.quests[reply.action.questId]='active';
 else if(reply.action.type==='turnInQuest'){questById(reply.action.questId).applyReward(live);live.quests[reply.action.questId]='done';}
 else assert.fail('unexpected action');
 world.persistPublic();
 assert.equal(world.getSave(),save);
 trace.push({label:reply.action.type+':'+reply.action.questId,wood:save.wood,driftwood:save.driftwood,speed:save.shipSpeedLevel});
}
collect(5,'before harbor');dialog();dialog();collect(3,'after first harbor dialogue');
assert.equal(save.wood,10);assert.equal(save.driftwood,3);assert.equal(save.shipSpeedLevel,1);
dialog();collect(5,'after second harbor dialogue');dialog();collect(2,'after second hand-in');
world.persistPublic();
const reopened=loadSave();
assert.equal(reopened.wood,17);assert.equal(reopened.driftwood,2);assert.equal(reopened.shipSpeedLevel,2);
assert.equal(reopened.player.items.anker,save.player.items.anker);
console.log(JSON.stringify({suite:'treibholz',source:BASELINE?'3343519':'working tree',trace,reopened:{wood:reopened.wood,driftwood:reopened.driftwood,speed:reopened.shipSpeedLevel}},null,2));
if(!BASELINE){
 // Keep actual presentation transitions, frame routing and duration rebasing.
 // Visual adapters count calls; this does not establish WebGL appearance or asset quality.
 function presentationFixture(target){
  const calls={render:0,water:0,sky:0,ship:0,particles:0};
  const gameShip=new THREE.Group(),playerGroup=new THREE.Group(),buoy=new THREE.Group(),previewShip=new THREE.Group();
  const cloud=new THREE.Group();cloud.position.set(2,7,3);
  Object.assign(target,{
   camera:new THREE.PerspectiveCamera(),scene:new THREE.Scene(),shipObjects:[gameShip],
   ship:{x:0,z:0,heading:0,group:gameShip},player:{pos:new THREE.Vector3(),group:playerGroup},
   renderer:{domElement:{dataset:{}}},clock:{getDelta:()=>.05},clouds:[{mesh:cloud,speed:2}],
   props:{dock:{x:0,z:0,len:10}},bloom:{enabled:false},
   sky:{update:()=>{calls.sky++}},water:{update:()=>{calls.water++},heightAt:()=>.1,renderReflection:()=>{}},
   composer:{render:()=>{calls.render++}},presentationShip:{group:previewShip,sailDt:()=>{calls.ship++}},
   presentationParticles:{update:()=>{calls.particles++}},presentationBuoy:buoy,presentationObjects:[previewShip,buoy],
   createPresentationObjects:()=>{},
  });
  return calls;
 }
 assert.equal(initialHud.combatEnabled,false);
 store.set({...initialHud});save.mode='onfoot';world.tryAttack();
 assert.equal(world.attackTimer,null);world.startEncounter('p01');
 assert.equal(store.get().explorationOpen,true);assert.equal(store.get().battlePhen,null);save.mode='sailing';
 store.set({...initialHud,combatEnabled:true});world.syncProtection();save.mode='onfoot';
 let hits=0,unlocked=0;world.player.swing=()=>{};world.player.facing=0;
 world.enemies=[{dead:false,x:0,z:1,hit:()=>{hits++;return false;}}];
 world.tryAttack();const attackId=world.attackTimer;assert.notEqual(attackId,null);const lateAttack=timers.get(attackId);
 document.pointerLockElement=world.renderer.domElement;document.exitPointerLock=()=>{unlocked++;document.pointerLockElement=null;};world.keys.add('w');
 store.set({paused:true,protectionOpen:'pause'});world.syncProtection();
 assert.equal(timers.has(attackId),false);assert.equal(world.keys.size,0);assert.equal(unlocked,1);
 lateAttack();assert.equal(hits,0);world.attackCooldown=0;save.mode='sailing';
 store.set({...initialHud,battlePhen:'p01',duelId:'duell_vessa',dialogNpc:'kaj',chatOpen:true,cookOpen:true,journalOpen:true,loreStone:'stone',combatEnabled:true});
 world.creatures.set('p01',{setAgitation:()=>{}});
 save.crystals=31;save.player.stability=37;save.player.presence=29;save.player.items.anker=8;
 const original=JSON.stringify({player:save.player,wood:save.wood,crystals:save.crystals,materials:save.materials,food:save.food,quests:save.quests});
 assert.equal(world.duelPay(7),true);assert.equal(save.crystals,24);
 assert.equal(world.checkpoint(),true);assert.equal(loadSave().crystals,31);
 const damaged={...save.player,stability:0,presence:0,items:{anker:0}};
 world.endEncounter('flee','p01',damaged);
 assert.equal(JSON.stringify({player:save.player,wood:save.wood,crystals:save.crystals,materials:save.materials,food:save.food,quests:save.quests}),original);
 assert.equal(store.get().paused,true);assert.equal(store.get().protectionOpen,'pause');
 for(const field of ['battlePhen','duelId','dialogNpc','loreStone'])assert.equal(store.get()[field],null);
 for(const field of ['chatOpen','cookOpen','journalOpen','combatEnabled'])assert.equal(store.get()[field],false);
 assert.equal(JSON.stringify(loadSave().player),JSON.stringify(save.player));
 world.syncProtection();assert.equal(world.keys.size,0);assert.equal(world.attackTimer,null);assert(cleared>0);
 const pausedSnapshot=JSON.stringify(save),elapsed=world.elapsed;
 world.loop();world.loop();assert.equal(JSON.stringify(save),pausedSnapshot);assert.equal(world.elapsed,elapsed);
 const now=Date.now,begin=now();let simulated=begin;Date.now=()=>simulated;
 save.activeMeals=[{expiresAt:begin+10000,crashAt:begin+20000,crashExpiresAt:begin+30000}];world.frozenAt=begin;
 assert.equal(world.getGameTime(),begin);simulated+=60000;assert.equal(world.getGameTime(),begin);
 assert.equal(world.checkpoint(),true);assert.equal(save.activeMeals[0].expiresAt-world.getGameTime(),10000);
 assert.equal(save.activeMeals[0].expiresAt,begin+70000);assert.equal(save.activeMeals[0].crashAt,begin+80000);assert.equal(save.activeMeals[0].crashExpiresAt,begin+90000);
 store.set({...initialHud});world.syncProtection();simulated+=1000;assert.equal(world.getGameTime(),simulated);
 Date.now=now;
 const presentationCalls=presentationFixture(world);
 const presentationBegin=Date.now();let presentationNow=presentationBegin;Date.now=()=>presentationNow;
 const originalPerformance=globalThis.performance;let presentationPerformance=5000;globalThis.performance={now:()=>presentationPerformance};
 world.fireBuffUntil=presentationPerformance+12000;
 save.activeMeals=[{expiresAt:presentationBegin+10000,crashAt:presentationBegin+20000,crashExpiresAt:presentationBegin+30000}];
 store.set({...initialHud});world.syncProtection();world.camera.position.set(10,15,20);world.camera.rotation.set(.1,.2,.3);
 const cameraPosition=world.camera.position.clone(),cameraQuaternion=world.camera.quaternion.clone(),cloudPosition=world.clouds[0].mesh.position.clone();
 const presentationSave=JSON.stringify(save),simulationTimers={elapsed:world.elapsed,hud:world.hudTimer,save:world.saveTimer};
 for(const mode of ['title','arrival','look','mark','distance']){
  const frames=world.presentationFrame;world.setPresentation(mode);world.loop();world.loop();
  assert.equal(world.presentation,mode);assert(world.presentationFrame>frames);assert.equal(world.renderer.domElement.dataset.presentationMarked,String(mode==='mark'));
  assert.equal(JSON.stringify(save),presentationSave);assert.deepEqual({elapsed:world.elapsed,hud:world.hudTimer,save:world.saveTimer},simulationTimers);
  assert.equal(world.ship.group.visible,false);assert.equal(world.player.group.visible,false);assert.equal(world.getGameTime(),presentationBegin);
 }
 assert(presentationCalls.render>0&&presentationCalls.water>0&&presentationCalls.ship>0);
 world.presentationMotion.matches=true;const reducedElapsed=world.presentationElapsed;world.loop();assert.equal(world.presentationElapsed,reducedElapsed);world.presentationMotion.matches=false;
 for(const blocked of [{paused:true,protectionOpen:'pause'},{paused:false,protectionOpen:'help'},{hidden:true}]){
  document.hidden=Boolean(blocked.hidden);store.set({...initialHud,...blocked});world.syncProtection();
  const frozenFrames=world.presentationFrame,frozenVisualTime=world.presentationElapsed,frozenCalls={...presentationCalls},frozenCloud=world.clouds[0].mesh.position.clone();
  presentationNow+=60000;presentationPerformance+=60000;world.loop();world.loop();
  assert.equal(world.presentationFrame,frozenFrames);assert.equal(world.presentationElapsed,frozenVisualTime);assert.deepEqual(presentationCalls,frozenCalls);
  assert(world.clouds[0].mesh.position.equals(frozenCloud));assert.equal(world.getGameTime(),presentationBegin);assert.equal(JSON.stringify(save),presentationSave);
 }
 document.hidden=false;store.set({...initialHud});world.syncProtection();assert.equal(world.checkpoint(),true);
 assert.equal(loadSave().activeMeals[0].expiresAt-presentationNow,10000);assert.equal(save.activeMeals[0].expiresAt-world.getGameTime(),10000);
 assert.equal(world.fireBuffUntil-presentationPerformance,12000);
 world.setPresentation(null);assert.equal(world.presentation,null);assert(world.camera.position.equals(cameraPosition));assert(world.camera.quaternion.equals(cameraQuaternion));
 assert(world.clouds[0].mesh.position.equals(cloudPosition));assert.equal(world.ship.group.visible,true);assert.equal(world.player.group.visible,true);
 assert.equal(world.getGameTime(),presentationNow);assert.equal(world.fireBuffUntil-presentationPerformance,12000);
 presentationNow+=1000;presentationPerformance+=1000;assert.equal(world.getGameTime(),presentationNow);assert.equal(world.fireBuffUntil-presentationPerformance,11000);Date.now=now;globalThis.performance=originalPerformance;
 let suspended=0,resumed=0;
 audio.paused=false;audio.ctx={state:'running',currentTime:0,suspend:async()=>{suspended++;audio.ctx.state='suspended'},resume:async()=>{resumed++;audio.ctx.state='running'}};
 audio.master={gain:{cancelScheduledValues:()=>{},setValueAtTime:()=>{},linearRampToValueAtTime:()=>{}}};
 audio.setPaused(true);await audio.transition;assert.equal(suspended,1);assert.equal(audio.isMuted,true);
 audio.confirm();assert.equal(resumed,0);audio.setPaused(false);await audio.transition;assert.equal(resumed,1);
 let releaseLoading;globalThis.__preloadGate=new Promise(resolve=>releaseLoading=resolve);
 const cancelled=startWorld({},newGame());stopWorld();releaseLoading();
 await assert.rejects(cancelled,e=>e.name==='AbortError');assert.equal(getWorld(),null);assert.equal('__game' in window,false);
 delete globalThis.__preloadGate;
 const created=[];const disposed=[];const pending=[];
 GameWorld.create=()=>new Promise(resolve=>pending.push(resolve));
 const first=startWorld({},newGame());assert.equal(first,startWorld({},newGame()));
 stopWorld();const second=startWorld({},newGame());
 const newer={dispose:flag=>disposed.push(['new',flag])};pending[1](newer);await second;assert.equal(getWorld(),newer);assert.equal(window.__game,newer);
 const stale={dispose:flag=>disposed.push(['stale',flag])};pending[0](stale);
 await assert.rejects(first,e=>e.name==='AbortError');assert.equal(getWorld(),newer);assert.deepEqual(disposed,[['stale',false]]);
 stopWorld();assert.equal(getWorld(),null);assert.equal('__game' in window,false);assert.deepEqual(disposed,[['stale',false],['new',undefined]]);
 const raw=memory.get('phaenomenautik3-save-v1');
 const setItem=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota test')};
 assert.equal(world.checkpoint(),false);assert(store.get().saveError);assert.equal(memory.get('phaenomenautik3-save-v1'),raw);
 localStorage.setItem=setItem;assert.equal(world.checkpoint(),true);assert.equal(store.get().saveError,null);
 for(const broken of ['{broken json','{"version":3,"islands":[]}']){
  memory.set('phaenomenautik3-save-v1',broken);assert.equal(loadSave(),null);
  assert.equal(persistSave(newGame()),false);assert(store.get().saveError);assert.equal(memory.get('phaenomenautik3-save-v1'),broken);
 }
 memory.set('phaenomenautik3-save-v1',raw);assert(loadSave());assert.equal(persistSave(save),true);
 {
  let phase='game',hasSave=false,loadError=null,encounterSave=null,surfaceEpoch=0,sceneReady=true,sceneEpoch=0;
  const saveRef={current:loadSave()},previewRef={current:newGame()},generation={current:0};
  const entry={encounter:null};
  const setPhase=value=>{phase=value},setHasSave=value=>{hasSave=value},setLoadError=value=>{loadError=value};
  const setSurfaceEpoch=update=>{surfaceEpoch=update(surfaceEpoch)};
  const setSceneReady=value=>{sceneReady=value},setSceneEpoch=update=>{sceneEpoch=update(sceneEpoch)};
  const setEncounterSave=value=>{encounterSave=value};
  const useCallback=callback=>callback;
  ${appCallbacks}
  const jsx=(type,props,...children)=>({type,props:props||{},children});
  const Fragment='Fragment';
  const SurfaceBoundary='SurfaceBoundary',GentleEncounter='GentleEncounter',Protection='Protection',TitleScreen='TitleScreen';
  const HUD='HUD',BattleOverlay='BattleOverlay',DialogOverlay='DialogOverlay',JournalOverlay='JournalOverlay',LoreOverlay='LoreOverlay',ChatOverlay='ChatOverlay',CookOverlay='CookOverlay',DuelOverlay='DuelOverlay';
  const containerRef={current:{}};
  const renderSession=()=>{const h=store.get();${appRender} return renderApp();};
  const findNode=(node,predicate)=>!node||typeof node!=='object'?null:predicate(node)?node:(node.children||[]).map(child=>findNode(child,predicate)).find(Boolean);
  store.set({...initialHud});world.syncProtection();begin(world.getSave());setPhase('game');world.startEncounter('p01');
  const encounterTree=renderSession();const panel=findNode(encounterTree,node=>node.type==='GentleEncounter');
  assert.equal(store.get().explorationOpen,true);assert(panel);assert.equal(panel.props.save,world.getSave());
  assert.equal(findNode(encounterTree,node=>node.props?.className?.startsWith('game-surfaces')).props.inert,true);
  panel.props.onClose();assert.equal(store.get().explorationOpen,false);assert.equal(store.get().paused,true);assert.equal(store.get().protectionOpen,'pause');
  store.set({...initialHud});world.syncProtection();
  const sessionSave=newGame();sessionSave.wood=73;sessionSave.player.stability=37;
  let sessionDisposed=0;
  const sessionWorld=new GameWorld({},sessionSave);presentationFixture(sessionWorld);
  const unsubscribeSession=store.subscribe(sessionWorld.syncProtection);
  sessionWorld.dispose=()=>{sessionDisposed++;unsubscribeSession();};
  GameWorld.create=async()=>sessionWorld;await startWorld({},sessionSave);setSceneReady(true);
  const preservedRaw=memory.get('phaenomenautik3-save-v1');
  assert.notEqual(loadSave().wood,sessionSave.wood);
  localStorage.setItem=()=>{throw Error('session quota test')};
  // Exit retains a completed renderer in title presentation; only unfinished generations are disposed.
  exit();assert.equal(phase,'title');assert.equal(getWorld(),sessionWorld);assert.equal(sessionDisposed,0);assert.equal(sessionWorld.presentation,'title');
  assert.equal(saveRef.current,sessionSave);assert.equal(hasSave,true);assert.equal(store.get().explorationOpen,false);assert.equal(surfaceEpoch,1);
  assert.equal(memory.get('phaenomenautik3-save-v1'),preservedRaw);assert(store.get().saveError);
  assert.notEqual(loadSave().wood,73);assert.equal(sessionSave.wood,73);assert.equal(sceneReady,true);assert.equal(sceneEpoch,0);
  const titleSave=JSON.stringify(sessionSave),titleElapsed=sessionWorld.elapsed,titleFrames=sessionWorld.presentationFrame;
  sessionWorld.loop();sessionWorld.loop();assert.equal(JSON.stringify(sessionSave),titleSave);assert.equal(sessionWorld.elapsed,titleElapsed);
  assert(sessionWorld.presentationFrame>titleFrames);assert.equal(audio.isMuted,true);
  continueSession();assert.equal(phase,'loading');assert.equal(saveRef.current,sessionSave);assert.equal(loadError,null);
  assert.equal(saveRef.current.wood,73);assert.equal(saveRef.current.player.stability,37);
  let retainedCreates=0;GameWorld.create=async()=>{retainedCreates++;return sessionWorld};
  const retainedCleanup=runLoadingEffect(),retainedTimer=timers.get(timerSequence);timers.delete(timerSequence);retainedTimer();
  await Promise.resolve();await Promise.resolve();assert.equal(phase,'game');assert.equal(sceneReady,true);assert.equal(sessionWorld.presentation,null);
  assert.equal(getWorld(),sessionWorld);assert.equal(retainedCreates,0);retainedCleanup();
  for(const duringLoad of [{paused:true,protectionOpen:'pause',explorationOpen:false},{paused:false,protectionOpen:'help',explorationOpen:false},{paused:false,protectionOpen:null,explorationOpen:true}]){
   begin(sessionSave);store.set(duringLoad);const pausedLoadCleanup=runLoadingEffect(),pausedLoadTimer=timers.get(timerSequence);timers.delete(timerSequence);pausedLoadTimer();
   await Promise.resolve();await Promise.resolve();assert.equal(phase,'game');
   for(const field of ['paused','protectionOpen','explorationOpen'])assert.equal(store.get()[field],duringLoad[field]);
   assert.equal(sessionWorld.presentation,duringLoad.explorationOpen?'arrival':null);assert.equal(getWorld(),sessionWorld);assert.equal(retainedCreates,0);pausedLoadCleanup();
  }
  store.set({...initialHud});sessionWorld.setPresentation(null);sessionWorld.syncProtection();
  store.set({paused:true,protectionOpen:'help',menuOpen:true});
  openEncounter();assert.equal(store.get().explorationOpen,true);assert.equal(encounterSave,sessionSave);
  assert.equal(store.get().paused,false);assert.equal(store.get().protectionOpen,null);assert.equal(store.get().menuOpen,false);
  const sessionPanel=findNode(renderSession(),node=>node.type==='GentleEncounter');assert(sessionPanel);
  const choiceSave=JSON.stringify(sessionSave);sessionPanel.props.onScene('mark');sessionWorld.loop();
  assert.equal(sessionWorld.presentation,'mark');assert.equal(JSON.stringify(sessionSave),choiceSave);
  assert.equal(memory.get('phaenomenautik3-save-v1'),preservedRaw);
  // Different save/loading generation must still be cancelled and disposed without persistence.
  stopWorld(false);assert.equal(sessionDisposed,1);setSceneReady(false);
  let earlyCreates=0;GameWorld.create=async()=>{earlyCreates++;return sessionWorld};
  begin(sessionSave);const earlyCleanup=runLoadingEffect(),earlyTimerId=timerSequence;assert(timers.has(earlyTimerId));
  exit();earlyCleanup();assert.equal(timers.has(earlyTimerId),false);assert.equal(earlyCreates,0);assert.equal(phase,'title');assert.equal(sceneEpoch,1);
  let releaseSessionLoading;GameWorld.create=()=>new Promise(resolve=>releaseSessionLoading=resolve);
  begin(sessionSave);const opening=startWorld({},sessionSave),loadingCleanup=runLoadingEffect();
  const loadingTimer=timers.get(timerSequence);timers.delete(timerSequence);loadingTimer();
  exit();loadingCleanup();assert.equal(phase,'title');assert.equal(saveRef.current,sessionSave);
  const staleFlags=[];releaseSessionLoading({dispose:flag=>{sessionDisposed++;staleFlags.push(flag)}});await assert.rejects(opening,error=>error.name==='AbortError');
  await Promise.resolve();assert.equal(phase,'title');assert.deepEqual(staleFlags,[false]);assert.equal(memory.get('phaenomenautik3-save-v1'),preservedRaw);
  assert.equal(getWorld(),null);assert.equal('__game' in window,false);assert.equal(sessionDisposed,2);assert.equal(sceneReady,false);assert.equal(sceneEpoch,2);
  localStorage.setItem=setItem;
  const broken='{session broken json';memory.set('phaenomenautik3-save-v1',broken);assert.equal(loadSave(),null);
  store.set({...initialHud,paused:true,protectionOpen:'help'});openEncounter();
  assert.equal(store.get().explorationOpen,false);assert.equal(store.get().paused,true);assert.equal(store.get().protectionOpen,'pause');
  assert.equal(findNode(renderSession(),node=>node.type==='GentleEncounter'),undefined);
  store.set({...initialHud});world.syncProtection();world.startEncounter('p01');
  assert.equal(store.get().explorationOpen,false);assert.equal(store.get().paused,true);assert.equal(store.get().protectionOpen,'pause');
  continueSession();assert.equal(phase,'loading');assert.equal(saveRef.current,sessionSave);
  assert.equal(checkpoint(),false);assert.equal(memory.get('phaenomenautik3-save-v1'),broken);
  exit();assert.equal(phase,'title');assert.equal(hasSave,true);assert.equal(saveRef.current,sessionSave);
  saveRef.current=null;continueSession();assert.equal(phase,'title');begin(newGame());assert.equal(phase,'title');
  assert.equal(saveRef.current,null);assert.equal(memory.get('phaenomenautik3-save-v1'),broken);
  memory.set('phaenomenautik3-save-v1',preservedRaw);assert(loadSave());
  const recovered=loadSave();begin(recovered);const errorRaw=memory.get('phaenomenautik3-save-v1');
  GameWorld.create=async()=>{throw Error('controlled scene load failure')};
  const errorCleanup=runLoadingEffect(),errorTimer=timers.get(timerSequence);timers.delete(timerSequence);errorTimer();
  for(let i=0;i<8;i++)await Promise.resolve();
  assert.equal(phase,'error');assert(loadError);assert.equal(getWorld(),null);assert.equal(saveRef.current,recovered);assert.equal(memory.get('phaenomenautik3-save-v1'),errorRaw);
  assert.equal(findNode(renderSession(),node=>node.type==='Protection').props.phase,'error');assert(findNode(renderSession(),node=>node.props?.className==='load-error'));
  errorCleanup();exit();assert.equal(phase,'title');assert.equal(hasSave,true);assert.equal(saveRef.current,recovered);
  memory.delete('phaenomenautik3-save-v1');saveRef.current=null;setHasSave(false);previewRef.current=newGame();store.set({...initialHud});setSceneReady(false);
  const previewWorld=new GameWorld({},previewRef.current);presentationFixture(previewWorld);let previewRetreats=0,previewDisposals=0;
  previewWorld.retreatEncounter=()=>{previewRetreats++};previewWorld.dispose=()=>{previewDisposals++};GameWorld.create=async()=>previewWorld;
  const previewCleanup=runSceneEffect();for(let i=0;i<8;i++)await Promise.resolve();
  assert.equal(getWorld(),previewWorld);assert.equal(sceneReady,true);assert.equal(previewWorld.presentation,'title');assert.equal(findNode(renderSession(),node=>node.type==='Protection').props.canSave,false);
  const previewOriginal=JSON.stringify(previewRef.current);assert.equal(checkpoint(),false);retreat();
  assert.equal(previewRetreats,0);assert.equal(JSON.stringify(previewRef.current),previewOriginal);assert.equal(memory.has('phaenomenautik3-save-v1'),false);
  exit();assert.equal(hasSave,false);assert.equal(saveRef.current,null);assert.equal(memory.has('phaenomenautik3-save-v1'),false);
  previewCleanup();assert.equal(previewDisposals,1);assert.equal(getWorld(),null);
  console.log(JSON.stringify({suite:'app-session',worldEncounter:'actual world trigger renders actual App encounter JSX with the same live save; underlying surface inert',protectionEncounter:'successful opening clears protection and menu; corrupt original keeps protection and panel closed',quota:'exit retains renderer and exact live save in animated title; disk reload preserves prior successful save; actual loading effect resumes the retained renderer',loading:'pause/help/encounter survive load completion; exit cancels before delay and during pending load; stale world disposed without persistence; stale effect cannot re-enter game',loadError:'failed world load retains save and global Protection; exit remains available',firstTitle:'actual scene effect presents preview; no save action, false save success, retreat mutation or preview persistence',corruptStorage:'existing session continues without replacing corrupt bytes; cold new game remains blocked'},null,2));
 }
 console.log(JSON.stringify({suite:'protection',retreat:'original values and inventory preserved; persisted reload equal',pause:'world frames and active meal durations frozen; held key and pointer lock released; cancelled delayed attack cannot hit',presentation:'all five modes render through real frame path with unchanged save and simulation timers; pause/help/hidden freezes visual frames; reduced motion freezes visual time; checkpoint/reload preserves meal duration; active fire buff preserves remaining duration on resume; gameplay camera, visibility and clouds restored',audio:'silent initial setting, suspend/resume checked',runtime:'aborted preload cannot construct world; pending deduplicated; stale generation disposed without persistence; newer world retained; QA hook removed',storage:'quota failure returns false; corrupt JSON and unsupported shape preserved verbatim, replacement refused' },null,2));
}
if(!BASELINE){
 // Separate bundled state/store instances share only their controlled browser storage.
 const originalStorage=globalThis.localStorage,tabMemory=new Map(),key='phaenomenautik3-save-v1';
 const tabStorage={getItem:k=>tabMemory.get(k)??null,setItem:(k,v)=>tabMemory.set(k,v),removeItem:k=>tabMemory.delete(k)};
 globalThis.localStorage=tabStorage;
 try{
  assert.equal(saveTabA.loadSave(),null);assert.equal(saveTabB.loadSave(),null);
  const a=saveTabA.newGame(),b=saveTabB.newGame();
  assert.equal(saveTabA.persistSave(a),true);a.wood=7;
  assert.equal(saveTabA.persistSave(a),true);assert.equal(saveTabA.persistSave(a),true);
  const aRaw=tabMemory.get(key);b.wood=19;
  assert.equal(saveTabB.persistSave(b),false);assert.equal(tabMemory.get(key),aRaw);
  assert(tabStoreB.get().saveError.includes('nicht überschrieben'));assert.equal(tabStoreA.get().saveError,null);assert.equal(b.wood,19);
  // Direct initial resume records original bytes before any normalisation or write.
  const resumed=saveTabB.loadSave();assert(resumed);resumed.wood=11;
  assert.equal(saveTabB.persistSave(resumed),true);resumed.crystals=2;
  assert.equal(saveTabB.persistSave(resumed),true);const bRaw=tabMemory.get(key);
  assert.equal(saveTabA.persistSave(a),false);assert.equal(tabMemory.get(key),bRaw);
  const inspected=saveTabA.loadSave();assert(inspected);
  assert.equal(saveTabA.persistSave(a),false);assert.equal(tabMemory.get(key),bRaw);
  // A preview/new journey must not re-authorise an older live save.
  const journey=saveTabA.newGame();assert.equal(saveTabA.persistSave(a),false);
  assert.equal(tabMemory.get(key),bRaw);assert.equal(saveTabA.persistSave(journey),true);
  assert.equal(tabStoreA.get().saveError,null);journey.wood=3;
  assert.equal(saveTabA.persistSave(journey),true);const journeyRaw=tabMemory.get(key);
  assert.equal(saveTabB.persistSave(resumed),false);assert.equal(tabMemory.get(key),journeyRaw);
  // The real provisional-duel save is a shallow copy; both share the same origin.
  assert.equal(saveTabA.persistSave({...journey,crystals:4}),true);
  assert.equal(saveTabA.persistSave(journey),true);
  const beforeUntracked=tabMemory.get(key);
  assert.equal(saveTabA.persistSave(JSON.parse(beforeUntracked)),false);assert.equal(tabMemory.get(key),beforeUntracked);
  tabMemory.delete(key);assert.equal(saveTabA.persistSave(journey),false);assert.equal(tabMemory.has(key),false);
  const afterDeletion=saveTabA.newGame();assert.equal(saveTabA.persistSave(afterDeletion),true);
  const quotaSave=saveTabB.loadSave(),beforeQuota=tabMemory.get(key);quotaSave.wood=5;
  tabStorage.setItem=()=>{throw Error('controlled quota')};
  assert.equal(saveTabB.persistSave(quotaSave),false);assert.equal(tabMemory.get(key),beforeQuota);
  tabStorage.setItem=(k,v)=>tabMemory.set(k,v);
  assert.equal(saveTabB.persistSave(quotaSave),true);assert.equal(tabStoreB.get().saveError,null);
  const legacy=saveTabA.newGame();delete legacy.graph;delete legacy.player.maxStamina;delete legacy.player.stamina;
  const legacyRaw=JSON.stringify(legacy,null,2);tabMemory.set(key,legacyRaw);
  const migrated=saveTabA.loadSave();assert(migrated);assert(migrated.graph);assert(migrated.player.maxStamina);
  assert.equal(saveTabA.persistSave(migrated),true);assert.notEqual(tabMemory.get(key),legacyRaw);
  assert.equal(saveTabA.persistSave(migrated),true);
  // A stale explicit journey also preserves bytes changed after its creation.
  const staleJourney=saveTabA.newGame(),other=saveTabB.loadSave();other.wood=23;
  assert.equal(saveTabB.persistSave(other),true);const otherRaw=tabMemory.get(key);
  assert.equal(saveTabA.persistSave(staleJourney),false);assert.equal(tabMemory.get(key),otherRaw);
  tabMemory.set(key,'');assert.equal(saveTabA.loadSave(),null);assert.equal(saveTabA.hasUnreadableSave(),true);
  assert.equal(saveTabA.persistSave(saveTabA.newGame()),false);assert.equal(tabMemory.get(key),'');
  // Even direct newGame in the other fresh session cannot replace corrupt origin bytes.
  assert.equal(saveTabB.hasUnreadableSave(),false);
  assert.equal(saveTabB.persistSave(saveTabB.newGame()),false);assert.equal(saveTabB.hasUnreadableSave(),true);assert.equal(tabMemory.get(key),'');
  console.log(JSON.stringify({suite:'multi-tab-storage',isolation:'two independent state and store module instances share only controlled storage',writes:'first write, own repeated writes, direct resume and legacy normalisation succeed; shallow duel copy retains origin',conflicts:'later reads and new previews do not re-authorise stale live saves; changed or removed bytes remain exact; stale explicit journey refuses replacement',recovery:'explicit new journey can replace its unchanged origin; quota retry preserves origin and clears error; empty corrupt bytes stay unchanged',limit:'comparison and setItem are separate synchronous storage operations; this is not an atomic cross-tab transaction'},null,2));
 }finally{globalThis.localStorage=originalStorage;}
}
console.log(JSON.stringify({suite:'audit-summary',executedAssertions:assertions,source:${JSON.stringify(base?'3343519':'working tree')}},null,2));
`;
await build({stdin:{contents:source,resolveDir:repo,loader:'ts'},outfile:auditDir+(base?'/baseline.mjs':'/current.mjs'),bundle:true,platform:'node',format:'esm',define:{BASELINE:String(base),'import.meta.env.BASE_URL':'"/"'},plugins:[{name:'constructor-free-audit',setup(build){
build.onResolve({filter:/^audit-save-(tab|store)-[ab]$/},args=>({path:args.path,namespace:'save-tabs'}));
build.onResolve({filter:/^\.\/store$/,namespace:'save-tabs'},args=>({path:'audit-save-store-'+args.importer.slice(-1),namespace:'save-tabs'}));
build.onLoad({filter:/.*/,namespace:'save-tabs'},args=>({contents:readFileSync(resolve(repo,'src/game',args.path.includes('-store-')?'store.ts':'state.ts'),'utf8'),loader:'ts',resolveDir:resolve(repo,'src/game')}));
build.onLoad({filter:/\/src\/.*\.(ts|tsx)$/},args=>{
 const path=relative(repo,args.path);
 let code=base?execFileSync('git',['show','3343519:'+path],{cwd:repo,encoding:'utf8'}):readFileSync(args.path,'utf8');
 if(!base&&path==='src/three/assets.ts'){
  const parsed=ts.createSourceFile(args.path,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
  const preload=parsed.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='preloadAll');
  code=code.slice(0,preload.body.pos)+' {await globalThis.__preloadGate;}'+code.slice(preload.body.end);
 }
 if(path!=='src/three/world.ts')return{contents:code,loader:path.endsWith('tsx')?'tsx':'ts'};
 // Keep the actual frame, collection, retreat, and persistence code.
 // Replace only the visual constructor; no WebGL or scene assets are claimed here.
 const parsed=ts.createSourceFile(args.path,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const cls=parsed.statements.find(ts.isClassDeclaration);const ctor=cls.members.find(ts.isConstructorDeclaration);
 const start=code.indexOf('      const got = this.props.collectDriftwood');const end=code.indexOf('      this.updateSailCamera(dt);',start);
 if(start<0||end<0)throw Error('Collection source bounds missing');
 const auditMethod='\n auditCollection(){\n'+code.slice(start,end)+'\n}\n';
 code=code.slice(0,ctor.body.pos)+' {this.container=container;this.save=save;}'+code.slice(ctor.body.end);
 code=code.slice(0,ctor.pos)+auditMethod+code.slice(ctor.pos);
 return{contents:code,loader:'ts'};
})}}],logLevel:'warning'});

process.stdout.write(execFileSync(process.execPath,[auditDir+(base?'/baseline.mjs':'/current.mjs')],{encoding:'utf8'}));
