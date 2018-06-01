var scene, camera, renderer, clock, arrayObjs = new THREE.Group();
var frustumSize = 60;

function init() {
	clock = new THREE.Clock;

	objects();
	scene();
	camera();
	renderer();

	window.addEventListener('resize', onResize, false);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}

function scene() {
	scene = new THREE.Scene();
	scene.add(arrayObjs);
}

function camera() {
	var aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -100, 1000 );
	camera.position.x = 0;//vermelho
	camera.position.y = 20;//verde
	camera.position.z = 0;//azul
	camera.lookAt(scene.position);
}

function renderer() {
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xEEEEEE);
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild(renderer.domElement);
}
			
function render() {
	renderer.render(scene, camera);
}

function objects() {
	var road = new Road();
	makeRoad(road);
	var floor = new Floor(60, 60, 60, road);
	arrayObjs.add(floor);
	var orange_1 = new Orange(-12, 0, -11.5);
	arrayObjs.add(orange_1);
	var orange_2 = new Orange(14, 0, -9);
	arrayObjs.add(orange_2);
	var orange_3 = new Orange(-14, 0, 10);
	arrayObjs.add(orange_3);
	var butter_1 = new Butter(-2, 0, 5);
	arrayObjs.add(butter_1);
	var butter_2 = new Butter(10, 0, 10);
	arrayObjs.add(butter_2);
	var butter_3 = new Butter(-5, 0, 15);
	arrayObjs.add(butter_3);
	var butter_4 = new Butter(-15, 0, -20);
	arrayObjs.add(butter_4);
	var butter_5 = new Butter(25, 0, -6);
	arrayObjs.add(butter_5);
	var car = new Car(0, 0, -12);
	arrayObjs.add(car);
}

function makeRoad(road) {
	road.addCurve(13, 0, -15, 32);
	road.addCurve(7, 0, -9, 16);
	road.addLine(13, 0, -15, 18);
	road.addLine(7, 0, -9, 14);
	road.addLine(7, 0, 9, 14);
	road.addLine(13, 0, 15, 18);
	road.addCurve(-14, 0, 15, 32);
	road.addCurve(-14, 0, 9, 16);
}

function onResize(event) {
	var aspect = window.innerWidth / window.innerHeight;

	camera.left   = - frustumSize * aspect / 2;
	camera.right  =   frustumSize * aspect / 2;
	camera.top    =   frustumSize / 2;
	camera.bottom = - frustumSize / 2;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onKeyDown(e) {
	car = arrayObjs.getObjectByName("Car");
	switch(e.keyCode){
	case 49://camera 1
		car.cameraFollow = false;
		var aspect = window.innerWidth / window.innerHeight;
		camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -100, 1000 );
		camera.position.x = 0;//vermelho
		camera.position.y = 20;//verde
		camera.position.z = 0;//azul
		camera.lookAt(scene.position);
		break;
	case 50://camera 2
		car.cameraFollow = false;
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 1, 1000 );
		camera.position.x = 0;//vermelho
		camera.position.y = 40;//verde
		camera.position.z = 0;//azul
		camera.lookAt(scene.position);
		break;
	case 51://camera 3
		car.cameraFollow = true;
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 1, 1000 );
		camera.position.x = 5;//vermelho
		camera.position.y = 2;//verde
		camera.position.z = 8;//azul
		car.add(camera);
		camera.lookAt(car.position);
		break;
	case 65://A
	case 97://a
		scene.traverse(function(node){
							if(node instanceof THREE.Mesh){
								node.material.wireframe = !node.material.wireframe;
							}
						});
		break;
	case 37://left
		car.userData.left = true;
		break;
	case 38://up
		car.userData.forward = true;
		car.userData.aceleration = -car.a;
		break;
	case 39://right
		car.userData.right = true;
		break;
	case 40://down
		car.userData.back = true;
		car.userData.aceleration = car.a;
		if(car.forwardfriction == true) { //se o carro estiver a andar para a frente, mas não tiver nenhuma tecla premida, atualiza a aceleraçao
			 car.userData.aceleration = car.handbreak;
		}
		break;
	}
}

