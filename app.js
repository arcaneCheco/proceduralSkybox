import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import fragmentShader from "./shaders/sky/fragment.glsl";
import vertexShader from "./shaders/sky/vertex.glsl";
import fragmentPost from "./shaders/post/fragment.glsl";
import vertexPost from "./shaders/post/vertex.glsl";

class World {
  constructor() {
    this.splitScreen = false;
    this.post = false;
    this.time = 0;
    this.container = document.querySelector("#canvas");
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.init();
    window.addEventListener("resize", this.resize.bind(this));
    this.addObject();
    this.resize();
    this.setDebug();
    this.post && this.setPost();
    this.render();
  }

  skyDebug() {
    const sky = this.debug.addFolder({ title: "sky", expanded: false });
    sky
      .addInput(this.uniforms.uSkyColor, "value", {
        view: "color",
        label: "skyColor",
      })
      .on("change", () =>
        this.uniforms.uSkyColor.value.multiplyScalar(1 / 255)
      );
    sky.addInput(this.uniforms.uSkyBrightness, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "skyBrightness",
    });
  }

  horizonDebug() {
    const horizon = this.debug.addFolder({ title: "horizon", expanded: false });
    horizon.addInput(this.uniforms.uHorizonBrightness, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "horizonBrightness",
    });
    horizon.addInput(this.uniforms.uHorizonIntensity, "value", {
      min: 1,
      max: 10,
      step: 0.001,
      label: "horizonIntensity",
    });
    horizon.addInput(this.uniforms.uHorizonHeight, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "height",
    });
  }

  mountainDebug() {
    const mountain = this.debug.addFolder({
      title: "mountain",
      expanded: false,
    });
    mountain
      .addInput(this.uniforms.uMountain1Color, "value", {
        view: "color",
        label: "color-1",
      })
      .on("change", () =>
        this.uniforms.uMountain1Color.value.multiplyScalar(1 / 255)
      );
    mountain.addInput(this.uniforms.uMountain1Height, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "height-1",
    });
    mountain
      .addInput(this.uniforms.uMountain2Color, "value", {
        view: "color",
        label: "color-2",
      })
      .on("change", () =>
        this.uniforms.uMountain2Color.value.multiplyScalar(1 / 255)
      );
    mountain.addInput(this.uniforms.uMountain2Height, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "height-2",
    });
  }

  cloudsDebug() {
    const clouds = this.debug.addFolder({ title: "clouds", expanded: false });
    clouds
      .addInput(this.uniforms.uCloudColor, "value", {
        view: "color",
        label: "color",
      })
      .on("change", () =>
        this.uniforms.uCloudColor.value.multiplyScalar(1 / 255)
      );
    clouds.addInput(this.uniforms.uCloudsLowerBound, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "lower bound",
    });
    clouds.addInput(this.uniforms.uCloudsGradient, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "gradient",
    });
    clouds.addInput(this.uniforms.uCloudSpeed, "value", {
      min: 0,
      max: 6,
      step: 0.001,
      label: "speed",
    });
    const edges = clouds.addFolder({ title: "harder edges" });
    edges
      .addButton({ title: "hard edges" })
      .on(
        "click",
        () =>
          (this.uniforms.uCloudHardEdges.value =
            !this.uniforms.uCloudHardEdges.value)
      );
    edges.addInput(this.uniforms.uCloudHardEdgeDensity, "value", {
      min: 0,
      max: 1,
      step: 0.0001,
      label: "density",
    });
    edges.addInput(this.uniforms.uCloudHardEdgeCut, "value", {
      min: 0,
      max: 1,
      step: 0.0001,
      label: "cut",
    });
  }

  moonDebug() {
    const moon = this.debug.addFolder({ title: "moon", expanded: false });
    moon.addInput(this.uniforms.uMoonSize, "value", {
      min: 0,
      max: 0.2,
      step: 0.00001,
      label: "size",
    });
    const position = moon.addFolder({ title: "position" });
    position.addInput(this.uniforms.uMoonPosition.value, "x", {
      min: -5,
      max: 5,
      step: 0.01,
    });
    position.addInput(this.uniforms.uMoonPosition.value, "y", {
      min: -5,
      max: 5,
      step: 0.01,
    });
    position.addInput(this.uniforms.uMoonPosition.value, "z", {
      min: -5,
      max: 5,
      step: 0.01,
    });
    moon.addInput(this.uniforms.uMoonHaloSize, "value", {
      min: 0,
      max: 0.35,
      step: 0.0001,
      label: "halo size",
    });
    moon.addInput(this.uniforms.uMoonHaloGradient, "value", {
      min: 1,
      max: 2.5,
      step: 0.0001,
      label: "halo gradient",
    });
    moon
      .addInput(this.uniforms.uMoonColor, "value", {
        view: "color",
        label: "color",
      })
      .on("change", () =>
        this.uniforms.uMoonColor.value.multiplyScalar(1 / 255)
      );
    moon.addInput(this.uniforms.uMoonGradient, "value", {
      min: 1,
      max: 1.1,
      step: 0.0001,
      label: "disc gradient",
    });
  }

  setDebug() {
    this.uniforms = this.material.uniforms;
    this.pane = new Pane();
    this.debug = this.pane.addFolder({ title: "debug", expanded: true });
    this.skyDebug();
    this.horizonDebug();
    this.mountainDebug();
    this.cloudsDebug();
    this.moonDebug();
  }

  init() {
    this.sceneLeft = new THREE.Scene();
    this.sceneRight = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, 1, 0.1, 200);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x555555);
    this.renderer.autoClear = !this.splitScreen;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.z = 0.5;
    this.camera.position.y = 0.2;
    this.textureLoader = new THREE.TextureLoader();
  }

  addObject() {
    this.geometry = new THREE.SphereGeometry(1);
    this.geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));

    this.matcap = this.textureLoader.load("matcapWhite.jpeg");
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uGreyNoise: { value: this.textureLoader.load("greyNoise.png") },
        uMatcap: { value: this.matcap },
        uTestMap: { value: this.textureLoader.load("StandardCubeMap.png") },
        uCameraPos: { value: new THREE.Vector3() },
        // sky
        uSkyColor: { value: new THREE.Color("#ff9f21") },
        uSkyBrightness: { value: 0.22 },
        // horizon
        uHorizonBrightness: { value: 0.35 },
        uHorizonIntensity: { value: 9 },
        uHorizonHeight: { value: 0.21 },
        // mountain
        uMountain1Height: { value: 0.3 },
        uMountain1Color: { value: new THREE.Color("#4C3326") },
        uMountain2Height: { value: 0.2 },
        uMountain2Color: { value: new THREE.Color("#010101") },
        // clouds
        uCloudColor: { value: new THREE.Color("#010101") },
        uCloudsLowerBound: { value: 0 },
        uCloudsGradient: { value: 0.8 },
        uCloudSpeed: { value: 3 },
        uCloudHardEdges: { value: true },
        uCloudHardEdgeDensity: { value: 0.6 },
        uCloudHardEdgeCut: { value: 0.3 },
        // moon
        uMoonSize: { value: 0.026 },
        // uMoonPosition: { value: new THREE.Vector3(0, 0, -1) },
        uMoonPosition: { value: new THREE.Vector3(1, 1.74, -0.9) },
        uMoonHaloSize: { value: 0.3 },
        uMoonHaloGradient: { value: 1.9 },
        uMoonColor: { value: new THREE.Color("#ffffff") },
        uMoonGradient: { value: 1.0111 },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.sceneLeft.add(this.mesh);

    const groundG = new THREE.CircleGeometry(1, 50);
    const groundM = new THREE.MeshBasicMaterial({ color: "green" });
    const ground = new THREE.Mesh(groundG, groundM);
    ground.rotation.x = -Math.PI / 2;
    // this.sceneLeft.add(ground);

    const plane = new THREE.PlaneGeometry(1, 1);
    let m = new THREE.MeshNormalMaterial();
    m = this.material.clone();
    m.side = THREE.FrontSide;
    this.plane = new THREE.Mesh(plane, this.material);

    this.sceneRight.add(this.plane);
  }

  setPost() {
    this.rt = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    this.materialPost = new THREE.ShaderMaterial({
      vertexShader: vertexPost,
      fragmentShader: fragmentPost,
      uniforms: {
        uMap: { value: this.rt.texture },
      },
    });
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.materialPost
    );
    this.postScene = new THREE.Scene();
    this.postScene.add(mesh);
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.splitScreen && (this.camera.aspect *= 0.5);

    this.camera.updateProjectionMatrix();
  }

  update() {
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uCameraPos.value.copy(this.camera.position);
    // this.plane.material.uniforms.uTime.value = this.time;
  }

  renderSplitScreen() {
    this.renderer.clear();
    this.renderer.setViewport(0, 0, 0.5 * this.width, this.height);
    this.renderer.render(this.sceneLeft, this.camera);

    this.renderer.clearDepth();
    this.renderer.setViewport(
      0.5 * this.width,
      0,
      0.5 * this.width,
      this.height
    );
    this.renderer.render(this.sceneRight, this.camera);
  }

  render() {
    this.time += 0.01633;
    this.update();

    if (this.splitScreen) {
      this.renderSplitScreen();
    } else if (this.post) {
      this.renderer.setRenderTarget(this.rt);
      this.renderer.render(this.sceneLeft, this.camera);
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.postScene, this.camera);
    } else {
      this.renderer.render(this.sceneLeft, this.camera);
    }

    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
