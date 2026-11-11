const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, rmSync, mkdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const guard = require('./check-dependency-update.cjs');
test('allows stable patch/minor increases and blocks regressions or risky specs', () => {
  for (const pair of [['^1.2.3','^1.2.4'],['~1.2.3','~1.3.0'],['v7','v7.0.1'],['0.2.3','0.2.4']]) assert.doesNotThrow(() => guard.safeVersion(...pair));
  for (const pair of [['^1.2.3','^1.2.2'],['^1.2.3','^2.0.0'],['0.2.3','0.3.0'],['^1.2.3','~1.2.4'],['1.2.3','latest'],['a'.repeat(40),'b'.repeat(40)]]) assert.throws(() => guard.safeVersion(...pair));
});
test('manifest checks preserve scripts, dependency identities, and runtime placement', () => {
  const before = {scripts:{start:'app'},dependencies:{a:'^1.0.0'},devDependencies:{b:'^2.0.0'}};
  assert.doesNotThrow(() => guard.manifest(JSON.stringify(before), JSON.stringify({...before,dependencies:{a:'^1.1.0'}})));
  for (const after of [{...before,scripts:{start:'other'}},{...before,dependencies:{}},{...before,dependencies:{},devDependencies:{...before.devDependencies,a:'^1.0.0'}}]) assert.throws(() => guard.manifest(JSON.stringify(before),JSON.stringify(after)));
});
test('workflow checks accept only action version changes', () => {
  const before = 'steps:\n  - uses: actions/checkout@v7\n  - run: npm ci';
  assert.doesNotThrow(() => guard.workflow(before,before.replace('@v7','@v7.0.1')));
  for(const after of [before.replace('@v7','@v8'),before.replace('npm ci','npm update'),before.replace('actions/checkout','other/action')]) assert.throws(() => guard.workflow(before,after));
});
test('real commit comparisons reject source changes and transitive lockfile downgrades', () => {
  const dir=mkdtempSync(join(tmpdir(),'dependency-guard-'));
  const git=(...args)=>execFileSync('git',['-C',dir,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const commit=()=>{git('add','.');git('-c','user.name=Test','-c','user.email=test@localhost','commit','--quiet','-m','fixture');return git('rev-parse','HEAD');};
  const run=(base,head)=>execFileSync(process.execPath,[join(__dirname,'check-dependency-update.cjs'),base,head],{cwd:dir,stdio:'pipe'});
  try {
    git('init','--quiet');
    const pkg={dependencies:{a:'^1.0.0'}};
    writeFileSync(join(dir,'package.json'),JSON.stringify(pkg));
    writeFileSync(join(dir,'package-lock.json'),JSON.stringify({lockfileVersion:3,packages:{'':pkg,'node_modules/a':{version:'1.0.0'}}}));
    writeFileSync(join(dir,'app.js'),'original');const base=commit();
    writeFileSync(join(dir,'package.json'),JSON.stringify({dependencies:{a:'^1.1.0'}}));const safe=commit();assert.doesNotThrow(()=>run(base,safe));
    writeFileSync(join(dir,'app.js'),'modified');const source=commit();assert.throws(()=>run(safe,source));
    writeFileSync(join(dir,'package-lock.json'),JSON.stringify({lockfileVersion:3,packages:{'':pkg,'node_modules/a':{version:'0.9.0'}}}));const lock=commit();assert.throws(()=>run(source,lock));
    mkdirSync(join(dir,'data'));writeFileSync(join(dir,'data','database.json'),'{}');const data=commit();assert.throws(()=>run(lock,data));
  } finally {rmSync(dir,{recursive:true,force:true});}
});
