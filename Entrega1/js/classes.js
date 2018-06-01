class Floor extends THREE.Object3D {
	constructor(x, y, z, road) {
		super();
		this.x = x;
		this.y = y;
		this.z = z;
		this.road = road;
		this.make();
	}

	make() {
		var geometry = new THREE.BoxGeometry(this.x, this.y, this.z);
		var material = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true} );
		var floor = new THREE.Mesh(geometry, material);
		floor.position.y = -30;
		this.add(floor);
		this.add(this.road);
	}
	
	setRoad(road) {
		this.road = road;
		this.make();
	}

	setX(x) {
		this.x = x;
		this.make();
	}

	setY(y) {
		this.y = y;
		this.make();
	}

	setZ(z) {
		this.z = z;
		this.make();
	}
}

class Road extends THREE.Object3D {
	constructor() {
		super();
		this.lineArray = [];
		this.curveArray = [];
	}

	setLines(lines) {
		this.lineArray = lines;
	}

	setCurves(curves) {
		this.curveArray = curves;
	}

	addCurve(x, y, z, number) {
		var curve = new Curve(x, y, z, number);
		this.lineArray.push(curve);
		this.add(curve);
	}

	addLine(x, y, z, number) {
		var line = new Line(x, y, z, number);
		this.lineArray.push(line);
		this.add(line);
	}
}

class Line extends THREE.Object3D {
	constructor(x, y, z, number) {
		super();
		this.cheerioArray = [];
		var i;
		for (i = 0; i < number; i++, x -= 1.5) {
			var cheerio = new Cheerio(x, y, z);
			this.cheerioArray.push(cheerio);
			this.add(cheerio);
		}
	}
}

class Curve extends THREE.Object3D {
	constructor(x, y, z, number) {
		super();
		this.cheerioArray = [];
		var i;
		var vector = new THREE.Vector2(x, z);
		var p = new THREE.Vector2(x, 0);
		var cheerio = new Cheerio(x, y, z);
		this.cheerioArray.push(cheerio);
		this.add(cheerio);
		for (i = 0; i < number; i++) {
			vector.rotateAround(p, (Math.PI/number));
			cheerio = new Cheerio(vector.getComponent(0), y, vector.getComponent(1));
			this.cheerioArray.push(cheerio);
			this.add(cheerio);
		}
	}
}

class Cheerio extends THREE.Object3D {
	constructor(x, y, z) {
		super();
		this.x = x;
		this.y = y;
		this.z = z;
		this.make();
	}
	
	make() {
		var geometry = new THREE.TorusGeometry(0.3, 0.1, 16, 50);
		var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true });
		var cheerio = new THREE.Mesh(geometry, material);

		cheerio.position.set(this.x, this.y, this.z);
		cheerio.rotation.x = Math.PI / 2;
		this.add(cheerio);
	}

	setX(x) {
		this.x = x;
		this.make();
	}

	setY(y) {
		this.y = y;
		this.make();
	}

	setZ(z) {
		this.z = z;
		this.make();
	}
}

class Orange extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.make();
    }

    make() {
		var geometry = new THREE.SphereGeometry(1.5, 10, 10);
		var material = new THREE.MeshBasicMaterial( { color: 0xFF8C00, wireframe: true} );
		var orange = new THREE.Mesh(geometry, material);
        orange.position.set(this.x, this.y, this.z);
		this.add(orange);
	}

	setX(x) {
		this.x = x;
		this.make();
	}

	setY(y) {
		this.y = y;
		this.make();
	}

	setZ(z) {
		this.z = z;
		this.make();
	}
}

class Butter extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.x = x;
		this.y = y;
		this.z = z;
        this.make();
    }

    make() {
		var geometry = new THREE.BoxGeometry(4, 2, 2);
		var material = new THREE.MeshBasicMaterial( { color: 0xDAA520, wireframe: true} );
		var butter = new THREE.Mesh(geometry, material);
        butter.position.set(this.x, this.y, this.z);
		this.add(butter);
	}

	setX(x) {
		this.x = x;
		this.make();
	}

	setY(y) {
		this.y = y;
		this.make();
	}

	setZ(z) {
		this.z = z;
		this.make();
	}
}

class Car extends THREE.Object3D {
    constructor(x, y, z) {
        super();
		this.name = "Car";
        this.x = x;
        this.y = y;
        this.z = z;

		this.userData = {forward: false, right: false, left: false, back: false, velocity: 0, aceleration: 0};
		this.forwardfriction = false;
		this.reversefriction = false;
		this.cameraFollow = false;
		this.a = 5;
		this.maxVelocityFront = -12;
		this.maxVelocityBack = 6;
		this.breaks = 6;
		this.handbreak = 8;

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
        this.position.set(this.x, this.y, this.z);
    }

	setX(x) {
		this.x = x;
		this.make();
	}

	setY(y) {
		this.y = y;
		this.make();
	}

	setZ(z) {
		this.z = z;
		this.make();
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