(function(){
  var LANG_KEY = 'dhe_lang';

  function getLang(){
    return localStorage.getItem(LANG_KEY) || 'tr';
  }

  function applyLang(lang){
    document.body.setAttribute('data-lang', lang);
    // data-tr / data-en attribute'u olan tüm elemanların metnini güncelle (nav, footer, butonlar)
    document.querySelectorAll('[data-tr][data-en]').forEach(function(el){
      el.textContent = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-tr');
    });
    document.querySelectorAll('[data-lang-toggle] button').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-set-lang') === lang);
    });
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'tr');
  }

  function setLang(lang){
    localStorage.setItem(LANG_KEY, lang);
    applyLang(lang);
  }

  function wireHeader(){
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-primary-nav]');
    if(toggle && nav){
      toggle.addEventListener('click', function(){ nav.classList.toggle('open'); });
    }
    document.querySelectorAll('[data-set-lang]').forEach(function(btn){
      btn.addEventListener('click', function(){ setLang(btn.getAttribute('data-set-lang')); });
    });
    // aktif sayfayı nav'da işaretle
    var blogLink = document.querySelector('[data-nav-blog]');
    if(blogLink && location.pathname.indexOf('/blog') === 0){
      blogLink.classList.add('active');
    }
  }

  function loadPartial(selector, url, cb){
    var host = document.querySelector(selector);
    if(!host) { if(cb) cb(); return; }
    fetch(url).then(function(r){ return r.text(); }).then(function(html){
      host.outerHTML = html;
      if(cb) cb();
    }).catch(function(){
      // Yerel dosya olarak (file://) açıldığında fetch çalışmaz; bu durumda sessizce geç.
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var pending = 2;
    function done(){
      pending--;
      if(pending === 0){
        wireHeader();
        applyLang(getLang());
        document.dispatchEvent(new CustomEvent('partialsLoaded'));
      }
    }
    loadPartial('#site-header', '/partials/header.html', done);
    loadPartial('#site-footer', '/partials/footer.html', done);
  });
})();
