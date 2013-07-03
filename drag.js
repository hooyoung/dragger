(function() {
  var BADCOLOR, DRAGTHRES, MINDIM, SELCOLOR, UNSELCOLOR, addrect, canvas, ctx, dosel, draw, drawRect, getmousepos, goodrect, ht, img, initialized, keydown, keyup, mousedown, mousemove, mousemoved, mouseup, mousewasdown, mov_orig_x, mov_orig_y, mx, my, rects, sel, sel_mov, sel_x1, sel_x2, sel_y1, sel_y2, selidx, wd;
  img = null;
  initialized = false;
  UNSELCOLOR = 'rgba(255,180,37,.5)';
  BADCOLOR = 'rgba(255,37,37,.5)';
  SELCOLOR = 'rgba(255,230,37,.5)';
  DRAGTHRES = 10;
  MINDIM = 20;
  rects = null;
  sel = null;
  selidx = null;
  sel_x1 = 0;
  sel_x2 = 0;
  sel_y1 = 0;
  sel_y2 = 0;
  sel_mov = 0;
  mov_orig_x = 0;
  mov_orig_y = 0;
  canvas = null;
  ctx = null;
  wd = 0;
  ht = 0;
  mx = my = 0;
  mousewasdown = false;
  mousemoved = false;
  getmousepos = function(e) {
    mx = e.pageX - canvas.offsetLeft;
    my = e.pageY - canvas.offsetTop;
  };
  dosel = function() {
    var i, rect, _len;
    for (i = 0, _len = rects.length; i < _len; i++) {
      rect = rects[i];
      if ((rect.x1 <= mx && mx <= rect.x2) && (rect.y1 <= my && my <= rect.y2)) {
        selidx = i;
        return;
      }
    }
    selidx = -1;
  };
  mousemove = function(e) {
    var changecursor, i, rect, _len;
    changecursor = false;
    getmousepos(e);
    if (!mousewasdown) {
      for (i = 0, _len = rects.length; i < _len; i++) {
        rect = rects[i];
        if ((rect.x1 <= mx && mx <= rect.x2) && (rect.y1 <= my && my <= rect.y2)) {
          changecursor = true;
          document.body.style.cursor = my >= rects[i].y2 - DRAGTHRES ? mx >= rects[i].x2 - DRAGTHRES ? 'se-resize' : mx <= rects[i].x1 + DRAGTHRES ? 'sw-resize' : 's-resize' : my <= rects[i].y1 + DRAGTHRES ? mx >= rects[i].x2 - DRAGTHRES ? 'ne-resize' : mx <= rects[i].x1 + DRAGTHRES ? 'nw-resize' : 'n-resize' : mx >= rects[i].x2 - DRAGTHRES ? 'e-resize' : mx <= rects[i].x1 + DRAGTHRES ? 'w-resize' : 'auto';
        }
      }
      if (!changecursor) {
        document.body.style.cursor = 'crosshair';
      }
      return;
    }
    if (sel_x1) {
      if (mx < sel.x2) {
        sel.x1 = mx;
      } else if (mx === sel.x2) {
        sel.x1 = mx - 1;
      } else {
        sel.x1 = sel.x2;
        sel.x2 = mx;
        sel_x1 = false;
        sel_x2 = true;
      }
    } else if (sel_x2) {
      if (mx > sel.x1) {
        sel.x2 = mx;
      } else if (mx === sel.x1) {
        sel.x2 = mx + 1;
      } else {
        sel.x2 = sel.x1;
        sel.x1 = mx;
        sel_x1 = true;
        sel_x2 = false;
      }
    }
    if (sel_y1) {
      if (my < sel.y2) {
        sel.y1 = my;
      } else if (my === sel.y2) {
        sel.y1 = my - 1;
      } else {
        sel.y1 = sel.y2;
        sel.y2 = my;
        sel_y1 = false;
        sel_y2 = true;
      }
    } else if (sel_y2) {
      if (my > sel.y1) {
        sel.y2 = my;
      } else if (my === sel.y1) {
        sel.y2 = my + 1;
      } else {
        sel.y2 = sel.y1;
        sel.y1 = my;
        sel_y1 = true;
        sel_y2 = false;
      }
    }
    if (selidx === -1) {
      selidx = rects.length;
      sel = {
        x1: mx,
        x2: mx + 1,
        y1: my,
        y2: my + 1
      };
      sel_x1 = sel_y1 = sel_mov = false;
      sel_x2 = sel_y2 = true;
    } else if (sel_mov) {
      sel.x1 = rects[selidx].x1 + mx - mov_orig_x;
      sel.x2 = rects[selidx].x2 + mx - mov_orig_x;
      sel.y1 = rects[selidx].y1 + my - mov_orig_y;
      sel.y2 = rects[selidx].y2 + my - mov_orig_y;
    }
    mousemoved = true;
    draw();
  };
  mousedown = function(e) {
    getmousepos(e);
    if (!mousewasdown) {
      dosel();
      if ((0 <= selidx && selidx < rects.length)) {
        sel = {
          x1: rects[selidx].x1,
          x2: rects[selidx].x2,
          y1: rects[selidx].y1,
          y2: rects[selidx].y2
        };
        sel_x2 = mx >= sel.x2 - DRAGTHRES;
        sel_x1 = !sel_x2 && (mx <= sel.x1 + DRAGTHRES);
        sel_y2 = my >= sel.y2 - DRAGTHRES;
        sel_y1 = !sel_y2 && (my <= sel.y1 + DRAGTHRES);
        sel_mov = !(sel_x1 || sel_x2 || sel_y1 || sel_y2);
        mov_orig_x = mx;
        mov_orig_y = my;
      }
      draw();
    }
    mousewasdown = true;
    mousemoved = false;
  };
  mouseup = function(e) {
    var oldrect;
    if (mousewasdown) {
      if (selidx !== -1) {
        oldrect = (0 <= selidx && selidx < rects.length);
        if (goodrect(sel, selidx)) {
          rects[selidx] = {
            x1: sel.x1,
            x2: sel.x2,
            y1: sel.y1,
            y2: sel.y2
          };
          if (oldrect && !sel_mov) {
            selidx = -1;
          }
        } else {
          selidx = -1;
        }
      }
      draw();
      mousewasdown = false;
    }
  };
  keydown = function(e) {};
  keyup = function(e) {
    if (e.which === 46 || e.which === 8) {
      if ((0 <= selidx && selidx < rects.length)) {
        rects.splice(selidx, 1);
      }
      selidx = -1;
      mousewasdown = false;
      draw();
    }
  };
  goodrect = function(rect, ignoreidx) {
    return !(rect.x2 - rect.x1 < MINDIM || rect.y2 - rect.y1 < MINDIM || rect.x1 < 0 || rect.x2 >= wd || rect.y1 < 0 || rect.y2 >= ht);
  };
  addrect = function(x1, x2, y1, y2) {
    var cpy;
    cpy = {
      x1: Math.min(x1, x2),
      x2: Math.max(x1, x2),
      y1: Math.min(y1, y2),
      y2: Math.max(y1, y2)
    };
    if (goodrect(cpy)) {
      rects[rects.length] = cpy;
    }
    draw();
  };
  drawRect = function(rect) {
    ctx.fillRect(rect.x1, rect.y1, rect.x2 - rect.x1, rect.y2 - rect.y1);
    ctx.strokeRect(rect.x1, rect.y1, rect.x2 - rect.x1, rect.y2 - rect.y1);
  };
  draw = function() {
    var i, rect, _len;
    ctx.clearRect(0, 0, wd, ht);
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = '#000';
    ctx.fillStyle = UNSELCOLOR;
    for (i = 0, _len = rects.length; i < _len; i++) {
      rect = rects[i];
      if (selidx !== i) {
        drawRect(rect);
      }
    }
    if (selidx >= 0) {
      ctx.strokeStyle = '#f00';
      if (goodrect(sel, selidx)) {
        ctx.fillStyle = SELCOLOR;
      } else {
        ctx.fillStyle = BADCOLOR;
      }
      drawRect(sel);
    }
    $("div").text(JSON.stringify(rects));
  };
  this.init = function(url, newrects) {
    img = new Image();
    img.onload = function() {
      var i, rect, _len;
      rects = [];
      sel = null;
      selidx = -1;
      sel_x1 = sel_x2 = sel_y1 = sel_y2 = sel_mov = false;
      mov_orig_x = mov_orig_y = 0;
      mx = my = 0;
      mousewasdown = false;
      mousemoved = false;
      wd = img.width;
      ht = img.height;
      $(canvas).attr("width", wd);
      $(canvas).attr("height", ht);
      if (!initialized) {
        $(canvas).mousedown(mousedown);
        $(canvas).mouseup(mouseup);
        $(canvas).mousemove(mousemove);
        $(canvas).mouseleave(mouseup);
        $(document).keydown(keydown);
        $(document).keyup(keyup);
      }
      initialized = true;
      for (i = 0, _len = newrects.length; i < _len; i++) {
        rect = newrects[i];
        if (goodrect(rect)) {
          rects[rects.length] = rect;
        }
      }
      draw();
    };
    img.src = url;
  };
  $(function() {
    canvas = $('canvas')[0];
    if (canvas && canvas.getContext) {
      ctx = canvas.getContext('2d');
      if (ctx !== null) {
        init('base.png', []);
      }
    }
  });
}).call(this);
