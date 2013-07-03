#!/usr/bin/env python

import json
for i,x in enumerate(json.load(open('rectz'))):
  print 'convert -fill white -stroke black -strokewidth 2 -draw "stroke-dasharray 5 5 rectangle %d,%d %d,%d" base.png %02d.png' % (x['x1'],x['y1'],x['x2'],x['y2'],i)
