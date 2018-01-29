#!/usr/bin/python

import cgitb; cgitb.enable()
import cgi


form = cgi.FieldStorage()
name = form['name'].value.replace(" ", "").replace("<", "").replace(">", "")
mines = form['mines'].value
size = form['size'].value
turns = form['turns'].value
result = form['result'].value

file = open('/tmp/highScores.txt', 'r')

messages = []
for line in file:
	messages.append(line)
file.close()

file = open('/tmp/highScores.txt', 'w')

file.write(name + '\t' + mines + '\t' + size + '\t' + turns + '\t' + result + '\n')

records = len(messages)
if records > 29:
	records = 29
for x in range(0, records):
	file.write(messages[x])


file.close()

print 'Content-type: text/html\n'
print "<body><body>"
