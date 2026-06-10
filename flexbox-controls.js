// Controls for interactive flexbox demo
(function(){
  const values = {
    justifyContent: ['flex-start','center','flex-end','space-between','space-around','space-evenly'],
    alignItems: ['flex-start','center','flex-end','stretch','baseline'],
    alignContent: ['flex-start','center','flex-end','space-between','space-around','stretch'],
    flexWrap: ['nowrap','wrap','wrap-reverse']
  };

  document.addEventListener('DOMContentLoaded', function() {
            const popoverButton = document.getElementById('popoverButton');
            const popoverContent = document.getElementById('popoverContent');
            if (!popoverButton || !popoverContent) return;

            // performance: use fixed positioning + transform to avoid layout thrashing
            popoverContent.style.position = 'fixed';
            popoverContent.style.willChange = 'transform, opacity';

            let shown = false;
            let rafId = null;

            function measureAndPosition() {
              // lire les layouts une seule fois
              const rect = popoverButton.getBoundingClientRect();
              const popRect = popoverContent.getBoundingClientRect();

              // par défaut, essayer au-dessus du bouton
              const vw = document.documentElement.clientWidth;
              const vh = document.documentElement.clientHeight;
              const padding = 10;

              // limiter horizontalement
              if (left < padding) left = padding;
              if (left + popRect.width > vw - padding) left = vw - popRect.width - padding;

              // si pas assez d'espace en haut, basculer en dessous
              if (top < padding) {
                top = rect.bottom + 10;
                // si dépasse bas de l'écran, recadrer
                if (top + popRect.height > vh - padding) top = Math.max(padding, vh - popRect.height - padding);
              }

              // appliquer via transform (meilleure perf que left/top fréquents)
              popoverContent.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
            }

            function schedulePosition() {
              if (rafId) cancelAnimationFrame(rafId);
              rafId = requestAnimationFrame(() => {
                measureAndPosition();
                rafId = null;
              });
            }

            function showPopover() {
              popoverContent.classList.add('show');
              // rendre visible pour mesurer correctement
              popoverContent.style.visibility = 'hidden';
              popoverContent.style.display = 'block';
              schedulePosition();
              // après la première position, rendre visible
              // schedule another rAF to ensure transform applied before visible
              requestAnimationFrame(() => { popoverContent.style.visibility = 'visible'; });
              // listeners
              window.addEventListener('resize', schedulePosition, {passive: true});
              window.addEventListener('scroll', schedulePosition, {passive: true});
              document.addEventListener('click', outsideClickHandler);
            }

            function hidePopover() {
              popoverContent.classList.remove('show');
              popoverContent.style.display = 'none';
              popoverContent.style.visibility = '';
              if (rafId) cancelAnimationFrame(rafId);
              window.removeEventListener('resize', schedulePosition);
              window.removeEventListener('scroll', schedulePosition);
              document.removeEventListener('click', outsideClickHandler);
              shown = false;
            }

            function outsideClickHandler(e) {
              if (!popoverContent.contains(e.target) && e.target !== popoverButton) {
                hidePopover();
              }
            }

            popoverButton.addEventListener('click', function(e) {
              e.stopPropagation();
              shown = !shown;
              if (shown) showPopover(); else hidePopover();
            });
          });

  // Main interactive section
  const propSelect = document.getElementById('propSelect');
  const valueSelect = document.getElementById('valueSelect');
  const applyBtn = document.getElementById('applyBtn');
  const resetBtn = document.getElementById('resetBtn');
  const demo = document.getElementById('interactiveContainer');
  const currentCss = document.getElementById('currentCss');

  function populateValues(prop, selectElement){
    selectElement.innerHTML = '';
    values[prop].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      selectElement.appendChild(opt);
    });
  }

  function apply(){
    const prop = propSelect.value;
    const val = valueSelect.value;
    if(prop === 'alignContent'){
      demo.style.alignContent = val;
    } else if(prop === 'flexWrap'){
      demo.style.flexWrap = val;
    } else {
      demo.style[prop] = val;
    }
    currentCss.textContent = `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val};`;
  }

  function applyPreset(key){
    if(key === 'spaceEvenly'){
      propSelect.value = 'justifyContent';
      populateValues('justifyContent', valueSelect);
      valueSelect.value = 'space-evenly';
      apply();
    }
    if(key === 'wrapAlignAround'){
      demo.style.flexWrap = 'wrap';
      propSelect.value = 'alignContent';
      populateValues('alignContent', valueSelect);
      valueSelect.value = 'space-around';
      apply();
      currentCss.textContent = `flex-wrap: wrap; align-content: space-around;`;
    }
  }

  function reset(){
    demo.style.justifyContent = '';
    demo.style.alignItems = '';
    demo.style.alignContent = '';
    demo.style.flexWrap = '';
    currentCss.textContent = '/* aucune */';
    propSelect.selectedIndex = 0;
    populateValues(propSelect.value, valueSelect);
  }

  propSelect.addEventListener('change', () => populateValues(propSelect.value, valueSelect));
  applyBtn.addEventListener('click', apply);
  resetBtn.addEventListener('click', reset);

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });

  populateValues(propSelect.value, valueSelect);

  // Section controls (pour les autres sections)
  document.querySelectorAll('.section-controls').forEach(controlsDiv => {
    const propSelect = controlsDiv.querySelector('.section-propSelect');
    const valueSelect = controlsDiv.querySelector('.section-valueSelect');
    const applyBtn = controlsDiv.querySelector('.section-applyBtn');
    const resetBtn = controlsDiv.querySelector('.section-resetBtn');
    const cssDisplay = controlsDiv.closest('.example').querySelector('.section-css');
    const container = controlsDiv.closest('.example').querySelector('.section-container');

    // Déterminer la propriété par défaut selon la section
    let defaultProp = 'justifyContent';
    if(propSelect){
      defaultProp = propSelect.querySelector('option').value;
      
      function populateSectionValues(){
        const prop = propSelect.value;
        valueSelect.innerHTML = '';
        values[prop].forEach(v => {
          const opt = document.createElement('option');
          opt.value = v; opt.textContent = v;
          valueSelect.appendChild(opt);
        });
      }

      propSelect.addEventListener('change', populateSectionValues);
      populateSectionValues();
    } else {
      // Si pas de propSelect, c'est une section simple avec seulement valueSelect
      defaultProp = 'justifyContent';
      if(controlsDiv.id === 'justifyContentControls'){
        defaultProp = 'justifyContent';
      } else if(controlsDiv.id === 'alignContentControls'){
        defaultProp = 'alignContent';
      } else if(controlsDiv.id === 'alignItemsControls'){
        defaultProp = 'alignItems';
      }
    }

    function applySectionStyle(){
      const prop = propSelect ? propSelect.value : defaultProp;
      const val = valueSelect.value;
      
      if(prop === 'alignContent'){
        container.style.alignContent = val;
      } else if(prop === 'flexWrap'){
        container.style.flexWrap = val;
      } else {
        container.style[prop] = val;
      }
      
      const propCss = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      if(cssDisplay){
        cssDisplay.textContent = `${propCss}: ${val};`;
      }
    }

    function resetSectionStyle(){
      container.style.justifyContent = '';
      container.style.alignItems = '';
      container.style.alignContent = '';
      container.style.flexWrap = '';
      if(cssDisplay){
        cssDisplay.textContent = '/* aucune */';
      }
      if(propSelect){
        propSelect.selectedIndex = 0;
        const prop = propSelect.value;
        valueSelect.innerHTML = '';
        values[prop].forEach(v => {
          const opt = document.createElement('option');
          opt.value = v; opt.textContent = v;
          valueSelect.appendChild(opt);
        });
      }
    }

    if(applyBtn) applyBtn.addEventListener('click', applySectionStyle);
    if(resetBtn) resetBtn.addEventListener('click', resetSectionStyle);
  });

  // Flex properties controls (flex-grow, flex-shrink, flex-basis)
  const flexGrowSelect = document.querySelector('.flex-grow-select');
  const flexShrinkSelect = document.querySelector('.flex-shrink-select');
  const flexBasisSelect = document.querySelector('.flex-basis-select');
  const flexPropertiesApplyBtn = document.querySelector('.flex-properties-applyBtn');
  const flexPropertiesResetBtn = document.querySelector('.flex-properties-resetBtn');
  const flexPropertiesCssDisplay = document.querySelector('.flex-properties-css');
  const flexPropertiesContainer = document.getElementById('flexPropertiesContainer');
  const flexPropertiesBoxes = flexPropertiesContainer ? flexPropertiesContainer.querySelectorAll('.box') : [];

  function applyFlexProperties(){
    if(!flexPropertiesContainer) return;
    
    const grow = flexGrowSelect.value;
    const shrink = flexShrinkSelect.value;
    const basis = flexBasisSelect.value;
    
    flexPropertiesBoxes.forEach(box => {
      box.style.flex = `${grow} ${shrink} ${basis}`;
    });
    
    if(flexPropertiesCssDisplay){
      flexPropertiesCssDisplay.textContent = `flex: ${grow} ${shrink} ${basis};`;
    }
  }

  function resetFlexProperties(){
    if(!flexPropertiesContainer) return;
    
    flexGrowSelect.value = '1';
    flexShrinkSelect.value = '1';
    flexBasisSelect.value = 'auto';
    
    flexPropertiesBoxes.forEach(box => {
      box.style.flex = '';
    });
    
    if(flexPropertiesCssDisplay){
      flexPropertiesCssDisplay.textContent = '/* aucune */';
    }
  }

  if(flexPropertiesApplyBtn){
    flexPropertiesApplyBtn.addEventListener('click', applyFlexProperties);
  }
  if(flexPropertiesResetBtn){
    flexPropertiesResetBtn.addEventListener('click', resetFlexProperties);
  }
})();
