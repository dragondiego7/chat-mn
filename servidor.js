"use strict";

// Carrega o express 
var express = require("express");

// Instacia o express na variavel app
var app = express();

// Instancia do servidor HTTP
var servidor = require("http").createServer(app);

// Instancia do socket IO
var io = require("socket.io").listen(servidor);

// Variavel de lista de usuarios e conexões
var usuarios = [];
var conexoes = [];

// Servidor escutando a porta padrão ou 3000
servidor.listen(process.env.PORT || 3000);
console.log("Servidor rodando...");

// Rota para apontar a index a HTML
app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");
});

// Função de conexão via socket
io.sockets.on("connection", function(socket){
	// Adiciona uma nova conexão a listagem de conexões
	conexoes.push(socket);
	console.log("Connected: %s sockets connected", conexoes.length);
	
	// Remove uma conexão da listagem de conexão
	socket.on("disconnect", function(data) {
		var pos = false;
		for (var int = 0; int < usuarios.length; int++) {
			if(usuarios[int].id.indexOf(socket.id) != "-1"){
				pos = int;
				break;
			}
		}
		
		if(pos !== false) {
			usuarios.splice(pos, 1);
			updateUsuariosNomes();
		}
		
		conexoes.splice(conexoes.indexOf(socket), 1);
		console.log("Disconnected: %s sockets connected", conexoes.length);
	});
	
	// Enviar mensagem
	socket.on("enviar mensagem", function(data) {
		console.log(data);
		if(data.para == 0){
			io.sockets.emit("nova mensagem", {msg: data.msg, usuario: socket.usuarioLogin});
		} else {
			io.to(data.para).emit("nova mensagem", {msg: data.msg, usuario: socket.usuarioLogin});
			io.to(socket.id).emit("nova mensagem", {msg: data.msg, usuario: socket.usuarioLogin});
		}
	});
	
	// Novo usuario
	socket.on("novo usuario", function(data, callback){
		callback(true);
		socket.usuarioLogin = data;
		
		var usuario = {
			id: socket.id,
			login: socket.usuarioLogin
		};
		
		usuarios.push(usuario);
		
		updateUsuariosNomes();
	});
	
	function updateUsuariosNomes(){
		io.sockets.emit("recupera usuarios", usuarios);
	}
});

// Mapeamento do diretório raiz
app.use(express.static(__dirname + '/'));