function onKeyUp(e) {
	switch(e.keyCode){
		case 37:
			car.userData.left = false;
			break;
		case 38://up
			car.userData.forward = false;
			if (car.userData.velocity < 0) {
				car.forwardfriction = true;
				car.reversefriction = false;
				car.userData.aceleration = car.breaks;
			}
			else{
				car.reversefriction = true;
				car.forwardfriction = false;
				car.userData.aceleration = -car.breaks;
			}
			break;
		case 39:
			car.userData.right = false;
			break;
		case 40://down
			car.userData.back = false;
			if (car.userData.velocity > 0) { //esta linha de codigo é necessária porque o carro pode ainda estar a andar para a frente, 
				//e se não tivesse este if ele continuava andar para a frente em vez de travar
				car.userData.aceleration = -car.breaks;
				car.reversefriction = true;
				car.forwardfriction = false;
			}
			else if(car.userData.velocity < 0){
				car.userData.aceleration = car.breaks;
				car.forwardfriction = true; //o carro já não está a andar para a frente, logo desativa-se esta flag
				car.reversefriction = false;
			}
			break;
	}
}

function animate() {
	var tempo = clock.getDelta();
	var car = arrayObjs.getObjectByName("Car");
	var ac = car.userData.aceleration, v0 = car.userData.velocity, pos0 = car.position.x;
	//equacao do movimento
	var pos = pos0 + v0*tempo + 0.5*ac*tempo*tempo;
	var dis = pos - pos0;
	var vel = v0 + ac*tempo;	
	var rotateAngle = Math.PI * tempo;


	if(car.userData.forward){
		if(vel >= car.maxVelocityFront) {
			car.userData.velocity = vel;
		}
		car.translateX (dis);
		if(car.cameraFollow == true){
			camera.lookAt(car.position);
		}
		if(car.userData.back){ //caso a tecla para andar para frente e para tras forem premidas simultaneamente o carro aumenta o travao ate parar
			car.userData.aceleration = car.handbreak;
			if(car.userData.velocity > 0){ //se o caso já tiver parado, coloca as equações do movimento a zero
				car.userData.aceleration = 0;
				car.userData.velocity = 0;
			}
			else
				car.userData.aceleration = car.handbreak;
		}
		else {
			if(car.userData.left) {
				car.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
			}
			else if(car.userData.right) {		
				car.rotateOnAxis(new THREE.Vector3(0, 1, 0), - rotateAngle);
			}
			car.userData.aceleration = -car.a;
		}
	}

	else if(car.forwardfriction){
		car.userData.velocity = vel;
		car.translateX(dis);
		if(car.userData.velocity > 0) { //se o caso já tiver parado, coloca as equações do movimento a zero
			car.userData.velocity = 0;
			car.userData.aceleration = 0;
			car.forwardfriction = false;
		}
		else if(car.userData.left) {
			car.rotateOnAxis( new THREE.Vector3(0, 1, 0), rotateAngle);
		}
		else if(car.userData.right) {
			car.rotateOnAxis( new THREE.Vector3(0, 1, 0), -rotateAngle);
		}
	}

	else if(car.userData.back){
		car.userData.aceleration = car.a;
		if(vel <= car.maxVelocityBack) {
			car.userData.velocity = vel;
		}
		car.translateX(dis);
		if(car.userData.left) {
			car.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
		}
		else if(car.userData.right) {
			car.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
		}
	}

	else if(car.reversefriction){
		car.userData.velocity = vel;
		car.translateX (dis);
		car.forwardfriction = false; //coloca a falso porque o carro já não está a sofrer atrito para travar uma vez que não estava a andar para a frente 
		if(car.userData.velocity < 0){
			car.userData.velocity = 0;
			car.userData.aceleration = 0;
			car.reversefriction = false;
		}
		else if(car.userData.left) {
			car.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
		}
		else if(car.userData.right) {
			car.rotateOnAxis(new THREE.Vector3(0, 1, 0), - rotateAngle);
		}
	}

	render();
	requestAnimationFrame(animate);
}