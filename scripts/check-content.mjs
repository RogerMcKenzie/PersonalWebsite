// Check mixed-media identity, order, selection and direct project entry points.
import assert from 'node:assert/strict';
import {contentItems,selectedContentIndex,photos,videos,viewHTML,indexCaption} from '../site/portfolio-views.js';
const base={mobile:false,listIndex:{projects:0},photoMode:'index',photoTab:'all',allIndex:0,photoIndex:0,videoIndex:0};
const all=contentItems(base);
assert.equal(all.length,videos.length+photos.length);
assert.deepEqual(all.slice(0,videos.length).map(e=>e.item),videos);
assert.deepEqual(all.slice(videos.length).map(e=>e.item),photos);
for(const photoTab of ['all','videos','photos']){
 const state={...base,photoTab},items=contentItems(state);
 const html=viewHTML('photos',state);
 assert.deepEqual([...html.matchAll(/data-photo-tab="([^"]+)"/g)].map(m=>m[1]),['all','videos','photos']);
 assert.equal((html.match(/data-content-index=/g)||[]).length,items.length);
 assert.equal((html.match(/aria-current="true"/g)||[]).length,1);
 assert.match(html,new RegExp(`aria-labelledby="content-tab-${photoTab}"`));
}
for(let allIndex=0;allIndex<all.length;allIndex++){
 const state={...base,allIndex},entry=all[allIndex];
 assert.equal(selectedContentIndex(state),allIndex);
 assert.ok(indexCaption(state).includes(entry.item.title));
 assert.ok(indexCaption(state).includes(`${allIndex+1} / ${all.length}`));
 const html=viewHTML('photos',state);
 assert.match(html,new RegExp(`data-${entry.type}="${entry.index}" data-content-index="${allIndex}" aria-current="true"`));
}
assert.match(viewHTML('photos',{...base,photoMode:'show'}),/Back to content/);
assert.match(viewHTML('photos',{...base,photoMode:'play'}),/Back to content/);
for(const mobile of [false,true]){
 const html=viewHTML('projects',{...base,mobile});
 assert.match(html,/data-view="content\/videos"/);
 if(mobile)assert.match(html,/href="#content\/videos"/);
}
console.log('PASS: mixed media order/identity, filters, captions, selection, return labels and project shortcuts.');
