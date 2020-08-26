class Road {
	constructor(image, y) {
		this.x = 0;
		this.y = y;
		this.loaded = false;

		this.image = new Image();

		var obj = this;

		this.image.addEventListener("load", function() {
			obj.loaded = true;
		});

		this.image.src = image;
	}

	Update(road) {
		this.y += speed; //Двигаем картинку вниз на каждом кадре

		if (this.y > window.innerHeight) //Если картинка слева, она поменяет свое положение
		{
			this.y = road.y - canvas.width + speed; //Новое положение зависит от следуещего объекта дороги
		}
	}
}

class Object {
	constructor(image, x, y, isPlayer, type) {
		this.x = x;
		this.y = y;
		this.loaded = false;
		this.dead = false;
		this.isPlayer = isPlayer;
		this.type = type;

		this.image = new Image();

		var obj = this;

		this.image.addEventListener("load", function() {
			obj.loaded = true;
		});

		this.image.src = image;
	}

	Update() {
		if (!this.isPlayer) {
			this.y += speed;
		}

		if (this.y > canvas.height + 50) {
			this.dead = true;
		}
	}

	Collide(car) {
		var hit = false;

		if (this.y < car.y + car.image.height * prop_scale && this.y + this.image.height * prop_scale > car.y) //Если коллизия по у
		{
			if (this.x + this.image.width * prop_scale > car.x && this.x < car.x + car.image.width * prop_scale) //Если коллизия по х
			{
				hit = true;
			}
		}

		return hit;
	}

	Move(v, d) {
		if (v == "x") //Движение по х
		{
			d *= 2;

			this.x += d; //Смена позиции

			//Откат измeнений если машина ушла с экрана
			if (this.x + this.image.width * scale > canvas.width) {
				this.x -= d;
			}

			if (this.x < 0) {
				this.x = 0;
			}
		} else //Движение по y
		{
			this.y += d / 5;

			if (this.y + this.image.height * scale > canvas.height) {
				this.y -= d / 5;
			}

			if (this.y < 0) {
				this.y = 0;
			}
		}

	}
}

var UPDATE_TIME = 1000 / 60;

var timer = null;
var cw = window.innerWidth
var ch = window.innerHeight
var canvas = document.getElementById("canvas"); //Получаем канвас
var ctx = canvas.getContext("2d"); //Получаем контекст для работы с канвасом
var clicked = false
var healthImg = new Image();
healthImg.src = "images/heart.png"
var toolsImg = new Image();
toolsImg.src = "images/tools2.png"
var pauseImg = new Image();
pauseImg.src = "images/pause.png"
var soundOnImg = new Image();
soundOnImg.src = "images/soundOn.png"
var soundOffImg = new Image();
soundOffImg.src = "images/soundOff.png"
var superPowerImg = new Image();
superPowerImg.src = "images/power-skill-1.png"
var particles = []
var hue = 400
var pit = 0
var tools = 0
var health = 2
var gameTimer = 1200
var playerName = "Введите имя";
let timerId
var invis = false
var prop_scale = 0.2; //Размер объектов
var scale = 0.2; //Размер игрока
var GetOut = false
var superPower = true
var carEngine = new Audio();
carEngine.preload = 'auto';
carEngine.src = 'sounds/carEngine.wav'
carEngine.loop = true
var GetOff = new Audio();
GetOff.preload = 'auto';
GetOff.src = 'sounds/getOut.wav'
var difficulty = 0
var gameType
var sound = true
Resize(); //Меняем размер канваса при запуске

window.addEventListener("resize", Resize); //Меняем размер канваса при изменении размера окна

