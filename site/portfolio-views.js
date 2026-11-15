const EMAIL='roger@rogermckz.dev';
const YOUTUBE='https://www.youtube.com/@RogerMcKenzie1';
const RESUME='https://docs.google.com/document/d/15JX0X1Reny-b6ptbkC4ADLikTLXrJYg3';
const svg=d=>`<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICON={
 menu:svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
 out:svg('<path d="M7 17 17 7M9 7h8v8"/>'),
 left:svg('<path d="m15 6-6 6 6 6"/>'),
 right:svg('<path d="m9 6 6 6-6 6"/>'),
 play:svg('<path d="M7 5v14l12-7z"/>'),
 grid:svg('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
 photo:svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 17 5-5 4 4 3-3 4 4"/>'),
 video:svg('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>'),
 mail:svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>'),
 down:svg('<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>')
};
const external='target="_blank" rel="noopener noreferrer"';
const socialLinks=`<div class="lcd-links"><a href="https://github.com/RogerMcKenzie" ${external}>GitHub</a><a href="https://www.linkedin.com/in/rogermckenzie/" ${external}>LinkedIn</a><a href="${YOUTUBE}" ${external}>YouTube</a></div>`;

const photos=[
 {src:'assets/photography/sunset-cathedral.jpg',alt:'Orange sunset over a cathedral silhouette and city rooftops',title:'Cathedral sunset',location:'Washington, DC',year:'2026'},
 {src:'assets/photography/terrace-lights.jpg',alt:'Rooftop terrace with string lights over a city at night',title:'Terrace lights',location:'',year:'2026'},
 {src:'assets/photography/caesars-palace.jpg',alt:'Caesars Palace entrance at golden hour with crowds on the Las Vegas Strip',title:'Caesars Palace',location:'Las Vegas, NV',year:'2026'},
 {src:'assets/photography/north-beach-night.jpg',alt:'North Beach street scene at night with neon signs and city lights',title:'North Beach nights',location:'San Francisco, CA',year:'2026'}
];
// Add a video with its YouTube id; 'vertical' is for Shorts. The grid fills the last slot
// with a link to the channel while there are fewer than four.
const videos=[
 {id:'hrOAiSEx3Ww',title:'AfroTech 2025',location:'Houston, TX',year:'2025',vertical:true}
];
const lists={
 work:{label:'Apps I’ve built',items:[
  {name:'Studio Stack',text:'Production scheduling, brief intake and gear reservations for The Agency at UF. As lead developer I built the cloud backend with role-based sign-in and workflow tracking.',meta:'TypeScript, AWS Lambda, PostgreSQL, S3'},
  {name:'ResMatch',text:'Tailors a résumé to the job description you’re applying for.',meta:'Next.js, TypeScript, OpenAI'},
  {name:'SnapCal',text:'A Chrome extension that turns events on a webpage into Google Calendar entries, with a preview to check before saving.',meta:'Chrome extension, Gemini, Google Calendar'},
  {name:'Jenna’s Recipes',img:'assets/jennas-recipes.jpg',text:'Search recipes by ingredient, get Gemini suggestions and keep a shopping list between visits.',meta:'React, TypeScript, MUI',url:'https://jennarecipes.vercel.app',cta:'Open the app'}
 ]},
 about:{label:'About me',items:[
  {name:'Background',img:'assets/profile.jpg',text:'I’m from Miami and the first in my family to go to college. I study Information Systems at the University of Florida, with minors in Computer Science and Statistics.',links:true},
  {name:'Experience',img:'assets/profile.jpg',text:'Software engineering intern at Amazon in Arlington, Virginia, in 2025 and 2026. Lead developer at The Agency at UF since April 2026.'},
  {name:'Off the clock',img:'assets/profile.jpg',text:'Cooking, climbing, gaming and tinkering with a home server. I also make videos about tech on YouTube.',links:true}
 ]}
};
const menuPreviews={
 about:{img:'assets/profile.jpg',text:'Software developer and photographer at the University of Florida'},
 work:{img:'assets/jennas-recipes.jpg',text:'Studio Stack, ResMatch, SnapCal and Jenna’s Recipes'},
 photos:{img:'assets/photography/sunset-cathedral.jpg',text:'Four photographs from Washington, Las Vegas and San Francisco'},
 resume:{text:'Two software engineering internships at Amazon, and lead developer at The Agency at UF'},
 contact:{text:EMAIL}
};

function mobileListView(kind,{listIndex}){
 const {label,items}=lists[kind];
 if(kind==='about')return `<section class="mobile-about mobile-page"><h1>${label}</h1><img src="assets/profile.jpg" alt="Roger McKenzie" width="1512" height="1375" loading="lazy">${items.map(item=>`<section><h2>${item.name}</h2><p>${item.text}</p></section>`).join('')}${socialLinks}</section>`;
 return `<section class="mobile-projects mobile-page"><h1>${label}</h1>${items.map((item,i)=>`<details data-project="${i}" ${i===listIndex.work?'open':''}><summary>${item.name}${ICON.down}</summary><div class="mobile-project-detail">${previewHTML(item)}</div></details>`).join('')}</section>`;
}

function homeView(){
 return `<div class="lcd-live"><img class="lcd-feed" src="assets/profile.jpg" alt="Roger McKenzie" width="1512" height="1375" fetchpriority="high"><span class="lcd-where lcd-narrow lcd-shadow">Gainesville, FL</span><span class="lcd-status lcd-shadow" aria-hidden="true"><span class="lcd-rec"></span><span class="lcd-batt"><b></b></span></span><div class="lcd-focus" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="lcd-who lcd-shadow"><h1>Roger McKenzie</h1><p>Software developer and content creator</p></div><button class="lcd-menu-btn" data-open-menu aria-haspopup="true">${ICON.menu}Menu</button></div>`;
}
function previewHTML(item){
 return (item.img?`<img src="${item.img}" alt="" width="262" height="157" loading="lazy">`:'')
  +`<p>${item.text}</p>`
  +(item.meta?`<p class="lcd-meta">${item.meta}</p>`:'')
  +(item.url?`<a class="lcd-cta" href="${item.url}" ${external}>${item.cta}${ICON.out}</a>`:'')
  +(item.links?socialLinks:'');
}
function listView(kind,{listIndex,mobile}){
 if(mobile)return mobileListView(kind,{listIndex});
 const {label,items}=lists[kind];const index=listIndex[kind];
 return `<div class="lcd-list" data-list="${kind}"><h1 class="lcd-sr">${label}</h1><ul aria-label="${label}">${items.map((item,i)=>`<li><button data-item="${i}" aria-current="${i===index}">${item.name}</button></li>`).join('')}</ul><div class="lcd-preview" aria-live="polite">${previewHTML(items[index])}</div></div>`;
}
function photoPlace(p){return [p.location,p.year].filter(Boolean).join('<br>');}
function slideshowView({photoIndex}){
 const p=photos[photoIndex],n=photoIndex+1;
 return `<div class="lcd-show"><div class="lcd-show-img" role="region" tabindex="0" aria-label="Photograph ${n} of ${photos.length}. Swipe, scroll or use the arrow keys to browse"><img src="${p.src}" alt="${p.alt}" width="1574" height="2200" draggable="false"></div><div class="lcd-show-side is-left lcd-narrow"><span class="lcd-file">${ICON.play}100-${String(n).padStart(4,'0')}</span><h1>${p.title}</h1><span class="lcd-place">${photoPlace(p)}</span></div><div class="lcd-show-side is-right lcd-narrow"><span>${n} / ${photos.length}</span><div class="lcd-bars" aria-hidden="true">${photos.map((_,i)=>`<i class="${i===photoIndex?'is-on':''}"></i>`).join('')}</div><button class="lcd-all" data-photo-mode="index">${ICON.grid}All photos</button></div><button class="lcd-arrow is-prev" data-photo-step="-1" aria-label="Previous photograph">${ICON.left}</button><button class="lcd-arrow is-next" data-photo-step="1" aria-label="Next photograph">${ICON.right}</button></div>`;
}
function indexCaption({photoTab,videoIndex,photoIndex}){
 const list=photoTab==='videos'?videos:photos,index=photoTab==='videos'?videoIndex:photoIndex,p=list[index];
 return `<span>${p.title}</span><span class="lcd-dim">${p.year}</span><span class="lcd-dim">${index+1} / ${list.length}</span>`;
}
const videoThumb=v=>`https://i.ytimg.com/vi/${v.id}/${v.vertical?'oardefault':'maxresdefault'}.jpg`;
function thumbsHTML({photoTab,videoIndex,photoIndex}){
 if(photoTab==='photos')return photos.map((p,i)=>`<button data-photo="${i}" aria-current="${i===photoIndex}" aria-label="View ${p.title}"><img src="${p.src}" alt="" width="214" height="143" loading="lazy" draggable="false"></button>`).join('');
 const tiles=videos.map((v,i)=>`<button class="lcd-video-tile" data-video="${i}" aria-current="${i===videoIndex}" aria-label="Play ${v.title}"><img src="${videoThumb(v)}" alt="" width="214" height="143" loading="lazy" draggable="false"><span class="lcd-play-badge">${ICON.play}</span></button>`);
 if(videos.length<4)tiles.push(`<a class="lcd-channel-tile" href="${YOUTUBE}" ${external}><span>More on YouTube</span>${ICON.out}</a>`);
 return tiles.join('');
}
function indexView(state){
 const {photoTab}=state;
 return `<div class="lcd-page lcd-index"><h1 class="lcd-sr">Photographs</h1><div class="lcd-tabs lcd-narrow" role="tablist"><button role="tab" data-photo-tab="photos" aria-selected="${photoTab==='photos'}" class="${photoTab==='photos'?'is-on':''}">${ICON.photo}Photos</button><button role="tab" data-photo-tab="videos" aria-selected="${photoTab==='videos'}" class="${photoTab==='videos'?'is-on':''}">${ICON.video}Videos</button></div><div class="lcd-thumbs">${thumbsHTML(state)}</div><div class="lcd-index-cap" aria-live="polite">${indexCaption(state)}</div></div>`;
}
function resumeView(){
 return `<div class="lcd-resume"><div class="lcd-resume-top"><h1>Résumé</h1><a class="lcd-plain" href="${RESUME}/edit" ${external}>Open in Google Docs</a><a class="lcd-cta" href="${RESUME}/export?format=pdf">${ICON.down}Download PDF</a></div><div class="lcd-doc resume-viewer" data-loading><span class="resume-loading" role="status">Loading résumé</span><iframe class="resume-frame" src="${RESUME}/preview" title="Roger McKenzie’s résumé" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div></div>`;
}
function contactView(){
 return `<div class="lcd-contact"><h1>Email me about internships, collaborations or photo work</h1><a class="lcd-cta" href="mailto:${EMAIL}">${ICON.mail}${EMAIL}</a>${socialLinks}</div>`;
}
function videoView({videoIndex}){
 const v=videos[videoIndex],n=videoIndex+1,many=videos.length>1;
 return `<div class="lcd-show lcd-movie"><div class="lcd-show-img${v.vertical?' is-vertical':''}"><button class="lcd-poster" data-play-video aria-label="Play ${v.title}"><img src="${videoThumb(v)}" alt="" draggable="false"><span class="lcd-play-badge is-large">${ICON.play}</span></button></div><div class="lcd-show-side is-left lcd-narrow"><span class="lcd-file">${ICON.play}C${String(n).padStart(4,'0')}.MP4</span><h1>${v.title}</h1><span class="lcd-place">${photoPlace(v)}</span></div><div class="lcd-show-side is-right lcd-narrow"><span>${n} / ${videos.length}</span><div class="lcd-bars" aria-hidden="true">${videos.map((_,i)=>`<i class="${i===videoIndex?'is-on':''}"></i>`).join('')}</div><a class="lcd-all lcd-watch" href="https://www.youtube.com/watch?v=${v.id}" ${external}>Watch on YouTube${ICON.out}</a><button class="lcd-all" data-photo-mode="index">${ICON.grid}All videos</button></div>${many?`<button class="lcd-arrow is-prev" data-video-step="-1" aria-label="Previous video">${ICON.left}</button><button class="lcd-arrow is-next" data-video-step="1" aria-label="Next video">${ICON.right}</button>`:''}</div>`;
}
function viewHTML(view,state){
 const {photoMode}=state;
 if(view==='home')return homeView(state);
 if(view==='about'||view==='work')return listView(view,state);
 if(view==='photos')return photoMode==='index'?indexView(state):photoMode==='play'?videoView(state):slideshowView(state);
 if(view==='resume')return resumeView();
 return contactView();
}


export { photos, videos, lists, menuPreviews, previewHTML, slideshowView, indexCaption, viewHTML };
