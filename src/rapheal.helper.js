/**
 * Rapheal Helper
 * A library to help you use raphealjs more easily. Licensed under the MIT license.
 * Notice: Loaded after rapheal.js.
 * @Version 0.0.1
 * @Author kate.sf@alibaba-inc.com
 **/

(function (R) {
  var El = R.el;

  R.fn.eventMask = R.fn.eventMask || function (els, boxEl) {
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

  var MAX_DIST = 99999999;
  R.fn.delegate = R.fn.delegate || function (els, event, handler) {
    var events = {click: 1, dblclick: 1, mousedown: 1, mousemove: 1, mouseout: 1,
      mouseover: 1, mouseup: 1, hover: 1, drag: 1};

    var width = this.width || 0;
    var height = this.height || 0;
    this._delegateMask = this._delegateMask || this.rect(0, 0, width, height).attr({fill: '#ffffff', opacity: 0});

    var _args = [].slice.apply(arguments, 2);
    if (!events[event]) {
      return null;
    }
    this._delegateMask.els = this._delegateMask.els || [];
    var _els = this._delegateMask.els;
    for (var i = 0, l = els.length; i < l; i++) {
      if (els[i].removed) {
        continue;
      }
      _els.push(els[i]);
    }
    createZIndex(this);
    for (var i = 0; i < _args.length; i++) {
      var _oarg = _args[i];
      _args[i] = function (evt) {
        var _needEl = null;
        var cx = evt.clientX;
        var cy = evt.clientY;
        for (var i = 0, l = _els.length; i < l; i++) {
          var _el = _els[i];
          var _eb = _el.getBBox();
          _el.__centerp = [(_eb.x2 - _eb.x) / 2 + _eb.x, (_eb.y2 - _eb.y) / 2 + _eb.y];
          _el.__dist = Math.sqrt((__centerp[0] - cx) * (__centerp[0] - cx) + (__centerp[1] - cy) * (__centerp[1] - cy));
          switch (_el.type) {
            case 'rect':
            case 'image':
            case 'text':
              var _min = Math.sqrt(_eb.width * _eb.width + _eb.height * _eb.height) / 2;
              _el.__dist = _el.__dist <= _min ? _el.__dist : MAX_DIST;
              break;
            case 'circle':
            case 'ellipse':
              var _min = _eb.width === _eb.height ? _eb.width / 2 : (_eb.width > _eb.height ? _eb.height / 2 : _eb.width / 2);
              _el.__dist = _el.__dist <= _min ? _el.__dist : MAX_DIST;
              break;
            case 'path':
              // TODO: support path
              _el.__dist = MAX_DIST;
              break;
            default:
              _el.__dist = MAX_DIST;
              break;
          }
          if (!_needEl || ((_needEl.__dist >= _el.dist) && (_el.__zIndex >= _needEl.__zIndex))) {
            _needEl = _el;
          }
        }
        _oarg.apply(_needEl, evt);
      };
    }
    this._delegateMask[event].apply(this, _args);
  };

  R.fn.setFontStyle = R.fn.setFontStyle || function (fontStr) {
    fontStr = fontStr || '';
    fontStr = fontStr.split(' ');
    if (fontStr.length <= 1 && fontStr[0].length <= 1) {
      return;
    }
    var fontWeight = null;
    var fontSize = null;
    var fontFamily = null;
    for (var i = 0; i < fontStr.length; i++) {
      var st = fontStr[i].toLowerCase();
      if (st === 'bold' || st === 'normal') {
        fontWeight = st;
      } else if (st.indexOf('px') >= 1 && st.indexOf('px') + 3 === st.length) {
        fontSize = st;
        continue;
      } else if (st.length > 2) {
        fontFamily = st;
      }
    }
    this._fontStyleAttr = this._fontStyleAttr || {};
    if (fontWeight) {
      this._fontStyleAttr['font-weight'] = fontWeight;
    }
    if (fontSize) {
      this._fontStyleAttr['font-size'] = fontSize;
    }
    if (fontFamily) {
      this._fontStyleAttr['font-family'] = fontFamily;
    }
  };
  var _r_text = R.fn.text;
  R.fn.text = function () {
    return _r_text.apply(this, arguments).attr(this._fontStyleAttr || {});
  }

  El.toSetFront = El.toSetFront || function (els) {
    if (this.removed) {
      return this;
    }
    var paper = this.paper;
    var nodeMap = createZIndex(paper);
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
    this.parentNode.removeChild(this);
    this.parentNode.insertBefore(this, this.next);
    return this;
  };

  function createZIndex (paper) {
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
    return nodeMap;
  }

})(window.Raphael);