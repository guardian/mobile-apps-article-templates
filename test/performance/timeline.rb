require 'rubygems'
require 'bundler'
require 'open-uri'
require 'json'
require 'eventmachine'
require 'faye/websocket'

content = JSON.parse(open("http://localhost:9222/json").read)
baseUrl = ARGV.shift
assetFile = ARGV.shift

def extractSummary(data)	
	frames = [];
	marks = [];
	stack = [data];
	while(stack.size > 0) do
		items = stack.pop
		items.each do |item| 
			if (item['type'] == 'DrawFrame' || (frames.size == 0 && item['type'] == 'BeginFrame'))
				frames << item['startTime']
			elsif (item['type'] && item['type'].start_with?('Mark'))
				marks << { 
					type: item['type'].sub('Mark',''),
					time: item['startTime']
				}
			end

			if (item['children'])
				stack << item['children']
			end
		end
	end

	beginTime = frames.shift
	markStirng = marks.reverse.reduce('') do |memo, mark|
		memo += "#{mark[:type]}: #{(mark[:time] - beginTime).round(3)}ms "
	end

	times = frames.reduce([beginTime]) do |memo, event|
		memo += [event - memo.pop, event]
	end
	times.pop


	puts  "#{times.size} frames, avg: #{(times.reduce(:+)/times.size).round(3)}ms, best: #{times.min.round(3)}ms worst: #{times.max.round(3)}ms, #{markStirng}"
end

EM.run do
	id = 3
	ws = Faye::WebSocket::Client.new(content.first['webSocketDebuggerUrl'])
	dump = ["5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"]
	ws.onopen = lambda do |event|
	  ws.send JSON.dump({id: 1, method: 'Timeline.enable'})
	  ws.send JSON.dump({id: 2, method: 'Timeline.start'})

	  ws.send JSON.dump({
	    id: 3,
	    method: 'Page.navigate',
	    params: { url: baseUrl + ':3000/' + assetFile }
	  })
	end

	EventMachine::Timer.new(5) do
		ws.send JSON.dump({id: 3, method: 'Timeline.stop'})
		File.open( 'last_timeline.json', 'w') do |file| 
			file.write(JSON.dump(dump)) 
		end
		extractSummary(dump)
		exit
	end

	ws.onmessage = lambda do |event|
		id = id + 1
		command = JSON.parse(event.data)
		if(command['method'] == 'Timeline.eventRecorded')
			dump << command['params']['record']
		end	  	
	end
end