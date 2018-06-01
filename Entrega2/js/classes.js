class Box extends THREE.Object3D {
	constructor(x, y, l, w) {
		super();
		this.l = l;
		this.w = w;
		this.xmin = x - l/2;
		this.xmax = x + l/2;
		this.ymin = y - w/2;
		this.ymax = y + w/2;
	}

	cTest(other) {
		return this.xmax > other.xmin && this.xmin < other.xmax && this.ymax > other.ymin && this.ymin < other.ymax;
	}

	setValues(x, y) {
		this.xmin = x - this.l/2;
		this.xmax = x + this.l/2;
		this.ymin = y - this.w/2;
		this.ymax = y + this.w/2;
	}
}

class Floor extends Box {
	constructor(x, y, z, road) {
		super(0, 0, 60, 60);
		this.road = road;
		this.floor;
		var geometry = new THREE.BoxGeometry(x, y, z);
		var material = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true} );
		this.floor = new THREE.Mesh(geometry, material);
		this.floor.position.y = -30;
		this.add(this.floor);
		this.add(this.road);
	}

	update(time) {
		this.road.update(time);
	}
}

class Road extends THREE.Object3D {
	constructor() {
		super();
		this.lineArray = [];
		this.curveArray = [];
	}

	addCurve(x, y, z, number, no) {
		var curve = new Curve(x, y, z, number, no);
		this.lineArray.push(curve);
		this.add(curve);
	}

	addLine(x, y, z, number, no) {
		var line = new Line(x, y, z, number, no);
		this.lineArray.push(line);
		this.add(line);
	}

	update(time) {
		var i;
		for(i = 0; i < this.lineArray.length; i++)
			this.lineArray[i].update(time);
		for(i = 0; i < this.curveArray.length; i++)
			this.curveArray[i].update(time);
	}
}

class Line extends THREE.Object3D {
	constructor(x, y, z, number, no) {
		super();
		this.cheerioArray = [];
		var i;
		for (i = 0; i < number; i++, x -= 2) {
			var cheerio = new Cheerio(x, y, z);
			cheerio.name = "L" + i + " " + no;
			this.cheerioArray.push(cheerio);
			this.add(cheerio);
		}
	}

	update(time) {
		var i;
		for(i = 0; i < this.cheerioArray.length; i++) {
			this.cheerioArray[i].update(time);
		}
	}
}

class Curve extends THREE.Object3D {
	constructor(x, y, z, number, no) {
		super();
		this.cheerioArray = [];
		var i;
		var vector = new THREE.Vector2(x, z);
		var p = new THREE.Vector2(x, 0);
		var cheerio = new Cheerio(x, y, z);
		cheerio.name = "C0" + " " + no;
		this.cheerioArray.push(cheerio);
		this.add(cheerio);
		for (i = 0; i < number; i++) {
			vector.rotateAround(p, (Math.PI/number));
			cheerio = new Cheerio(vector.getComponent(0), y, vector.getComponent(1));
			cheerio.name = "C" + (i + 1) + " " + no;
			this.cheerioArray.push(cheerio);
			this.add(cheerio);
		}
	}

	update(time) {
		var i;
		for(i = 0; i < this.cheerioArray.length; i++) {
			this.cheerioArray[i].update(time);
		}
	}
}

class Cheerio extends Box {
	constructor(x, y, z) {
		super(x, z, 0.6, 0.6);
		this.name;
		this.userData = {velocity: 0, aceleration: 0};
		var geometry = new THREE.TorusGeometry(0.3, 0.1, 16, 50);
		var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true });
		var cheerio = new THREE.Mesh(geometry, material);
		this.position.set(x, y, z);
		this.rotation.x = Math.PI / 2;
		this.add(cheerio);
		boxArray.push(this);
	}

	cheeriocol(other) {
		
		this.userData.velocity = other.userData.velocity;
		this.userData.aceleration = -15 * (other.userData.velocity / Math.abs(other.userData.velocity));
		if(other instanceof Cheerio) {
			other.userData.velocity = 0;
			other.userData.aceleration = 0;
			this.rotation.z = other.rotation.z;
		}
		else {
			this.rotation.z = other.rotation.z;
		}
	}

	update(time) {
		var v = this.userData.velocity;
		var d = v * time + 0.5 * this.userData.aceleration * time * time;
		this.userData.velocity = v + time*this.userData.aceleration;
		this.translateX(d);
		if(v * this.userData.velocity < 0 || (v != 0 && this.userData.velocity == 0)) {
			this.userData.velocity = 0;
			this.userData.aceleration = 0;
		}
		this.setValues(this.position.x, this.position.z);
	}
}

