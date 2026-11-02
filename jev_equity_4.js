/* JEV_EQUITY_V1 */
(()=>{'use strict';
const ns='http://www.w3.org/2000/svg';
const node=(tag,attrs={},txt)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));if(txt!==undefined)e.textContent=String(txt);return e;};
const cash=x=>(x>=0?'+':'')+x.toFixed(2)+'u';
function render(key,items){
 const summary=document.getElementById('jev-eq'+key+'-summary'),root=document.getElementById('jev-eq'+key+'-plot');
 if(!summary||!root)return;
 items=items.filter(r=>Number.isFinite(r.profit)&&!Number.isNaN(Date.parse(r.date)))
 .sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)||String(a.id).localeCompare(String(b.id)));
 if(!items.length){summary.textContent='Brak danych';return;}
 let total=0,w=0;const vals=[0];for(const r of items){total+=r.profit;vals.push(total);if(r.profit>0)w++;}
 const roi=total/items.length*100; summary.textContent=`N=${items.length} | WIN=${w} | ROI=${roi.toFixed(1)}% | ${cash(total)}`;
 summary.style.color=total>=0?'var(--good,#86efac)':'var(--bad,#fca5a5)';
 const W=600,H=220,L=52,R=14,T=15,B=32,min=Math.min(0,...vals),max=Math.max(0,...vals),pad=Math.max(1,(max-min)*.1);
 const lo=min-pad,hi=max+pad,x=i=>L+(W-L-R)*i/(vals.length-1),y=v=>T+(H-T-B)*(hi-v)/(hi-lo);
 const svg=node('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':`Krzywa kapitału ${key} ${cash(total)}`});
 for(let j=0;j<5;j++){const v=lo+(hi-lo)*j/4,yy=y(v);svg.append(node('line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#34415d'}));svg.append(node('text',{x:L-6,y:yy+4,fill:'#96a7c6','font-size':12,'text-anchor':'end'},v.toFixed(1)));}
 svg.append(node('path',{d:vals.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(v).toFixed(1)).join(' '),fill:'none',stroke:'#86efac','stroke-width':2.5}));
 svg.append(node('circle',{cx:x(vals.length-1),cy:y(total),r:3.5,fill:'#86efac'}));
 svg.append(node('text',{x:L,y:H-7,fill:'#96a7c6','font-size':12},items[0].date.slice(0,10)));
 svg.append(node('text',{x:W-R,y:H-7,fill:'#96a7c6','font-size':12,'text-anchor':'end'},items[items.length-1].date.slice(0,10)));
 root.replaceChildren(svg);
}
const load=async p=>{const r=await fetch(p+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error(p+' HTTP '+r.status);return r.json();};
(async()=>{
const [coupons,singles]=await Promise.allSettled([load('./results_coupons.json'),load('./jev_value_v3_singles.json')]);
if(coupons.status==='fulfilled'){
const rows=coupons.value.coupons||[];
for(const [variant,key] of [['TOP3','3'],['TOP4','4'],['TOP5','5']])render(key,rows.filter(c=>String(c.variant||c.size_variant||'').toUpperCase().includes(variant)&&c.profit_1u!==null&&c.profit_1u!==undefined)
.map(c=>({date:c.date||c.run_dt||'',profit:Number(c.profit_1u),id:c.coupon_id||c.lock_id||''})));
}else for(const key of ['3','4','5'])document.getElementById('jev-eq'+key+'-summary').textContent='Nie udało się pobrać wyników kuponów';
if(singles.status==='fulfilled')render('v',(singles.value.legs||[]).map(x=>({date:x.date,profit:Number(x.profit),id:x.id})));
else document.getElementById('jev-eqv-summary').textContent='Brak jev_value_v3_singles.json — wykonaj eksport VALUE';
})();
})(); /* /JEV_EQUITY_V1 */