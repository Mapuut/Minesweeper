#!/usr/bin/python

import cgitb; cgitb.enable()
import cgi
import json
import os

print 'Content-type: application/json\n'

filename = '/tmp/highScores.txt'

form = cgi.FieldStorage()

# If file does not exsist, create one
if not os.path.exists(filename):
	open(filename, 'w').close()


file = open(filename, 'r')

messages = []
for line in file:
	line = line.strip()
	result = line.split('\t')

	messages.append({'name': result[0], 'mines': result[1], 'size': result[2], 'turns': result[3], 'result': result[4]})
file.close()

print json.dumps(messages)