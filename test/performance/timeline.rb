require 'rubygems'
require 'bundler'
require 'json'
require 'open-uri'
require 'eventmachine'
require 'faye/websocket'
require 'csv'

content = JSON.parse(open("http://localhost:9222/json").read)
baseUrl = ARGV.shift
assetFile = ARGV.shift
label = ARGV.shift

assetContent = IO.readlines(File.join(File.dirname(__FILE__),'..','fixture', assetFile))
session = assetContent[1].split(',').pop
performance_path =  File.join(File.dirname(__FILE__),'..','..','Performance')

target_timestamp = Time.now.to_i
session_file = File.join(performance_path, 'sessions', session.strip + '.csv')
new_session = !File.exists?(session_file)

EM.run do
	id = 1
	ws = Faye::WebSocket::Client.new(content.first['webSocketDebuggerUrl'])
	ws.onopen = lambda do |event|
		ws.send JSON.dump({id: id, method: 'Page.navigate', params: { url: baseUrl + ':3000/' + assetFile }})	
	end

	EventMachine::Timer.new(2) do
		ws.send JSON.dump({id: id = id + 1, method: 'Runtime.evaluate', params: { expression: 'window.chrome.loadTimes()', returnByValue: true }})
	end

	EventMachine::Timer.new(3) do
		exit
	end

	ws.onmessage = lambda do |event|
		id = id + 1
		data = JSON.parse(event.data);
		if(data['result'] && data['result']['result'] && data['result']['result']['value'] && data['result']['result']['value']['requestTime'])

			times = data['result']['result']['value']
			CSV.open(session_file, new_session ? "wb" : "ab") do |csv|
				if(new_session) 
					csv << ['timestamp', 'DOMContentLoaded', 'FirstPaint', 'Load', 'Label' ]
				end
				csv << [ 	target_timestamp, 
							times['finishDocumentLoadTime'] - times['commitLoadTime'],
							times['firstPaintAfterLoadTime'] - times['commitLoadTime'],
							times['finishLoadTime'] - times['commitLoadTime'],
							label
						]
				csv
			end

		end
	end
end