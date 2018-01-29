#!/usr/bin/python

import cgitb; cgitb.enable()
import cgi
import json
import os


form = cgi.FieldStorage()

name = form['name'].value.replace(" ", "").replace("<", "").replace(">", "")
size = form['size'].value
mines = form['mines'].value
turns = form['turns'].value
running = form['running'].value
startTurn = form['startTurn'].value
bommData = form['bommData'].value
openData = form['openData'].value
flagData = form['flagData'].value



# file = open('/tmp/savedGames.txt', 'w')
# file.write("{\"id\": \"6\"}")
# file.close()

with open('/tmp/savedGames.txt') as data_file:    
    data = json.load(data_file)



data[name] = {'name': name, 'size': size, 'mines': mines, 'turns': turns, 'running': running, 'startTurn': startTurn, 'bommData': bommData, 'openData': openData, 'flagData': flagData}



file = open('/tmp/savedGames.txt', 'w')

file.write(json.dumps(data))


file.close()

print 'Content-type: text/html\n'
print "<body><body>"


