
function initServer(port2use){
	const wss = new WebSocket.Server({ port: port2use });
	wss.on('connection', function connection(ws) {
		ws.on('message', function incoming(message) {
			console.log('received: %s', message);
			document.getElementById("console").innerHTML = document.getElementById("console").innerHTML + "<br/>" + "text2";
			var objDiv = document.getElementById("scrollable");
			objDiv.scrollTop = objDiv.scrollHeight;
		});
		//ws.send('something');
	});
}
initServer(4000);