//Запрет контекстного меню для мобильных устройств
canvas.addEventListener("contextmenu", function(e) {
	e.preventDefault();
	return false;
});
window.addEventListener("keydown", function(e) {
	KeyDown(e);
}); //Проверяем нажатие клавиш
canvas.addEventListener("mousedown", function(e) {
	if ((e.offsetX > 963 && e.offsetX < 1018) && (e.offsetY > 11 && e.offsetY < 55) & !player.dead & gameType == "play") { // Нажатие на кнопку паузы
		clicked = true
		if (sound) {
			var audioButtons = new Audio();
			audioButtons.preload = 'auto';
			audioButtons.src = 'sounds/button.mp3';
			audioButtons.play();
		}
	}

	if (((e.offsetX > 374 && e.offsetX < 653) && (e.offsetY > 364 && e.offsetY < 417) & !player.dead & gameType == "menu") || ((e.offsetX > 403 && e.offsetX < 681) && (e.offsetY > 665 && e.offsetY < 716) & !player.dead & gameType == "death")) { // Нажатие на кнопку начала игры
		if (playerName != "") {
			if (sound) {
				var audioButtons = new Audio();
				audioButtons.preload = 'auto';
				audioButtons.src = 'sounds/button.mp3';
				audioButtons.play();
			}
			newGame()
		}
	}

	console.log(e.offsetX + "  " + e.offsetY)
	if ((e.offsetX > 920 && e.offsetX < 995) && (e.offsetY > 70 && e.offsetY < 135) & !player.dead & (gameType == "play" || gameType == "menu" || gameType == "death")) { // Нажатие на кнопку звука
		var audioButtons = new Audio();
		audioButtons.preload = 'auto';
		audioButtons.src = 'sounds/button.mp3';
		audioButtons.play();
		if (sound) {
			sound = false

		} else {
			sound = true
		}
	}

	if (timer != null) { // управление мышью

		if ((e.offsetX > 1 && e.offsetX < canvas.width / 2) && (e.offsetY > 140 && e.offsetY < canvas.height)) { //Лево
			MoveL()
		} else if ((e.offsetX > canvas.width / 2 && e.offsetX < canvas.width) && (e.offsetY > 140 && e.offsetY < canvas.height)) { //Право
			MoveR()
		}
	}
}, false);
canvas.addEventListener("mouseup", function(e) {
	if ((e.offsetX > 963 && e.offsetX < 1018) && (e.offsetY > 11 && e.offsetY < 55) & !player.dead & gameType == "play") {
		clicked = false
		Pause()
	}
	ClearTimer(timerId)
}, false);
var objects = []; //Игровые объекты

var roads = [
	new Road("images/bg-game.jpg", 0),
	new Road("images/bg-game.jpg", canvas.width)
]; //Задний фон

var player = new Object("images/car2.png", canvas.width / 2, canvas.height / 2 + 180, true, "player"); //Игрок

Menu()

function newGame() { // Старт игры
	gameType = "play"
	if (playerName == "Введите имя" || playerName == "") {
		playerName = "Игрок" + RandomInteger(1, 10000)
	}
	player.x = canvas.width / 2
	player.y = canvas.height / 2 + 180
	player.dead = false
	health = 2
	gameTimer = 1200
	pit = 0
	tools = 0
	speed = 5
	ClearTimer(timerId)
	difficulty = 0
	invis = false
	GetOut = false
	superPower = true
	objects.splice(0, objects.length);
	if (sound) {
		carEngine.play()
	}

	if (timer == null) {
		Pause()
	}
}
var stupidSwith = false

function Menu() {
	gameType = "menu"

	Start()
}
var speed = 5;


// движение мышью
function MoveL() {
	player.Move("x", -speed);
	timerId = setTimeout(MoveL, 25);
}

function MoveR() {
	player.Move("x", speed);
	timerId = setTimeout(MoveR, 25);
}

function ClearTimer(timerId) {
	clearTimeout(timerId);
}

function Start() {
	if (!player.dead) {
		timer = setInterval(Update, UPDATE_TIME); //Обновляем игру 60 раз в секунду
	}

}

function OutFromRoad() { // Вылет с дороги
	if (GetOut == true & speed > 1) {
		console.log(speed)
		let OutTimer
		speed--
		OutTimer = setTimeout(OutFromRoad, 300);
	} else {
		speed = 0
		carEngine.pause()
		timerId = setTimeout(PlayerDeath, 400);
	}
}

function PlayerDeath() { // Смерть
	carEngine.pause()
	gameType = "death"
}

function Stop() {
	clearInterval(timer); //Остановка игры
	timer = null;
	carEngine.pause()
}

