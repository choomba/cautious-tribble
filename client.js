var socket = io() || {};
socket.isReady = false;

const options = {
  hosts: {
    domain: 'rebo.centria.fi',
    muc: 'conference.rebo.centria.fi',
 //   focus: 'focus.rebo.centria.fi',
    focus: 'focus@auth.rebo.centria.fi/focus',
  },
  serviceUrl: 'wss://rebo.centria.fi/meet/xmpp-websocket',
  openBridgeChannel: 'websocket',
  resolution: 180,
};

const conferenceName = 'testi';

let connection = null;
let isJoined = false;
let room = 'null';

var videoElements = {};
let localTracks = [];
let remoteTracks = {};


window.addEventListener('load', connect);
window.addEventListener('beforeunload', unload);
window.addEventListener('unload', unload);


window.addEventListener('load', function() {

	var execInUnity = function(method) {
		if (!socket.isReady) return;
		
		var args = Array.prototype.slice.call(arguments, 1);
		
		f(window.unityInstance!=null)
		{
		  //fit formats the message to send to the Unity client game, take a look in NetworkManager.cs in Unity
		  window.unityInstance.SendMessage("NetworkManager", method, args.join(':'));
		
		}
		
	};//END_exe_In_Unity 

	
	socket.on('PONG', function(socket_id,msg) {
				      		
	  var currentUserAtr = socket_id+':'+msg;
	  
	 if(window.unityInstance!=null)
		{
		 
		  window.unityInstance.SendMessage ('NetworkManager', 'OnPrintPongMsg', currentUserAtr);
		
		}
	  
	});//END_SOCKET.ON

					      
	socket.on('LOGIN_SUCCESS', function(id,name,avatar,position) {
				      		
	  var currentUserAtr = id+':'+name+':'+avatar+':'+position;
	  
	   if(window.unityInstance!=null)
		{
		 
		  window.unityInstance.SendMessage ('NetworkManager', 'OnJoinGame', currentUserAtr);
		
		}
	  
	});//END_SOCKET.ON
	
		
	socket.on('SPAWN_PLAYER', function(id,name,avatar,position) {
	
	    var currentUserAtr = id+':'+name+':'+avatar+':'+position;
		
		if(window.unityInstance!=null)
		{
	     // sends the package currentUserAtr to the method OnSpawnPlayer in the NetworkManager class on Unity
		  window.unityInstance.SendMessage ('NetworkManager', 'OnSpawnPlayer', currentUserAtr);
		
		}
		
	});//END_SOCKET.ON
	
	socket.on('RESPAWN_PLAYER', function(id,name,avatar,position) {
	    var currentUserAtr = id+':'+name+':'+avatar+':'+position;
		
	 if(window.unityInstance!=null)
		{
		   window.unityInstance.SendMessage ('NetworkManager', 'OnRespawPlayer', currentUserAtr);
		}
		
	});//END_SOCKET.ON
	
    socket.on('UPDATE_MOVE_AND_ROTATE', function(id,position,rotation) {
	     var currentUserAtr = id+':'+position+':'+rotation;
		 	
		 if(window.unityInstance!=null)
		{
		   window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateMoveAndRotate',currentUserAtr);
		}
		
	});//END_SOCKET.ON
	
	
	 socket.on('UPDATE_PLAYER_ANIMATOR', function(id,animation) {
	 
	     var currentUserAtr = id+':'+animation;
		
		 if(window.unityInstance!=null)
		{
		  
		   // sends the package currentUserAtr to the method OnUpdateAnim in the NetworkManager class on Unity 
		   window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateAnim',currentUserAtr);
		}
		
	});//END_SOCKET.ON

	socket.on('UPDATE_ATTACK', function(currentUserId) {
	
	    var currentUserAtr = currentUserId;
		
	if(window.unityInstance!=null)
		{
		    window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateAttack',currentUserAtr);
		
		}
		
	});//END_SOCKET.ON
	
	
	socket.on('DEATH', function(targetId) {
	
	    var currentUserAtr = targetId;
		if(window.unityInstance!=null)
		{
		 window.unityInstance.SendMessage ('NetworkManager', 'OnPlayerDeath',currentUserAtr);
		
		}
		
	});//END_SOCKET.ON
	
    socket.on('UPDATE_PHISICS_DAMAGE', function(targetId,targetHealth) {
	
	     var currentUserAtr = targetId+':'+targetHealth;
		 
		if(window.unityInstance!=null)
		{
		 
		 window.unityInstance.SendMessage ('NetworkManager', 'OnUpdatePlayerPhisicsDamage',currentUserAtr);
		
		
		}
		
		
	});//END_SOCKET.ON		
	
	
		        
	socket.on('USER_DISCONNECTED', function(id) {
	
	     var currentUserAtr = id;
		 
		if(window.unityInstance!=null)
		{
		  
		 window.unityInstance.SendMessage ('NetworkManager', 'OnUserDisconnected', currentUserAtr);
		
		
		}
		 
	
	});//END_SOCKET.ON
	

});//END_window_addEventListener