class Orange extends Box {
    constructor() {
		var x = Math.floor(Math.random() * (60)) - 30;
		var z = Math.floor(Math.random() * (60)) - 30;
		super(x, z, 3, 3);
		this.vel = (Math.random() * (3 - 0.1)) + 0.1;
		var geometry = new THREE.SphereGeometry(1.5, 10, 10);
		var material = new THREE.MeshBasicMaterial( { color: 0xFF8C00, wireframe: true} );
		this.orange = new THREE.Mesh(geometry, material);

		var geometry1 = new THREE.CylinderGeometry(0.1, 0.1, 1, 10, 10);
		var material1 = new THREE.MeshBasicMaterial( { color: 0x3A1B0F, wireframe: true} );
		this.orange.caule = new THREE.Mesh(geometry1, material1);

		this.orange.caule.position.set(0,1.7,-0.5)
		this.orange.caule.rotateX(-Math.PI / 4);

		this.orange.add(this.orange.caule);
		this.add(this.orange);
		this.position.set(x, 1.5, z);
		this.orange.rotation.x = 0;
	}
	
	update(time){
		var d = this.vel * time + 0.5 * time * time;
		this.orange.rotation.x += (2 * this.vel * time) / 3;
		this.translateZ(d);
		this.setValues(this.position.x, this.position.z);
	}
}

class Butter extends Box {
    constructor(x, y, z) {
        super(x, z, 4, 2);
        var geometry = new THREE.BoxGeometry(4, 2, 2);
		var material = new THREE.MeshBasicMaterial( { color: 0xDAA520, wireframe: true} );
		var butter = new THREE.Mesh(geometry, material);
        butter.position.set(x, y, z);
		this.add(butter);
    }
}

class Car extends Box {
    constructor(x, y, z) {
		super(x - 0.5, z, 1.6, 1.6);
		
		this.userData = {right: false, left: false, forward: false, back: false, velocity: 0, aceleration: 0};
		this.maxVelocityFront = -12;
		this.maxVelocityBack = 6;
		this.breaks = 6;
		this.a = 6;
		this.handbreak = 8;
		this.forwardfriction = false;
		this.reversefriction = false;

        this.body1 = new Body(1.2, 0.6, 1, 0.9, 0.45, 0);
        this.body2 = new Body(0.6, 0.3, 0.6, 0, 0.30, 0);
        this.body3 = new Body(0.4, 0.1, 0.2, 0, 0.53, 0);
        this.wheel1 = new Wheel(0.1, 0.05, 20, 10, 0, 0.15, 0.35);
        this.wheel2 = new Wheel(0.1, 0.05, 20, 10, 0, 0.15, -0.35);
        this.wheel3 = new Wheel(0.12, 0.05, 20, 10, 1, 0.17, 0.6);
        this.wheel4 = new Wheel(0.12, 0.05, 20, 10, 1, 0.17, -0.6);
        this.add(this.body1);
        this.add(this.body2);
        this.add(this.body3);
        this.add(this.wheel1);
        this.add(this.wheel2);
        this.add(this.wheel3);
        this.add(this.wheel4);
        this.position.set(x, y, z);
    }