function Update() // Игровой цикл
{
	if (!sound) {
		carEngine.pause()
	} else if (gameType == "play" & !player.dead) {
		carEngine.play()
	}
	difficulty++
	if (!GetOut & !player.dead) {
		gameTimer = gameTimer - 1
		speed = 5 + (difficulty / 6000)
	}

	roads[0].Update(roads[1]);
	roads[1].Update(roads[0]);

	if (RandomInteger(0, 10000) > 9200) //Создаем новый объект
	{
		if (RandomInteger(1, 2) > 1) {
			objects.push(new Object("images/pit2.png", RandomInteger(250, canvas.width - 220), RandomInteger(350, 400) * -1, false, "pit"));
		} else {
			objects.push(new Object("images/tools3.png", RandomInteger(250, canvas.width - 220), RandomInteger(350, 400) * -1, false, "tool"));
			if (RandomInteger(1, 20) == 20) {
				objects.push(new Object("images/bank1.png", RandomInteger(250, canvas.width - 220), RandomInteger(350, 400) * -1, false, "heart"));
			}
		}
	}

	player.Update();

	if (player.dead) {
		player.y = -600
		speed = 0
		carEngine.pause()
		//alert("Crash!");
		//Stop();
	}

	var isDead = false;

	for (var i = 0; i < objects.length; i++) {
		objects[i].Update();

		if (objects[i].dead) {
			isDead = true;
		}
	}

	if (isDead) {
		objects.shift();
	}

	var hit = false;

	for (var i = 0; i < objects.length; i++) // Проверка всех коллизий
	{
		hit = player.Collide(objects[i]);
		if ((player.x < 230 || player.x > 830) & GetOut == false & !invis & gameType == "play") {
			GetOut = true
			if (sound) {
				GetOff.play();
			}
			OutFromRoad()
		}
		if (hit & gameType == "play") {
			if (objects[i].type == "tool") {
				tools++
				objects.splice(i, 1);
				if (sound) {
					var audioInstr = new Audio();
					audioInstr.preload = 'auto';
					audioInstr.src = 'sounds/instruments.mp3';
					audioInstr.play()
				}
			} else if (objects[i].type == "pit") {
				if (tools == 0) {
					createParticles(player.x + ((canvas.width / 2 - 180) / 2) * scale, player.y + ((canvas.height / 2 - 300) / 2) * scale, 5)
					objects.splice(i, 1);
					health--
					if (sound) {
						var audioDamage = new Audio();
						audioDamage.preload = 'auto';
						audioDamage.src = 'sounds/pit_damage.mp3';
						audioDamage.play()
					}
					if (health == 0) {
						createParticles(player.x + ((canvas.width / 2 - 180) / 2) * scale, player.y + ((canvas.height / 2 + 180) / 2) * scale, 200)
						if (sound) {
							var audio = new Audio();
							audio.preload = 'auto';
							audio.src = 'sounds/death.mp3';
							audio.play();
						}
						timerId = setTimeout(PlayerDeath, 400);
						//alert("Crash!");
						//Stop();
						player.dead = true;
						break;
					}
				} else {
					objects.splice(i, 1);
					pit++
					tools--
					if (sound) {
						var audioRepair = new Audio();
						audioRepair.preload = 'auto';
						audioRepair.src = 'sounds/repair.wav';
						audioRepair.play()
					}
				}
			} else if (objects[i].type == "heart" & health < 5) {
				objects.splice(i, 1);
				health++
				if (sound) {
					var audioRepair = new Audio();
					audioRepair.preload = 'auto';
					audioRepair.src = 'sounds/health.mp3';
					audioRepair.play()
				}
			}

		}
	}

	if (clicked) {
		ctx.drawImage(pauseImg, canvas.width - 60, 10, 60, 60);
	} else if (!clicked) {
		ctx.drawImage(pauseImg, canvas.width - 60, 10, 50, 50);
	}
	Draw();
}