window.onload = (e) => {
	mainFunction(1000);
  };
  
  
  
  
  
  function mainFunction(time) {
  
  /*
	navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
	  var madiaRecorder = new MediaRecorder(stream);
	  madiaRecorder.start();
  
	  var audioChunks = [];
  
	  madiaRecorder.addEventListener("dataavailable", function (event) {
		audioChunks.push(event.data);
	  });
  
	  madiaRecorder.addEventListener("stop", function () {
		var audioBlob = new Blob(audioChunks);
  
		audioChunks = [];
  
		var fileReader = new FileReader();
		fileReader.readAsDataURL(audioBlob);
		fileReader.onloadend = function () {
   
  
		  var base64String = fileReader.result;
		  socket.emit("VOICE", base64String);
  
		};
  
		madiaRecorder.start();
  
  
		setTimeout(function () {
		  madiaRecorder.stop();
		}, time);
	  });
  
	  setTimeout(function () {
		madiaRecorder.stop();
	  }, time);
	});
  
  
   socket.on("UPDATE_VOICE", function (data) {
	  var audio = new Audio(data);
	  audio.play();
	});
	
	*/
  }

function onLocalTracks(tracks) {
  localTracks = tracks;
  if (isJoined) {
    for (let i = 0; i < localTracks.length; i++) {
      room.addTrack(localTracks[i]);
    }
  }
}

function onRemoteTrack(track) {
  if (track.isLocal()) {
    return;
  }

  const participantId = track.getParticipantId();

  if (!remoteTracks[participantId]) {
    remoteTracks[participantId] = [];
  }
  remoteTracks[participantId].push(track);

  if (track.getType() == 'video') {
    // Video elements just get stored, they're accessed from Unity.
    const key = "participant-" + participantId;
    window.videoElements[key] = document.createElement('video');
    window.videoElements[key].autoplay = true;
    track.attach(window.videoElements[key]);
  }
  else {
    // Audio elements get added to the DOM (can be made invisible with CSS) so that the audio plays back.
    const audioElement = document.createElement('audio');
    audioElement.autoplay = true;
    audioElement.id = "audio-" + participantId;
    document.body.appendChild(audioElement);
    track.attach(audioElement);
  }
}

function onConferenceJoined() {
  isJoined = true;
  for (let i = 0; i < localTracks.length; i++) {
    room.addTrack(localTracks[i]);
  }
}

function onUserLeft(id) {
  if (!remoteTracks[id]) {
    return;
  }
  const tracks = remoteTracks[id];
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].getType() == 'video') {
      const key = "participant-" + id;
      const videoElement = window.videoElements[key];
      if (videoElement) {
        tracks[i].detach(videoElement);
        delete window.videoElements[key];
      }
    }
    else {
      const audioElement = document.getElementById('audio-' + id);
      if (audioElement) {
        tracks[i].detach(audioElement);
        audioElement.parentNode.removeChild(audioElement);
      }
    }
  }
}

function onConnectionSuccess() {
  room = connection.initJitsiConference(conferenceName, options);
  room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
  room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
  room.on(JitsiMeetJS.events.conference.USER_JOINED, id => { remoteTracks[id] = []; });
  room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
  room.join();
}

function unload() {
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].dispose();
  }
  room.leave();
  connection.disconnect();
}

function connect() {
  JitsiMeetJS.init(options);
  connection = new JitsiMeetJS.JitsiConnection(null, null, options);
  connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
  connection.connect();
  JitsiMeetJS.createLocalTracks({devices: ["audio", "video"]})
    .then(onLocalTracks);
}
