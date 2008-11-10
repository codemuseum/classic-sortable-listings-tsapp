var ClassicSortableListingsEdit = {
  init: function() {
    this.uniqueCounter = 0;
    $$('div.app-classic-sortable-listings').each(function(el) {
      el.getElementsBySelector('.listing a').each(function(listing) { listing.observe('click', function(ev) { ev.stop(); }) }); // Allow the links to be draggable by turning off their behavior
      
      ClassicSortableListingsEdit._observeDrags(el);

      el.getElementsBySelector('a.new-page').each(function(newPage) { newPage.observe('click', function(ev) { ev.stop(); if (confirm("Are you sure you would like to cancel editing this page and make a new " + newPage.href.substring(newPage.href.indexOf('representing=') + 'representing='.length) + "?")) { document.location = newPage.href; } }) });

      el.ancestors().detect(function(anc) { return anc.tagName == 'FORM' }).observe('submit', function(ev) { ClassicSortableListingsEdit._saveOrder(el); });
      
      el.getElementsBySelector('.datapath a').each(function(a) { a.observe('click', function() {
        el.getElementsBySelector('.datapath .readonly')[0].addClassName('hidden');
        el.getElementsBySelector('.datapath .editable')[0].removeClassName('hidden');
        el.getElementsBySelector('.datapath .editable input')[0].focus();
      }); });
      
      var instance = ClassicSortableListingsEdit._appInstance(el);
      el.getElementsBySelector('a.add-listing').each(function(a) {
        a.observe('click', function(ev) { instance.popup(); instance.fetch(); });
      });
    });
  },
  
  _observeDrags: function(els) {
    els.getElementsBySelector('div.listings').each(function(l) { 
      Sortable.create(l,
          { scroll: window, scrollSensitivity: 40, scrollSpeed: 30, tag:'div'});
    });
  },
  
  _unobserveDrags: function(els) {
    els.getElementsBySelector('div.listings').each(function(l) { Sortable.destroy(l); });
  },
  
  _saveOrder: function(el) {
    urns = el.getElementsBySelector('a.listing-link').collect(function(l) { 
      return l.classNames().detect(function(c) { return c.startsWith('urn-'); }).substring('urn-'.length);
    });
    el.getElementsBySelector('input.piped-listings-value')[0].value = urns.join('|');
  },
  
  _appInstance: function(elem) {
    var obj = {
      init: function(el) { 
        this.el = el;
        this.listingsEl = el.getElementsBySelector('div.listings')[0];
        this.newHtml = this._extractCreationCode(el.getElementsBySelector('div.new-listing-code')[0]);
        var selector = el.getElementsBySelector('.selector')[0];
        this.createFetchable(selector.getElementsBySelector('a.source')[0], selector.getElementsBySelector('div.body')[0]);
        this.createPopdiv(selector);
        var thisRef = this;
        this.listingsEl.getElementsBySelector('div.listing').each(function (l) { thisRef._observeDelete(l); });
      },
      
      _observeDelete: function(listing) {
        listing.getElementsBySelector('div.remove a').each(function(a) {
          a.observe('click', function(ev) { ev.stop(); listing.remove(); });
        });
      },
      
      fetchSuccessful: function(transport) {
        var data = transport.responseText.evalJSON();
        var thisRef = this;
        this.fetchable.listEl.update('');
        data.each(function(d) {
          var newEl = thisRef._listingEl(thisRef.newHtml, d);
          thisRef.fetchable.listEl.appendChild(newEl);
        });
        this.observeFetched(this.fetchable.listEl);
      },
            
      observeFetched: function(fetchedEl) { 
        var thisRef = this;
        fetchedEl.getElementsBySelector('a.listing-link').each(function(elm) { elm.observe('click', function(ev) { 
          ev.stop(); 
          thisRef.selectFectched(elm); 
        }); });
      },
      
      selectFectched: function(fetchedEl) {
        fetchedEl.stopObserving('click');
        fetchedEl.observe('click', function(ev) {ev.stop();});
        var listing = fetchedEl.up().remove();
        this.listingsEl.appendChild(listing);
        this._observeDelete(listing);
        
        this.popdown();
        
        ClassicSortableListingsEdit._unobserveDrags(this.el);
        ClassicSortableListingsEdit._observeDrags(this.el);
      },
      
      _listingEl: function(html, values) {
        var newEl=$(document.createElement('div'));
        var newHtml = html.replace(/_INDEX_/, ClassicSortableListingsEdit.uniqueCounter++);
        if (values) {
          for (var m in values)
      			newHtml = newHtml.replace(new RegExp('_' + m.toUpperCase() + '_', 'g'), values[m]);
        }
        newEl.update(newHtml);
        return newEl.firstDescendant().remove();
      },
      
      _extractCreationCode: function(elm) { return elm.remove().innerHTML; }
      
    };

    Object.extend(obj, TS.Fetchable);
    Object.extend(obj, TS.Popdiv);
    obj.init(elem);
    return obj;
  }
}
ClassicSortableListingsEdit.init();