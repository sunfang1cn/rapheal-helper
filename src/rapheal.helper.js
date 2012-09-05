/**
 * Rapheal Helper
 * A library to help you use raphealjs more easily. Licensed under the MIT license.
 * Notice: Loaded after rapheal.js.
 * @Version 0.0.1
 * @Author kate.sf@alibaba-inc.com
 **/

(function (R) {
  var El = R.el;

  R.fn.eventMask = function (els, boxEl) {
    var maxBoxEl = null;
    if (boxEl && typeof boxEl.getBBox === 'function' && !boxEl.removed) {
      maxBoxEl = boxEl;
    } else {
      for (var i = 0, l = els.length; i < l; i++) {
        if (typeof els[i].getBBox === 'function') {
          var _box = els[i].getBBox();
          els[i].__area = _box.width() * _box.height();
          if (!maxBoxEl || maxBoxEl.__area <= els[i].__area) {
            maxBoxEl = els[i];
          }
        }
      }
    }
    maxBoxEl = maxBoxEl.clone();
    maxBoxEl.toSetFront(els).attr({'opacity': 0});
    return maxBoxEl;
  };

  El.toSetFront = function (els) {
    if (this.removed) {
      return this;
    }
    var paper = this.paper;
    var nodeMap = {};
    var i = 0;
    var current = paper.bottom;
    while (true) {
      if (current && current.id) {
        nodeMap[current.id] = i;
        current.__zIndex = i;
        i++;
      }
      if (current.next && current.next.id) {
        current = current.next;
      } else {
        break;
      }
    }
    R._tear(this, paper);
    var zMaxEl = null;
    for (i = 0, l = els.length; i < l; i++) {
      if (!zMaxEl || zMaxEl.__zIndex < els[i].__zIndex) {
        zMaxEl = els[i];
      }
    }
    this.prev = zMaxEl;
    this.next = zMaxEl.next;
    zMaxEl.next = this;
    return this;
  };

})(window.Raphael);