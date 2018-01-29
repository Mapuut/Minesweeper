#!/usr/bin/python

import cgitb; cgitb.enable()
import cgi
import json
import os

print 'Content-type: application/json\n'

filename = '/tmp/savedGames.txt'
form = cgi.FieldStorage()


name = form['name'].value.replace(" ", "").replace("<", "").replace(">", "")


file = open(filename, 'r')
data = json.load(file)
file.close()

if name in data:
	response = data[name]
	print json.dumps(response)
else:
	print "{}"