	update(tempo) {
		var ac = this.userData.aceleration, v0 = this.userData.velocity;
		//equacao do movimento
		var dis = v0*tempo + 0.5*ac*tempo*tempo;
		var vel = v0 + ac*tempo;	
		var rotateAngle = 0.75 * Math.PI * tempo;

		if(this.userData.forward){
			if(vel >= this.maxVelocityFront) {
				this.userData.velocity = vel;
			}
			this.translateX (dis);

			if(this.userData.back){ //caso a tecla para andar para frente e para tras forem premidas simultaneamente o carro aumenta o travao ate parar
				this.userData.aceleration = this.handbreak;
				if(this.userData.velocity > 0){ //se o caso já tiver parado, coloca as equações do movimento a zero
					this.userData.aceleration = 0;
					this.userData.velocity = 0;
				}
				else
					this.userData.aceleration = this.handbreak;
			}
			else {
				if(this.userData.left) {
					this.rotateY(rotateAngle);
				}
				else if(this.userData.right) {		
					this.rotateY(- rotateAngle);
				}
				this.userData.aceleration = -this.a;
			}
		}
	
		else if(this.forwardfriction){
			this.userData.velocity = vel;
			this.translateX(dis);
			if(this.userData.velocity > 0) { //se o caso já tiver parado, coloca as equações do movimento a zero
				this.userData.velocity = 0;
				this.userData.aceleration = 0;
				this.forwardfriction = false;
			}
			else if(this.userData.left) {
				this.rotateY(rotateAngle);
			}
			else if(this.userData.right) {
				this.rotateY(-rotateAngle);
			}
		}
	
		else if(this.userData.back){
			this.userData.aceleration = this.a;
			if(vel <= this.maxVelocityBack) {
				this.userData.velocity = vel;
			}
			this.translateX(dis);
			if(this.userData.left) {
				this.rotateY(rotateAngle);
			}
			else if(this.userData.right) {
				this.rotateY(-rotateAngle);
			}
		}
	
		else if(this.reversefriction){
			this.userData.velocity = vel;
			this.translateX (dis);
			this.forwardfriction = false; //coloca a falso porque o carro já não está a sofrer atrito para travar uma vez que não estava a andar para a frente 
			if(this.userData.velocity < 0){
				this.userData.velocity = 0;
				this.userData.aceleration = 0;
				this.reversefriction = false;
			}
			else if(this.userData.left) {
				this.rotateY(rotateAngle);
			}
			else if(this.userData.right) {
				this.rotateY(- rotateAngle);
			}
		}
		this.setValues(this.position.x, this.position.z);
	}

	carandorange() {
		this.userData = {right: false, left: false, forward: false, back: false, velocity: 0, aceleration: 0};
		this.forwardfriction = false;
		this.reversefriction = false;
		this.position.set(0, 0, -12);
		this.lookAt(new THREE.Vector3(-1, 0, 0));
	}

	carandbutter() {
		if(this.userData.velocity != 0) {
			this.userData.velocity = 0;
			this.userData.aceleration = 0;
			this.userData.left = false;
			this.userData.right = false;
		}
	}
}

class Body extends THREE.Object3D {
    constructor(length, height, width, x, y, z) {
        super();
        var geometry = new THREE.BoxGeometry(length, height, width);
	    var material = new THREE.MeshBasicMaterial( { color: 0x0AAAA0, wireframe: true } );
	    var box = new THREE.Mesh(geometry, material);
	    box.position.set(x, y, z);
        this.add(box);
    }
}

class Wheel extends THREE.Object3D {
    constructor(radius, tube, radialSegments, tubularSegments, x, y, z) {
        super();
        var geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
	    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	    var wheel = new THREE.Mesh(geometry, material);
        wheel.position.set(x, y, z);
        this.add(wheel);
    }
}

class GameZone extends THREE.Object3D {
	constructor(floor, car) {
		super();
		this.floor = floor;
		this.car = car;
		this.orangeArray = [];
		this.speedUp = 1;
		this.add(floor);
		this.add(car);
		var that = this;
		window.setInterval(function(){ that.speedUp += 0.00001; }, 1000);
	}

	setFloor(floor) {
		this.floor = floor;
	}

	setCar(car) {
		this.car = car;
	}

	addOrange(orange) {
		this.orangeArray.push(orange);
		this.add(orange);
	}

	update(time) {
		this.car.update(time);
		var i = 0;
		while(i < this.orangeArray.length) {
			this.orangeArray[i].vel *= this.speedUp;
			this.orangeArray[i].update(time);
			i += 1;
		}
		this.floor.update(time);
	}
}