import { CONFIG } from "./config.js";
import { UIController } from "./classes/UIController.js";

var docSketch = function (d) {
  let buttonDownload;

  let orbitControl = true;
  let starShapes = [];
  let connectors = [];

  let width, height;
  let angle;
  let segments = 20;

  let splines = [];

  let initialInnerRadius = 40;
  let innerRadius = initialInnerRadius;
  let initialOuterRadius = 70;
  let outerRadius = initialOuterRadius;
  let initialInnerRadius2 = 100;
  let innerRadius2 = initialInnerRadius2;
  let initialOuterRadius2 = 200;
  let outerRadius2 = initialOuterRadius2;

  let spikes = 7;
  let starPoints = spikes * 2;
  let randomX = 0.2;
  let randomY = 0.08;
  let starThickness = 5;
  let iterations = 3;
  let stretchX = 1.8;
  let stars = [];
  let randomness = [];
  let sketchContainer;
  let starAngle;
  let initialConfig;

  let wholeModel;

  let uiController;

  d.setup = function () {
    sketchContainer = document
      .getElementById("soap-dish-container")
      .getBoundingClientRect();

    initialConfig = structuredClone
      ? structuredClone(CONFIG)
      : JSON.parse(JSON.stringify(CONFIG));

    uiController = new UIController(initialConfig, (newConfig) => {
      updateStars(newConfig);
    });
    uiController.init();
    console.log("config: ", initialConfig);
    width = sketchContainer.width;
    height = sketchContainer.height;
    angle = d.TWO_PI / segments;
    starAngle = d.TWO_PI / starPoints;
    d.randomSeed(2);
    d.createCanvas(width, height, d.WEBGL);

    buttonDownload = document.getElementById("save-stl");

    let controlsDiv = document.getElementsByClassName("controls");
    console.log("controlsDiv: ", controlsDiv);
    controlsDiv.forEach((div) => {
      console.log("div: ", div);
      div.addEventListener("mouseenter", () => {
        console.log("orbitControl false");
        orbitControl = false;
      });
      div.addEventListener("mouseleave", () => {
        console.log("orbitControl true");

        orbitControl = true;
      });
      div.addEventListener("touchstart", () => {
        console.log("orbitControl false");
        orbitControl = false;
      });
      div.addEventListener("touchend", () => {
        console.log("orbitControl true");
        orbitControl = true;
      });
    });

    buttonDownload.addEventListener("click", (event) => {
      let stl = getWholeModel();
      stl.saveStl("soap-dish.stl", { binary: true });
    });

    innerRadius = initialInnerRadius;
    generateRandomnessPerVertex();

    updateStars(initialConfig);

    generateConnectors(initialConfig);
    d.background(0);
  };

  d.draw = function () {
    if (orbitControl) {
      d.orbitControl();
    }
    d.push();
    //d.translate(0, -100, 0);
    //d.noFill();
    d.background(220);
    //d.stroke(210, 90, 240);
    d.fill(220, 0, 255);
    d.noStroke();
    // d.ambientLight(218, 112, 214);
    //d.pointLight(255, 250, 250, 80, -20, 50);
    let co = d.color(255, 255, 0);
    let position = d.createVector(0, 0, 100);
    let direction = d.createVector(1, 0.5, -1);
    d.directionalLight(co, direction);
    //d.spotLight(co, position, direction, d.PI / 3, 10);

    //d.sphere(100);

    d.pointLight(200, 255, 200, 20, 15, -50);
    d.directionalLight(70, 0, 255, 0, -1, -1);
    let c = d.color(255, 255, 255);
    d.specularColor(c);
    d.specularMaterial(10, 100, 0);
    //d.sphere(50);
    //d.emissiveMaterial(200);
    //d.shininess(100);

    if (initialConfig?.drawSkin) {
      stars.forEach((star, index) => {
        d.model(starShapes[index]);
      });
      connectors.forEach((connector, index) => {
        d.model(connector);
      });
    } else {
      d.stroke(0);
      d.strokeWeight(1);
      stars.forEach((star, index) => {
        star.drawStar();
      });
      splines.forEach((spline, index) => {
        spline.drawLine();
      });
    }
    d.pop();
    //d.strokeWeight(1);
  };

  d.windowResized = function () {
    sketchContainer = document
      .getElementById("soap-dish-container")
      .getBoundingClientRect();
    width = sketchContainer.width;
    height = sketchContainer.height;
    d.resizeCanvas(width, height);
  };

  function getWholeModel() {
    wholeModel = d.buildGeometry(() => {
      stars.forEach((star, index) => {
        d.model(starShapes[index]);
      });
      connectors.forEach((connector, index) => {
        d.model(connector);
      });
    });
    return wholeModel;
  }

  function generateConnectors(config = initialConfig) {
    connectors = [];
    splines = [];
    let innerStarVertices = stars[0].getAnglePoints();
    let outerStarVertices = stars[stars.length - 1].getAnglePoints();
    for (let c = 0; c < innerStarVertices.length / 2; c++) {
      let spline = new Spline(
        [innerStarVertices[c * 2], outerStarVertices[c * 2]],
        config?.connectors?.thickness ? config.connectors.thickness : 3
      );
      spline.init();
      splines[c] = spline;
      connectors[c] = spline.geometryObject;
    }
  }

  function updateStars(config = null) {
    console.log("updateStars called with config: ", config, initialConfig);
    if (!config) {
      console.error("No config provided to updateStars");
      return;
    }
    segments = config.stars.segments;
    angle = d.TWO_PI / segments;
    spikes = config.stars.spikes;
    iterations = config.stars.iterations;
    starThickness = config.stars.thickness;
    innerRadius = config.stars.innerStar.innerRadius;
    outerRadius = config.stars.innerStar.outerRadius;
    innerRadius2 = config.stars.outerStar.innerRadius;
    outerRadius2 = config.stars.outerStar.outerRadius;
    let curveType = config.stars.curveType;
    let offsetHandle = config.stars.offsetHandle;
    let intermediatePoints = config.stars.intermediatePoints;

    stretchX = config.stars.stretchX;
    starAngle = d.TWO_PI / (spikes * 2);
    generateRandomnessPerVertex(config.randomSeed);

    stars = [];
    connectors = [];
    starShapes = [];
    splines = [];
    if (config.stars.outerStar.enabled === false) {
      let star = new Star(
        config.stars.innerStar.innerRadius,
        config.stars.innerStar.outerRadius,
        config.stars.spikes,
        segments,
        config.stars.thickness,
        curveType,
        offsetHandle,
        intermediatePoints
      );
      stars.push(star);
      star.init();
      starShapes[0] = star.geometryObject;
    } else {
      for (let i = 0; i < iterations; i++) {
        let iR = d.map(i, 0, iterations - 1, innerRadius, innerRadius2);
        let oR = d.map(i, 0, iterations - 1, outerRadius, outerRadius2);

        let star = new Star(
          iR,
          oR,
          spikes,
          segments,
          starThickness,
          curveType,
          offsetHandle,
          intermediatePoints
        );
        stars.push(star);
        star.init();
        starShapes[i] = star.geometryObject;
        d.redraw();
      }
      if (config?.connectors?.enabled) {
        console.log(
          "Generating connectors with config: ",
          config.connectors.enabled
        );
        generateConnectors(config);
      }
    }
  }

  function generateRandomnessPerVertex(randomSeed = 0) {
    d.randomSeed(randomSeed);
    randomness = [];
    for (let a = 0; a < spikes * 2; a++) {
      let random = d.createVector(
        1 + d.random(-randomX, randomX),
        1 + d.random(-randomY, randomY)
      );
      randomness.push(random);
    }
  }

  class Spline {
    constructor(points, thickness = 3) {
      this.points = points;
      this.geometryObject;
      this.segments = 8;
      this.angle = d.TWO_PI / this.segments;
      this.thickness = thickness;
      this.splineSkinVertices = [];
    }
    init() {
      console.log("Spline init with thickness: ", this.thickness);
      this.generateSplineSkinVertices();
      this.geometryObject = this.getGeometry();
    }

    generateSplineSkinVertices() {
      if (this.points.length !== 2) return null;
      let uV = this.points[1].copy().sub(this.points[0].copy()).normalize();
      let perpendicularUV = d.createVector(-uV.y, uV.x, 0).normalize();
      let crossUV = d.createVector(0, 0, 1).normalize(); //uV.cross(perpendicularUV).normalize();

      this.points.forEach((point, index) => {
        this.splineSkinVertices[index] = [];
        for (let i = 0; i < this.segments; i++) {
          let v = d.createVector(
            point.x +
              this.thickness * d.cos(this.angle * i) * perpendicularUV.x +
              this.thickness * d.sin(this.angle * i) * crossUV.x,
            point.y +
              this.thickness * d.cos(this.angle * i) * perpendicularUV.y +
              this.thickness * d.sin(this.angle * i) * crossUV.y,
            point.z +
              this.thickness * d.cos(this.angle * i) * perpendicularUV.z +
              this.thickness * d.sin(this.angle * i) * crossUV.z
          );
          this.splineSkinVertices[index][i] = v;
        }
      });
    }

    drawLine() {
      if (this.points.length !== 2) return null;
      d.stroke(0);
      d.strokeWeight(1);
      d.line(
        this.points[0].x,
        this.points[0].y,
        this.points[0].z,
        this.points[1].x,
        this.points[1].y,
        this.points[1].z
      );
    }

    getGeometry() {
      if (this.points.length !== 2) return null;
      let uV = this.points[1].copy().sub(this.points[0].copy()).normalize();
      let perpendicularUV = d.createVector(-uV.y, uV.x, 0).normalize();
      let crossUV = d.createVector(0, 0, 1).normalize(); //uV.cross(perpendicularUV).normalize();

      this.points.forEach((point) => {});
      return d.buildGeometry(() => {
        for (let i = 0; i < this.segments; i++) {
          let nextIndex = (i + 1) % this.segments;

          let a = this.splineSkinVertices[0][i];
          let b = this.splineSkinVertices[1][i];
          let c = this.splineSkinVertices[0][nextIndex];
          let dd = this.splineSkinVertices[1][nextIndex];
          let v1 = p5.Vector.sub(b, a);
          let v2 = p5.Vector.sub(c, a);
          let normal = p5.Vector.cross(v1, v2).normalize();
          normal.mult(-1);
          d.beginShape(d.TRIANGLE);
          d.normal(normal);
          d.vertex(a.x, a.y, a.z);
          d.vertex(b.x, b.y, b.z);
          d.vertex(c.x, c.y, c.z);
          d.endShape(d.CLOSE);
          d.beginShape(d.TRIANGLE);
          d.normal(normal);
          d.vertex(c.x, c.y, c.z);
          d.vertex(dd.x, dd.y, dd.z);
          d.vertex(b.x, b.y, b.z);
          d.endShape(d.CLOSE);
        }
      });
    }
  }

  class Star {
    constructor(
      innerRadius,
      outerRadius,
      spikes,
      segments,
      thickness = 5,
      curveType = "LINEAR",
      offsetHandle,
      intermediatePoints
    ) {
      this.innerRadius = innerRadius;
      this.spikes = spikes;
      this.outerRadius = outerRadius;
      this.segments = segments;
      this.thickness = thickness;
      this.starSkinVertices = [];
      this.anglePoints = [];
      this.allPoints = [];
      this.handlePoints = [];
      this.bisectorVectors = [];
      this.crossVectors = [];
      this.boneVectors = [];
      this.geometryObject;
      this.curveType = curveType;
      this.offsetHandle = offsetHandle;
      this.intermediatePoints = intermediatePoints;
    }

    init() {
      console.log(
        "initializing star with innerRadius: ",
        this.innerRadius,
        this.outerRadius,
        "spikes: ",
        this.spikes,
        "segments: ",
        this.segments,
        "thickness: ",
        this.thickness
      );
      this.generatePoints();
      this.generateBones();
      console.log("curvetype: ", this.curveType);
      if (this.curveType !== "LINEAR") {
        this.generateIntermediatePoints();
      }
      console.log("all Points: ", this.allPoints);
      this.generateSkinVertices();
      this.geometryObject = this.getGeometry();
    }

    getAnglePoints() {
      return this.anglePoints;
    }

    getHandlePoints() {
      return this.handlePoints;
    }

    generatePoints() {
      this.anglePoints = [];
      for (let i = 0; i < this.spikes * 2; i++) {
        let r;
        if (i % 2 === 0) {
          r = this.outerRadius;
        } else {
          r = this.innerRadius;
        }

        this.anglePoints.push(
          d.createVector(
            r * d.cos(starAngle * i) * randomness[i].x * stretchX,
            r * d.sin(starAngle * i) * randomness[i].y,
            0
          )
        );
        this.allPoints = this.anglePoints;
      }
    }
    createQuadrBezierPoint(p1, p2, p3, t = 0.5) {
      console.log("t= ", t);
      let x1 = p1.x + (p2.x - p1.x) * t;
      let y1 = p1.y + (p2.y - p1.y) * t;
      let x2 = p2.x + (p3.x - p2.x) * t;
      let y2 = p2.y + (p3.y - p2.y) * t;
      let newX = x1 + (x2 - x1) * t;
      let newY = y1 + (y2 - y1) * t;
      let newV = d.createVector(newX, newY, 0);
      return newV;
    }

    getHandlePoints(anglePointIndex) {
      console.log("boneVectors: ", anglePointIndex, this.boneVectors);
      let prevIndex =
        (anglePointIndex - 1 + this.boneVectors.length) %
        this.boneVectors.length;
      console.log("prevIndex: ", prevIndex);

      let nextIndex = (anglePointIndex + 1) % this.boneVectors.length;
      //this.allPoints.push(this.anglePoints[prevIndex]);
      let prevUV = this.boneVectors[prevIndex].copy().normalize();
      let nextUV = this.boneVectors[anglePointIndex].copy().normalize();
      let bisector = d
        .createVector(
          prevUV.x - nextUV.x,
          prevUV.y - nextUV.y,
          prevUV.z - nextUV.z
        )
        .normalize();

      // ✅ Get perpendicular vector in XY plane
      let perpendicularInPlane = d
        .createVector(0, 0, 1)
        .cross(bisector)
        .normalize();

      // If bisector is parallel to Z-axis, use different approach
      if (perpendicularInPlane.mag() < 0.001) {
        perpendicularInPlane = d.createVector(1, 0, 0); // Fallback
      }

      let angleBetweenVectors = p5.Vector.angleBetween(
        this.boneVectors[prevIndex],
        this.boneVectors[anglePointIndex]
      );
      console.log("angleBetweenVectors: ", angleBetweenVectors);
      let handlePointOffset = this.offsetHandle;
      let handlePoint = d.createVector(
        this.anglePoints[anglePointIndex].x +
          perpendicularInPlane.x * handlePointOffset,
        this.anglePoints[anglePointIndex].y +
          perpendicularInPlane.y * handlePointOffset,
        0
      );
      let handlePoint2 = d.createVector(
        this.anglePoints[anglePointIndex].x -
          perpendicularInPlane.x * handlePointOffset,
        this.anglePoints[anglePointIndex].y -
          perpendicularInPlane.y * handlePointOffset,
        0
      );
      return [handlePoint, handlePoint2];
    }

    generateIntermediatePoints() {
      this.allPoints = [];
      /*       this.anglePoints.forEach((anglePoint, index) => {
       */
      let curveSteps = this.intermediatePoints;
      this.boneVectors.forEach((vector, index) => {
        this.handlePoints[index] = [];

        switch (this.curveType) {
          case "LINEAR":
            this.allPoints.push(this.anglePoints[index]);
            break;
          case "QUADRATIC_BEZIER_INNER":
            if (!(index % 2 == 0)) {
              this.handlePoints[index] = this.getHandlePoints(index);
            }
            break;
          case "QUADRATIC_BEZIER_OUTER":
            if (index % 2 == 0) {
              this.handlePoints[index] = this.getHandlePoints(index).reverse();
            }
            break;
          case "CUBIC_BEZIER":
            if (index % 2 == 0) {
              this.handlePoints[index] = this.getHandlePoints(index).reverse();
            } else {
              this.handlePoints[index] = this.getHandlePoints(index);
            }
            break;
          default:
            console.error("Unknown curve type: ", this.curveType);
        }
      });
      if (
        this.curveType === "QUADRATIC_BEZIER_INNER" ||
        this.curveType === "QUADRATIC_BEZIER_OUTER"
      ) {
        this.anglePoints.forEach((anglePoint, index) => {
          let increment = 1 / iterations;
          for (let i = 0; i < curveSteps; i++) {
            let nextIndex = (index + 1) % this.anglePoints.length;
            //let increment = 1 - i;
            console.log("increment: ", increment);
            let handlePoint;
            if (this.handlePoints[index].length === 0) {
              handlePoint = this.handlePoints[nextIndex][0].copy();
            } else {
              handlePoint = this.handlePoints[index][1].copy();
            }
            let t = i / (curveSteps + 1);
            let nextIntermediatePoint = this.createQuadrBezierPoint(
              anglePoint,
              handlePoint,
              this.anglePoints[nextIndex],
              t
            );
            this.allPoints.push(nextIntermediatePoint);
          }
        });
      } else if (this.curveType === "CUBIC_BEZIER") {
        this.anglePoints.forEach((anglePoint, index) => {
          let increment = 1 / iterations;
          for (let i = 0; i < curveSteps; i++) {
            let nextIndex = (index + 1) % this.anglePoints.length;
            //let increment = 1 - i;
            console.log("increment: ", increment);
            let t = i / (curveSteps + 1);
            let v1 = this.createQuadrBezierPoint(
              anglePoint,
              this.handlePoints[index][1],
              this.handlePoints[nextIndex][0],
              t
            );
            let v2 = this.createQuadrBezierPoint(
              this.handlePoints[index][1],
              this.handlePoints[nextIndex][0],
              this.anglePoints[nextIndex],
              t
            );
            /* let handlePoint;
            if (this.handlePoints[index].length === 0) {
              handlePoint = this.handlePoints[nextIndex][0].copy();
            } else {
              handlePoint = this.handlePoints[index][1].copy();
            } */
            let x = d.lerp(v1.x, v2.x, t);
            let y = d.lerp(v1.y, v2.y, t);
            let nextIntermediatePoint = d.createVector(
              x,
              y,
              0
            ); /* this.createQuadrBezierPoint(
              anglePoint,
              handlePoint,
              this.anglePoints[nextIndex],
              t
            ); */
            this.allPoints.push(nextIntermediatePoint);
          }
        });
      }
      /* if (index % 2 == 0) return;
        console.log("didn't return", index);

        console.log("handlePoint: ", handlePoint);
        //console.log("anglePoints[index]: ", this.angle
        this.handlePoints[index].push(handlePoint.copy());
        this.handlePoints[index].push(handlePoint2.copy());
        let curveSteps = 20;
        let increment = 1 / iterations;
        for (let i = 1; i <= curveSteps; i++) {
          //let increment = 1 - i;
          console.log("increment: ", increment);
          let t = i / (curveSteps + 1);
          let prevV = this.createQuadrBezierPoint(
            this.anglePoints[prevIndex],
            handlePoint,
            this.anglePoints[index],
            t
          );
          this.allPoints.push(prevV);
        }
        this.allPoints.push(this.anglePoints[index]);
        for (let i = 1; i <= curveSteps; i++) {
          //let increment = 1 - i;
          console.log("increment: ", increment);
          let t = i / (curveSteps + 1);
          let prevV = this.createQuadrBezierPoint(
            this.anglePoints[index],
            handlePoint2,
            this.anglePoints[nextIndex],
            t
          );
          this.allPoints.push(prevV);
        } */

      //this.allPoints.push(nextV);
      /* if (angleBetweenVectors > 0) {
          bisector.mult(-1);
          perpendicularInPlane.mult(-1);
        } */
      /* });
      console.log("handlePoints: ", this.handlePoints); */
      this.generateBones();
      /*       });
       */
    }

    generateBones() {
      this.boneVectors = [];
      this.allPoints.forEach((anglePoint, index) => {
        let nextIndex = (index + 1) % this.allPoints.length;

        let vector = d.createVector(
          this.allPoints[nextIndex].x - anglePoint.x,
          this.allPoints[nextIndex].y - anglePoint.y,
          this.allPoints[nextIndex].z - anglePoint.z
        );
        this.boneVectors.push(vector);
      });
    }

    generateSkinVertices() {
      this.bisectorVectors = [];
      this.boneVectors.forEach((vector, index) => {
        let prevIndex =
          (index - 1 + this.boneVectors.length) % this.boneVectors.length;

        let prevUV = this.boneVectors[prevIndex].copy().normalize();
        let nextUV = vector.copy().normalize();
        let bisector = d
          .createVector(
            prevUV.x - nextUV.x,
            prevUV.y - nextUV.y,
            prevUV.z - nextUV.z
          )
          .normalize();
        let crossUV = prevUV.cross(nextUV).normalize();
        let angleBetweenVectors = p5.Vector.angleBetween(
          this.boneVectors[prevIndex],
          vector
        );
        if (angleBetweenVectors > 0) {
          // Flip the direction by multiplying by -1
          bisector.mult(-1);
          crossUV.mult(-1);
        }
        this.bisectorVectors.push(bisector);
        this.crossVectors.push(crossUV);

        let sinHalfAngle = d.cos(angleBetweenVectors * 0.5);
        if (Math.abs(sinHalfAngle) < 0.001) {
          sinHalfAngle = 0.001; // Prevent division by very small numbers
        }
        let rStretched = this.thickness / sinHalfAngle;
        //skinVertices[index] = [];
        this.starSkinVertices[index] = [];

        for (let i = 0; i < this.segments; i++) {
          let skinVertex = d.createVector(
            this.allPoints[index].x +
              rStretched * d.cos(angle * i) * this.bisectorVectors[index].x +
              this.thickness * d.sin(angle * i) * this.crossVectors[index].x,
            this.allPoints[index].y +
              rStretched * d.cos(angle * i) * this.bisectorVectors[index].y +
              this.thickness * d.sin(angle * i) * this.crossVectors[index].y,
            this.allPoints[index].z +
              rStretched * d.cos(angle * i) * this.bisectorVectors[index].z +
              this.thickness * d.sin(angle * i) * this.crossVectors[index].z
          );
          //skinVertices[index][i] = skinVertex;
          this.starSkinVertices[index][i] = skinVertex;
        }
      });
    }

    drawStar() {
      this.boneVectors.forEach((vector, index) => {
        let nextIndex = (index + 1) % this.boneVectors.length;
        d.line(
          this.allPoints[index].x,
          this.allPoints[index].y,
          this.allPoints[index].z,
          this.allPoints[nextIndex].x,
          this.allPoints[nextIndex].y,
          this.allPoints[nextIndex].z
        );
      });
    }

    getGeometry() {
      return d.buildGeometry(() => {
        this.drawSkin();
      });
    }

    drawSkin() {
      /* d.stroke(160);
      d.strokeWeight(1); */
      //d.noStroke();
      // d.ambientLight(218, 112, 214);
      //d.pointLight(255, 250, 250, 80, -20, 50);
      let co = d.color(255, 120, 0);
      let position = d.createVector(0, 0, 100);
      let direction = d.createVector(0, 0.5, -1);
      //d.directionalLight(co, direction);
      //d.spotLight(co, position, direction, d.PI / 3, 10);
      //d.pointLight(255, 200, 255, 0, 0, -100);
      // d.directionalLight(255, 255, 255, 0, -1, 0);
      let c = d.color(20, 255, 200);
      //d.specularColor(c);
      //d.specularMaterial(255, 255, 255);
      //d.sphere(50);
      //d.emissiveMaterial(200);
      //d.shininess(100);
      this.starSkinVertices.forEach((ellipsePoints, index) => {
        let nextAngleIndex = (index + 1) % this.starSkinVertices.length;
        for (let s = 0; s < this.segments; s++) {
          let nextS = (s + 1) % this.segments;
          let v1 = p5.Vector.sub(
            this.starSkinVertices[nextAngleIndex][s],
            this.starSkinVertices[index][s]
          );
          let v2 = p5.Vector.sub(
            this.starSkinVertices[index][nextS],
            this.starSkinVertices[index][s]
          );
          //this.starSkinVertices[nextAngleIndex][s]
          let normal = p5.Vector.cross(v1, v2).normalize();

          /* d.line(
            this.starSkinVertices[index][s].x + normal.x * 8,
            this.starSkinVertices[index][s].y + normal.y * 8,
            this.starSkinVertices[index][s].z + normal.z * 8,
            this.starSkinVertices[index][s].x + normal.x * 20,
            this.starSkinVertices[index][s].y + normal.y * 20,
            this.starSkinVertices[index][s].z + normal.z * 20
          ); */
          d.beginShape();
          d.normal(normal);
          d.vertex(
            this.starSkinVertices[index][s].x,
            this.starSkinVertices[index][s].y,
            this.starSkinVertices[index][s].z
          );
          d.vertex(
            this.starSkinVertices[nextAngleIndex][s].x,
            this.starSkinVertices[nextAngleIndex][s].y,
            this.starSkinVertices[nextAngleIndex][s].z
          );
          d.vertex(
            this.starSkinVertices[index][nextS].x,
            this.starSkinVertices[index][nextS].y,
            this.starSkinVertices[index][nextS].z
          );
          d.endShape(d.CLOSE);
          d.beginShape();
          d.vertex(
            this.starSkinVertices[index][nextS].x,
            this.starSkinVertices[index][nextS].y,
            this.starSkinVertices[index][nextS].z
          );
          d.vertex(
            this.starSkinVertices[nextAngleIndex][s].x,
            this.starSkinVertices[nextAngleIndex][s].y,
            this.starSkinVertices[nextAngleIndex][s].z
          );
          d.vertex(
            this.starSkinVertices[nextAngleIndex][nextS].x,
            this.starSkinVertices[nextAngleIndex][nextS].y,
            this.starSkinVertices[nextAngleIndex][nextS].z
          );

          d.endShape(d.CLOSE);
        }
      });
    }
  }
};

var doc = new p5(docSketch, "docSketch");
