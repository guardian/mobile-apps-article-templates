require 'rubygems'
require 'bundler'
require 'open-uri'
require 'json'
require 'eventmachine'
require 'faye/websocket'
require 'csv'

content = JSON.parse(open("http://localhost:9222/json").read)
baseUrl = ARGV.shift
assetFile = ARGV.shift
assetContent = IO.readlines(File.join(File.dirname(__FILE__),'..','fixture',assetFile))

@seconds = 5;
@session, @model, @label = assetContent[1].split(',')
@performance_path =  File.join(File.dirname(__FILE__),'..','..','Performance')

def extractSummary(data)	
	frames = [];
	marks = {};
	stack = [data];
	while(stack.size > 0) do
		items = stack.pop
		items.each do |item| 
			if (item['type'] == 'DrawFrame' || (frames.size == 0 && item['type'] == 'BeginFrame'))
				frames << item['startTime']
			elsif (item['type'] && item['type'].start_with?('Mark') && (!(item.has_key?('data') && item['data'].has_key?('isMainFrame')) || item['data']['isMainFrame']))
				marks[item['type'].sub('Mark','')] = item['startTime']
			end

			if (item['children'])
				stack << item['children']
			end
		end
	end

	beginTime = frames.shift
	markString = marks.to_a.reverse.reduce('') do |memo, (type, time)|
		memo += "#{type}: #{(time - beginTime).round(3)}ms "
	end

	times = frames.reduce([beginTime]) do |memo, event|
		memo += [event - memo.pop, event]
	end
	times.pop

	info = {
	 	frames: times.size,
	 	avg: times.reduce(:+)/times.size,
	 	best: times.min,
	 	worst: times.max,
	 	begintime: beginTime
	}.merge(marks)

	if(marks['DOMContent'] && (marks['DOMContent'] - beginTime) > @seconds * 1000)
		puts "bad measurament, discarded"
	else
		puts  "#{times.size} frames, avg: #{(times.reduce(:+)/times.size).round(3)}ms, best: #{times.min.round(3)}ms worst: #{times.max.round(3)}ms, #{markString}"
		storeToFile(info, data)
	end	
end

def storeToFile(info, raw)
	target_timestamp = Time.now.to_i
	session_file = File.join(@performance_path, 'sessions', @session.strip + '.csv')
	timeline_file = File.join(@performance_path, 'timelines', "timeline_#{target_timestamp}.json" )
	new_session = !File.exists?(session_file)
	dom_content = info['DOMContent'] ? info['DOMContent'] - info[:begintime] : nil
	first_paint = info['FirstPaint'] ? info['FirstPaint'] - info[:begintime] : nil
	load = info['Load'] ? info['Load'] - info[:begintime] : nil

	CSV.open(session_file, new_session ? "wb" : "ab") do |csv|
		if(new_session) 
			csv << ['timestamp','frames','average','best','worst','DOMContent', 'FirstPaint', 'Load', 'Label']
		end
		csv << [target_timestamp, info[:frames], info[:avg], info[:best], info[:worst], dom_content, first_paint, load, info['Label']]
		csv
	end

	File.open( timeline_file, 'w') do |file| 
		file.write(JSON.dump(raw)) 
	end
end


EM.run do
	id = 4
	ws = Faye::WebSocket::Client.new(content.first['webSocketDebuggerUrl'])
	dump = ["5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"]
	ws.onopen = lambda do |event|
	  ws.send JSON.dump({
	    id: 1,
	    method: 'Page.navigate',
	    params: { url: 'about:blank' }
	  })
	end

	EventMachine::Timer.new(0.5) do
	  ws.send JSON.dump({id: 2, method: 'Timeline.enable'})
	  ws.send JSON.dump({id: 3, method: 'Timeline.start'})
	  ws.send JSON.dump({
	    id: 4,
	    method: 'Page.navigate',
	    params: { url: baseUrl + ':3000/' + assetFile }
	  })		
	end

	EventMachine::Timer.new(@seconds) do
		ws.send JSON.dump({id: 3, method: 'Timeline.stop'})
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