function Draw() //Работа с графикой
{
	ctx.clearRect(0, 0, canvas.width, canvas.height); //Очищаем канвас

	for (var i = 0; i < roads.length; i++) {
		ctx.drawImage(
			roads[i].image,
			0,
			0,
			roads[i].image.width,
			roads[i].image.height / 10,
			roads[i].x,
			roads[i].y,
			canvas.width,
			canvas.width
		);
	}

	for (var i = 0; i < objects.length; i++) {
		DrawObject(objects[i]);
	}

	if (gameType == "play" || gameType == "death") { // Рисуем элементы игры
		DrawCar(player);
		ctx.textAlign = "start"
		ctx.shadowColor = 'black';
		ctx.shadowBlur = 5;

		ctx.font = "bold 20pt Arial";
		ctx.fillStyle = "white";
		ctx.fillRect(canvas.width - 81, canvas.height - 80, 81, 64)
		ctx.fillRect(0, 0, 1025, 70)
		ctx.fillRect(0, 72, (ctx.measureText(playerName).width + 40), 64)
		ctx.shadowBlur = 0;
		if (playerName == "tester") {
			ctx.fillStyle = "red";
		} else {
			ctx.fillStyle = "black";
		}
		ctx.fillText(playerName, 20, 110);

		if (clicked) {

			ctx.drawImage(pauseImg, canvas.width - 60, 10, 50, 50);
		} else if (!clicked) {
			ctx.drawImage(pauseImg, canvas.width - 65, 5, 60, 60);
		}
		if (superPower & !invis) {
			ctx.drawImage(superPowerImg, canvas.width - 90, canvas.height - 160, 60, 60);
		} else if (!superPower & invis) {
			ctx.drawImage(superPowerImg, canvas.width - 100, canvas.height - 170, 80, 80);
		}
		ctx.drawImage(toolsImg, canvas.width - 110, canvas.height - 80);
		ctx.fillText(tools, canvas.width - 35, canvas.height - 38);

		ctx.fillText("Счет: " + pit, canvas.width / 2, 45);

		var sec = (gameTimer / 60).toFixed();
		var h = sec / 3600 ^ 0;
		var m = (sec - h * 3600) / 60 ^ 0;
		var s = sec - h * 3600 - m * 60;
		if (sec > 0) {
			ctx.fillText("Время: " + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s), canvas.width - 250, 45);
		} else {
			speed = 0
			timerId = setTimeout(PlayerDeath, 400);
			ctx.fillText("Время: 00:00", canvas.width - 250, 45);
		}


		var cc = 0;
		for (var i = 0; i < health; i++) {
			ctx.drawImage(healthImg, 20 + cc, 10, 50, 50);
			cc += 60
		}
		// Рисуем частицы 
		var i = particles.length;
		while (i--) {
			particles[i].draw();
			particles[i].update(i);
		}

		console.log(gameType)
		if (gameType == "death") {
			ctx.fillStyle = "white";
			ctx.shadowColor = 'black';
			ctx.shadowBlur = 15;
			ctx.fillRect(canvas.width / 2 - 339, 140, 720, 600)

			ctx.fillStyle = 'black';
			ctx.font = "bold 40pt Arial";
			ctx.textAlign = "start"
			ctx.shadowBlur = 0;
			ctx.fillText("Игра окончена", canvas.width / 2 - 160, 190);
			ctx.font = "bold 15pt Arial";

			ctx.shadowBlur = 15;
			ctx.fillStyle = "#005aeb";
			ctx.fillRect(canvas.width / 2 - 109, 665, 279, 54)
			ctx.shadowBlur = 0;
			ctx.font = "bold 20pt Arial";
			ctx.fillStyle = "white";
			ctx.fillText("Начать игру", canvas.width / 2 - 50, 702);
		}
	} else if (gameType == "menu") {
		// Логотип игры
		ctx.shadowColor = 'black';
		ctx.shadowBlur = 15;
		ctx.textAlign = "center"
		ctx.font = "60pt Arial";
		var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
		gradient.addColorStop("0", "yellow");
		gradient.addColorStop("1", "red");
		ctx.fillStyle = gradient;
		ctx.fillText("Супер авто", canvas.width / 2, 130);

		// Поле ввода имени
		ctx.fillStyle = "white";
		ctx.fillRect(canvas.width / 2 - (ctx.measureText(playerName).width / 4) - 20, 300, 40 + ctx.measureText(playerName).width / 2, 54)
		ctx.fillStyle = "black";
		ctx.shadowBlur = 0;
		ctx.font = "bold 30pt Arial";
		ctx.fillText(playerName, canvas.width / 2, 340);
		ctx.shadowBlur = 15;

		// Кнопка начать игру
		if (playerName != "") {
			ctx.fillStyle = "#005aeb";
			ctx.fillRect(canvas.width / 2 - 139, 365, 279, 54)
			ctx.shadowBlur = 0;
			ctx.font = "bold 20pt Arial";
			ctx.fillStyle = "white";
			ctx.fillText("Начать игру", canvas.width / 2, 402);
		} else {
			ctx.fillStyle = "#a6caf0";
			ctx.fillRect(canvas.width / 2 - 139, 365, 279, 54)
			ctx.shadowBlur = 0;
			ctx.font = "bold 20pt Arial";
			ctx.fillStyle = "gray";
			ctx.fillText("Начать игру", canvas.width / 2, 402);
		}
		ctx.shadowBlur = 0;
	}
	if (gameType == "menu" || gameType == "play" || gameType == "death") {
		ctx.shadowColor = 'white';
		ctx.shadowBlur = 5;
		if (sound) {
			ctx.drawImage(soundOnImg, canvas.width - 100, 70, 70, 70);
		} else {
			ctx.drawImage(soundOffImg, canvas.width - 100, 70, 70, 70);
		}
		ctx.shadowBlur = 0;
	}
}

function SuperPower() { // Супер сила
	if (superPower & !player.dead & timer != null & gameType == "play") {
		console.log(gameTimer / 60)
		invis = true
		if (sound) {
			var audio = new Audio();
			audio.preload = 'auto';
			audio.src = 'sounds/superPower.mp3';
			audio.play();
		}
		superPower = false
		let inv
		inv = setTimeout(() => invis = false, 7000);
	}
}

