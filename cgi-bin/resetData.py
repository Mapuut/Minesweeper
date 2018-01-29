#!/usr/bin/python

import cgitb; cgitb.enable()
import json
import os


scores = '/tmp/highScores.txt'
saves = '/tmp/savedGames.txt'


f = open(scores, 'r+')
f.truncate()
f.close()

f = open(saves, 'r+')
f.truncate()
f.close()

f = open(saves, 'w')
f.write("{}")
f.close();

print 'Content-type: text/html\n'
print "<body><body>"
