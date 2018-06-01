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
	constructor(length, height, width, road) {
		super(0, 0, 60, 60);
		this.road = road;
		this.floor;
        this.geometry = new THREE.BoxGeometry(length, height, width,5 ,5 ,5);

        this.materialb = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
        this.materiall = new THREE.MeshLambertMaterial({ color: "rgb(10%, 10%, 10%)", emissive: "rgb(10%, 10%, 10%)" });
        this.materialp = new THREE.MeshPhongMaterial({ color: "rgb(10%, 10%, 10%)", emissive: "rgb(10%, 10%, 10%)", specular: "rgb(10%, 10%, 10%)", shininess: 20 });

		this.floor = new THREE.Mesh(this.geometry, this.materialb);
		this.floor.position.y = -30;
		this.add(this.floor);
		this.add(this.road);
	}

	update(time, light, lambert) {
        this.road.update(time, light, lambert);
        if (light) {
            if (lambert) {
                this.floor.material = this.materiall;
            }

            else {
                this.floor.material = this.materialp;
            }
        }
        else {
            this.floor.material = this.materialb;
        }
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

	update(time, light, lambert) {
		var i;
		for(i = 0; i < this.lineArray.length; i++)
            this.lineArray[i].update(time, light, lambert);
		for(i = 0; i < this.curveArray.length; i++)
            this.curveArray[i].update(time, light, lambert);
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

    update(time, light, lambert) {
		var i;
		for(i = 0; i < this.cheerioArray.length; i++) {
            this.cheerioArray[i].update(time, light, lambert);
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

    update(time, light, lambert) {
		var i;
		for(i = 0; i < this.cheerioArray.length; i++) {
            this.cheerioArray[i].update(time, light, lambert);
		}
	}
}

class Cheerio extends Box {
	constructor(x, y, z) {
		super(x, z, 0.6, 0.6);
		this.name;
		this.userData = {velocity: 0, aceleration: 0};
        this.geometry = new THREE.TorusGeometry(0.3, 0.1, 16, 50);

        this.materialb = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        this.materiall = new THREE.MeshLambertMaterial({ color: "rgb(84%, 41%, 2%)", emissive: "rgb(57%, 40%, 20%)" });
        this.materialp = new THREE.MeshPhongMaterial({ color: "rgb(84%, 41%, 2%)", emissive: "rgb(57%, 40%, 20%)", specular: 0x000000, shininess: 0 });

		this.cheerio = new THREE.Mesh(this.geometry, this.materialb);
		this.position.set(x, y, z);
		this.rotation.x = Math.PI / 2;
		this.add(this.cheerio);
		boxArray.push(this);
	}

	cheeriocol(other) {
		
		this.userData.velocity = other.userData.velocity;
		this.userData.aceleration = -15 * (other.userData.velocity / Math.abs(other.userData.velocity));
		if(other instanceof Cheerio) {
			other.userData.velocity = 0;
			other.userData.aceleration = 0;
		}
		this.rotation.z = other.rotation.z;
	}

	update(time, light, lambert) {
		var v = this.userData.velocity;
		var d = v * time + 0.5 * this.userData.aceleration * time * time;
		this.userData.velocity = v + time*this.userData.aceleration;
		this.translateX(d);
		if(v * this.userData.velocity < 0 || (v != 0 && this.userData.velocity == 0)) {
			this.userData.velocity = 0;
			this.userData.aceleration = 0;
		}
        this.setValues(this.position.x, this.position.z);

        if (light) {
            if (lambert) {
                this.cheerio.material = this.materiall;
            }

            else {
                this.cheerio.material = this.materialp;
            }
        }
        else {
            this.cheerio.material = this.materialb;
        }
	}
}

class Orange extends Box {
    constructor() {
		var x = Math.floor(Math.random() * (60)) - 30;
		var z = Math.floor(Math.random() * (60)) - 30;
		super(x, z, 3, 3);
		this.vel = (Math.random() * (3 - 0.1)) + 0.1;
        this.geometry = new THREE.SphereGeometry(1.5, 10, 10);

        this.materialb = new THREE.MeshBasicMaterial({ color: 0xFF8C00, wireframe: true });
        this.materiall = new THREE.MeshLambertMaterial({ color: "rgb(45%, 3%, 0%)", emissive: "rgb(69%, 44%, 0%)" });
        this.materialp = new THREE.MeshPhongMaterial({ color: "rgb(45%, 3%, 0%)", emissive: "rgb(69%, 44%, 0%)", specular: 0x000000, shininess: 0 });

        this.orange = new THREE.Mesh(this.geometry, this.materialb);

        this.geometry1 = new THREE.CylinderGeometry(0.1, 0.1, 1, 10, 10);

		this.materialb1 = new THREE.MeshBasicMaterial( { color: 0x3A1B0F, wireframe: true} );
        this.materiall1 = new THREE.MeshLambertMaterial({ color: "rgb(44%, 17%, 0%)", emissive: "rgb(0%, 0%, 0%)" });
        this.materialp1 = new THREE.MeshPhongMaterial({ color: "rgb(44%, 17%, 0%)", emissive: "rgb(0%, 0%, 0%)", specular: 0x000000, shininess: 0 });

        this.orange.caule = new THREE.Mesh(this.geometry1, this.materialb1);

		this.orange.caule.position.set(0,1.7,-0.5)
		this.orange.caule.rotateX(-Math.PI / 4);

		this.orange.add(this.orange.caule);
		this.add(this.orange);
		this.position.set(x, 1.5, z);
		this.orange.rotation.x = 0;
	}
	
	update(time, light, lambert){
		var d = this.vel * time + 0.5 * time * time;
		this.orange.rotation.x += (2 * this.vel * time) / 3;
		this.translateZ(d);
        this.setValues(this.position.x, this.position.z);

        if (light) {
            if (lambert) {
                this.orange.material = this.materiall;
            }

            else {
                this.orange.material = this.materialp;
            }
        }
        else {
            this.orange.material = this.materialb;
        }

        if (light) {
            if (lambert) {
                this.orange.caule.material = this.materiall1;
            }

            else {
                this.orange.caule.material = this.materialp1;
            }
        }
        else {
            this.orange.caule.material = this.materialb1;
        }
	}
}

class Butter extends Box {
    constructor(x, y, z) {
        super(x, z, 4, 2);
        this.geometry = new THREE.BoxGeometry(4, 2, 2);

        this.materialb = new THREE.MeshBasicMaterial({ color: 0xDAA520, wireframe: true });
        this.materiall = new THREE.MeshLambertMaterial({ color: "rgb(34%, 18%, 0%)", emissive: "rgb(76%, 71%, 0%)" });
        this.materialp = new THREE.MeshPhongMaterial({ color: "rgb(34%, 18%, 0%)", emissive: "rgb(76%, 71%, 0%)", specular: "rgb(19%, 13%, 7%)", shininess: 86  });

		this.butter = new THREE.Mesh(this.geometry, this.materialb);
        this.butter.position.set(x, y, z);
		this.add(this.butter);
    }

    update(light, lambert) {
        if (light) {
            if (lambert) {
                this.butter.material = this.materiall;
            }

            else {
                this.butter.material = this.materialp;
            }
        }
        else {
            this.butter.material = this.materialb;
        }
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
        this.body2 = new Body(0.6, 0.3, 0.5, 0, 0.30, 0);
		this.body3 = new Body(0.4, 0.1, 0.2, 0, 0.53, 0);
		this.roof = new Roof(1.2, 0.2, 1, 0.9, 0.85, 0);
        this.wheel1 = new Wheel(0.2, 0, 0.2, 0.36);
        this.wheel2 = new Wheel(0.2, 0, 0.2, -0.25);
        this.wheel3 = new Wheel(0.35, 1, 0.35, 0.62);
        this.wheel4 = new Wheel(0.35, 1, 0.35, -0.5);
        this.add(this.body1);
        this.add(this.body2);
		this.add(this.body3);
		this.add(this.roof);
        this.add(this.wheel1);
        this.add(this.wheel2);
        this.add(this.wheel3);
        this.add(this.wheel4);
		this.position.set(x, y, z);
    }

	update(tempo, light, lambert) {
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

        this.body1.update(light, lambert);
        this.body2.update(light, lambert);
        this.body3.update(light, lambert);
        this.roof.update(light, lambert);
        this.wheel1.update(light, lambert);
        this.wheel2.update(light, lambert);
        this.wheel3.update(light, lambert);
        this.wheel4.update(light, lambert);
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
		var geometry = new THREE.Geometry();
		var v1 = new THREE.Vector3(x + length/2, y + height/2, z - width/2);
		var v2 = new THREE.Vector3(x - length/2, y + height/2, z - width/2);
		var v3 = new THREE.Vector3(x - length/2, y + height/2, z + width/2);
		var v4 = new THREE.Vector3(x + length/2, y + height/2, z + width/2);
		var v5 = new THREE.Vector3(x + length/2, y - height/2, z - width/2);
		var v6 = new THREE.Vector3(x - length/2, y - height/2, z - width/2);
		var v7 = new THREE.Vector3(x - length/2, y - height/2, z + width/2);
		var v8 = new THREE.Vector3(x + length/2, y - height/2, z + width/2);
		var v9 = new THREE.Vector3(x, y + height/2, z);//cima
		var v10 = new THREE.Vector3(x, y - height/2, z); //baixo
		var v11 = new THREE.Vector3(x, y, z - width/2);//tras
		var v12	= new THREE.Vector3(x, y, z + width/2);//frente
		var v13 = new THREE.Vector3(x + length/2, y, z);//direita
		var v14 = new THREE.Vector3(x - length/2, y, z);//esquerda
		geometry.vertices.push(v1);
		geometry.vertices.push(v2);
		geometry.vertices.push(v3);
		geometry.vertices.push(v4);
		geometry.vertices.push(v5);
		geometry.vertices.push(v6);
		geometry.vertices.push(v7);
		geometry.vertices.push(v8);
		geometry.vertices.push(v9);
		geometry.vertices.push(v10);
		geometry.vertices.push(v11);
		geometry.vertices.push(v12);
		geometry.vertices.push(v13);
		geometry.vertices.push(v14);
		//cima
        geometry.faces.push(new THREE.Face3(1,0,8));
        geometry.faces.push(new THREE.Face3(0,8,3));
        geometry.faces.push(new THREE.Face3(3,8,2));
        geometry.faces.push(new THREE.Face3(2,8,1));
        //baixo
        geometry.faces.push(new THREE.Face3(5,9,4));
        geometry.faces.push(new THREE.Face3(4,9,7));
        geometry.faces.push(new THREE.Face3(7,9,6));
        geometry.faces.push(new THREE.Face3(6,9,5));
        //tras
        geometry.faces.push(new THREE.Face3(1,10,0));
        geometry.faces.push(new THREE.Face3(0,10,4));
        geometry.faces.push(new THREE.Face3(4,10,5));
        geometry.faces.push(new THREE.Face3(5,10,1));
        //frente
        geometry.faces.push(new THREE.Face3(3,11,7));
        geometry.faces.push(new THREE.Face3(7,11,6));
        geometry.faces.push(new THREE.Face3(6,11,2));
        geometry.faces.push(new THREE.Face3(2,11,3));
        //direita
        geometry.faces.push(new THREE.Face3(0,12,4));
        geometry.faces.push(new THREE.Face3(4,12,7));
        geometry.faces.push(new THREE.Face3(7,12,3));
        geometry.faces.push(new THREE.Face3(3,12,0));
        //esquerda
        geometry.faces.push(new THREE.Face3(2,13,1));
        geometry.faces.push(new THREE.Face3(1,13,5));
        geometry.faces.push(new THREE.Face3(5,13,6));
        geometry.faces.push(new THREE.Face3(6,13,2));



        geometry.computeFaceNormals();

        this.materialb = new THREE.MeshBasicMaterial({ color: 0x0AAAA0, wireframe: true, side: THREE.DoubleSide });
        this.materiall = new THREE.MeshLambertMaterial({ color: "rgb(1%, 58%, 50%)", emissive: "rgb(37%, 33%, 29%)", side: THREE.DoubleSide });
        this.materialp = new THREE.MeshPhongMaterial({ color: "rgb(1%, 58%, 50%)", emissive: "rgb(37%, 33%, 29%)", specular: "rgb(48%, 48%, 46%)", shininess: 128, side: THREE.DoubleSide });

        this.box = new THREE.Mesh(geometry, this.materialb);
        this.add(this.box);
    }

    update(light, lambert) {
        if (light) {
            if (lambert) {
                this.box.material = this.materiall;
            }

            else {
                this.box.material = this.materialp;
            }
        }
        else {
            this.box.material = this.materialb;
        }
    }
}

class Roof extends THREE.Object3D {
    constructor(length, height, width, x, y, z) {
		super();
        var geometry = new THREE.Geometry();
		var v1 = new THREE.Vector3(x + length/4, y + height/2, z - width/2);
		var v2 = new THREE.Vector3(x - length/4, y + height/2, z - width/2);
		var v3 = new THREE.Vector3(x - length/4, y + height/2, z + width/2);
		var v4 = new THREE.Vector3(x + length/4, y + height/2, z + width/2);
		var v5 = new THREE.Vector3(x + length/2, y - height/2, z - width/2);
		var v6 = new THREE.Vector3(x - length/2, y - height/2, z - width/2);
		var v7 = new THREE.Vector3(x - length/2, y - height/2, z + width/2);
		var v8 = new THREE.Vector3(x + length/2, y - height/2, z + width/2);
		geometry.vertices.push(v1);
		geometry.vertices.push(v2);
		geometry.vertices.push(v3);
		geometry.vertices.push(v4);
		geometry.vertices.push(v5);
		geometry.vertices.push(v6);
		geometry.vertices.push(v7);
		geometry.vertices.push(v8);
		geometry.faces.push( new THREE.Face3( 3, 2, 7 ) );
		geometry.faces.push( new THREE.Face3( 2, 7, 6 ) );
		geometry.faces.push( new THREE.Face3( 1, 0, 5 ) );
		geometry.faces.push( new THREE.Face3( 0, 5, 4 ) );
		geometry.faces.push( new THREE.Face3( 1, 2, 0 ) );
		geometry.faces.push( new THREE.Face3( 2, 0, 3 ) );
		geometry.faces.push( new THREE.Face3( 5, 6, 4 ) );
		geometry.faces.push( new THREE.Face3( 6, 4, 7 ) );
		geometry.faces.push( new THREE.Face3( 0, 3, 4 ) );
		geometry.faces.push( new THREE.Face3( 3, 4, 7 ) );
		geometry.faces.push( new THREE.Face3( 1, 2, 5 ) );
        geometry.faces.push( new THREE.Face3( 2, 5, 6 ) );

        geometry.computeFaceNormals();

        this.materialb = new THREE.MeshBasicMaterial({ color: 0x0AAAA0, wireframe: true, side: THREE.DoubleSide });
        this.materiall = new THREE.MeshLambertMaterial({ color: "rgb(1%, 58%, 50%)", emissive: "rgb(37%, 33%, 29%)", side: THREE.DoubleSide });
        this.materialp = new THREE.MeshPhongMaterial({ color: "rgb(1%, 58%, 50%)", emissive: "rgb(37%, 33%, 29%)", specular: "rgb(48%, 48%, 46%)", shininess: 128, side: THREE.DoubleSide });

	    this.box = new THREE.Mesh(geometry, this.materialb);
        this.add(this.box);
    }

    update(light, lambert) {
        if (light) {
            if (lambert) {
                this.box.material = this.materiall;
            }

            else {
                this.box.material = this.materialp;
            }
        }
        else {
            this.box.material = this.materialb;
        }
    }
}

class Wheel extends THREE.Object3D {
    constructor(radius, x, y, z) {
		super();
        var geometry = new THREE.Geometry();
		var center = new THREE.Vector3(0, 0, 0);
		geometry.vertices.push(center);
		var first = new THREE.Vector3(radius, 0, 0);
		var vec;
		for(var i = 0; i <= 96; i++) {
			vec = first.clone();
			geometry.vertices.push(vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), i * Math.PI/48));
		}
		for(i = 2; i < geometry.vertices.length; i++) {
			geometry.faces.push(new THREE.Face3(0, i, i-1));
		}
		
		var n = geometry.vertices.length;

		var center2 = new THREE.Vector3(0, 0, -0.12);
		geometry.vertices.push(center2);
		var first2 = new THREE.Vector3(radius, 0, -0.12);
		for(var i = 0; i <= 96; i++) {
			vec = first2.clone();
			geometry.vertices.push(vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), i * Math.PI/48));
		}
		for(i = 2 + n; i < geometry.vertices.length; i++) {
			geometry.faces.push(new THREE.Face3(n, i, i-1));
		}

		for(i = 2; i < geometry.vertices.length/2; i++) {
			geometry.faces.push(new THREE.Face3(i, i-1, i+n-1));
			geometry.faces.push(new THREE.Face3(i+n, i+n-1, i));
        }

        geometry.computeFaceNormals();

        this.materialb = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, side: THREE.DoubleSide });
        this.materiall = new THREE.MeshLambertMaterial({ color: "rgb(100%, 14%, 10%)", emissive: "rgb(52%, 19%, 8%)", side: THREE.DoubleSide });
        this.materialp = new THREE.MeshPhongMaterial({ color: "rgb(100%, 14%, 10%)", emissive: "rgb(52%, 19%, 8%)", specular: "rgb(22%, 22%, 17%)", shininess: 10, side: THREE.DoubleSide });

	    this.wheel = new THREE.Mesh(geometry, this.materialb);
        this.wheel.position.set(x, y, z);
        this.add(this.wheel);
    }

    update(light, lambert) {
        if (light) {
            if (lambert) {
                this.wheel.material = this.materiall;
            }

            else {
                this.wheel.material = this.materialp;
            }
        }
        else {
            this.wheel.material = this.materialb;
        }
    }
}

class GameZone extends THREE.Object3D {
	constructor(floor, car) {
        super();
        this.lamb = true;
        this.l = false;
		this.floor = floor;
		this.car = car;
        this.orangeArray = [];
        this.butterArray = [];
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

    addButter(butter) {
        this.butterArray.push(butter);
        this.add(butter);
    }

	update(time) {
		this.car.update(time, this.l, this.lamb);
		var i = 0;
		while(i < this.orangeArray.length) {
			this.orangeArray[i].vel *= this.speedUp;
            this.orangeArray[i].update(time, this.l, this.lamb);
			i += 1;
        }
        i = 0;
        while (i < this.butterArray.length) {
            this.butterArray[i].update(this.l, this.lamb);
            i += 1;
        }
        this.floor.update(time, this.l, this.lamb);
	}
}