function Pause() { // Пауза
	ctx.shadowColor = 'black';
	ctx.shadowBlur = 15;
	ctx.textAlign = "center"
	ctx.font = "60pt Arial";
	var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
	gradient.addColorStop("0", "white");
	gradient.addColorStop("1", "yellow");
	ctx.fillStyle = gradient;
	ctx.fillText("Пауза", canvas.width / 2, 160);
	if (timer == null) {
		Start();
	} else {
		Stop();
	}
}

function DrawCar(car) // Отрисовка игрока
{
	ctx.drawImage(
		car.image,
		0,
		0,
		car.image.width,
		car.image.height,
		car.x,
		car.y,
		car.image.width * scale,
		car.image.height * scale
	);
}

function DrawObject(car) // Отрисовка объектов
{
	ctx.drawImage(
		car.image,
		0,
		0,
		car.image.width,
		car.image.height,
		car.x,
		car.y,
		car.image.width * prop_scale,
		car.image.height * prop_scale
	);
}

function KeyDown(e) // Проверка нажатий
{
	if (e.keyCode == 37) { //Лево
		player.Move("x", -speed);
	}
	if (e.keyCode == 39) { //Право
		player.Move("x", speed);
	}
	if (e.keyCode == 38) { //Вверх
		player.Move("y", -speed * 20);
	}
	if (e.keyCode == 40) { //Вниз
		player.Move("y", speed * 20);
	}
	if (e.keyCode == 80) { //Пауза
		if (clicked == true) {
			clicked = false
			timerId = setTimeout(Pause, 100);
			if (sound) {
				var audioButtons = new Audio();
				audioButtons.preload = 'auto';
				audioButtons.src = 'sounds/button.mp3';
				audioButtons.play();
			}
		} else {
			clicked = true
			timerId = setTimeout(Pause, 100);
			if (sound) {
				var audioButtons = new Audio();
				audioButtons.preload = 'auto';
				audioButtons.src = 'sounds/button.mp3';
				audioButtons.play();
			}
		}


	}
	if (e.keyCode == 32) {
		SuperPower()
	}
	if (e.keyCode == 13) {
		if (playerName != "" & gameType == "menu") {
			newGame()
		}
	}
	if (gameType == "menu") {

		if (e.key == "Backspace") {
			if (playerName == "Введите имя") {
				playerName = ""
			}
			playerName = playerName.slice(0, -1);
			console.log(playerName)
		} else if (e.key.length == 1 && playerName.length < 20) {
			if (playerName == "Введите имя") {
				playerName = ""
			}
			playerName += e.key
		}
	}
}

function Resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

}

function RandomInteger(min, max) // Рандом для спавна объектов
{
	let rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
}

function random(min, max) { // Рандом для частиц
	return Math.random() * (max - min) + min;
}
// Создаем частицу
function Particle(x, y) {
	this.x = x;
	this.y = y;
	// Рисуем хвосты после частиц
	this.coordinates = [];
	this.coordinateCount = 5;
	while (this.coordinateCount--) {
		this.coordinates.push([this.x, this.y]);
	}
	// Рандомный вектор частицы
	this.angle = random(0, Math.PI * 2);
	this.speed = random(1, 10);
	this.friction = 0.95;
	// Гравитация для частиц
	this.gravity = 1;
	// Разброс цвета для каждой частицы
	this.hue = random(hue - 20, hue + 20);
	this.brightness = random(50, 80);
	this.alpha = 1;
	// Скорость исчезновения частиц
	this.decay = random(0.015, 0.03);
}

// Обновление частиц
Particle.prototype.update = function(index) {

	this.coordinates.pop();
	this.coordinates.unshift([this.x, this.y]);
	this.speed *= this.friction;
	this.x += Math.cos(this.angle) * this.speed;
	this.y += Math.sin(this.angle) * this.speed + this.gravity;
	this.alpha -= this.decay;
	if (this.alpha <= this.decay) {
		particles.splice(index, 1);
	}

}

// Отрисовка частиц
Particle.prototype.draw = function() {
	ctx.beginPath();
	// move to the last tracked coordinates in the set, then draw a line to the current x and y
	ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
	ctx.lineTo(this.x, this.y);
	ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
	ctx.stroke();
}

// Создание группы частиц
function createParticles(x, y, cnt) {
	while (cnt--) {
		particles.push(new Particle(x, y));
	}
}