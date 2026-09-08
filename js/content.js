/* Heilbrünnl — loads editable content from data/content.json (managed via /admin CMS) */
(function(){
  "use strict";

  var contentPromise = fetch('data/content.json')
    .then(function(r){ return r.ok ? r.json() : null; })
    .catch(function(){ return null; });

  function getPath(obj, path){
    return path.split('.').reduce(function(o, k){ return (o && o[k] !== undefined) ? o[k] : undefined; }, obj);
  }

  function fillList(ul, items, render){
    if (!ul || !items) return;
    ul.innerHTML = '';
    items.forEach(function(item){ ul.appendChild(render(item)); });
  }

  function menuItemEl(item){
    var li = document.createElement('li');
    var div = document.createElement('div');
    var b = document.createElement('b');
    b.textContent = item.name || '';
    var small = document.createElement('small');
    small.textContent = item.desc || '';
    div.appendChild(b);
    div.appendChild(small);
    li.appendChild(div);
    return li;
  }

  function featureEl(text){
    var li = document.createElement('li');
    li.textContent = text;
    return li;
  }

  function applyContent(data){
    if (!data) return;

    document.querySelectorAll('[data-cms]').forEach(function(el){
      var val = getPath(data, el.getAttribute('data-cms'));
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll('[data-cms-href]').forEach(function(el){
      var val = getPath(data, el.getAttribute('data-cms-href'));
      if (val !== undefined) el.setAttribute('href', val);
    });

    var menuGrid = document.querySelector('[data-cms-menu="grid"]');
    if (menuGrid && data.menu && Array.isArray(data.menu.categories)) {
      data.menu.categories.forEach(function(cat, i){
        var card = menuGrid.querySelector('[data-menu-card="' + i + '"]');
        if (!card) return;
        var titleEl = card.querySelector('[data-field="title"]');
        if (titleEl && cat.title) titleEl.textContent = cat.title;
        fillList(card.querySelector('[data-field="items"]'), cat.items, menuItemEl);
      });
    }

    var roomsGrid = document.querySelector('[data-cms-menu="rooms"]');
    if (roomsGrid && Array.isArray(data.rooms)) {
      data.rooms.forEach(function(room, i){
        var card = roomsGrid.querySelector('[data-room-card="' + i + '"]');
        if (!card) return;
        var nameEl = card.querySelector('[data-field="name"]');
        if (nameEl && room.name) nameEl.textContent = room.name;
        var tagEl = card.querySelector('[data-field="tag"]');
        if (tagEl && room.tag) tagEl.textContent = room.tag;
        var capEl = card.querySelector('[data-field="caption"]');
        if (capEl && room.caption) capEl.textContent = room.caption;
        var descEl = card.querySelector('[data-field="desc"]');
        if (descEl && room.desc) descEl.textContent = room.desc;
        fillList(card.querySelector('[data-field="features"]'), room.features, featureEl);
      });
    }
  }

  function ready(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function(){ contentPromise.then(applyContent); });
})();
