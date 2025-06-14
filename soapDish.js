var soapDish = function (sD) {
  let spikes = 7;
  let outerRadius = 100;
  let spikeSizeFactor = 1.3;
  let points = [];
  let randomness = 0.2;
  let pointsRandomFactor = [];
  let stretchX = 1.5;
  let width, height;
  let sketchContainer;

  sD.setup = function () {
    sketchContainer = document
      .getElementById("soapDish")
      .getBoundingClientRect();
    width = sketchContainer.width;
    height = sketchContainer.height;
    sD.createCanvas(width, height, sD.WEBGL);
    pointsRandomFactor = generateRandomnessPerVertex();
    points = generateDistortedStarVertices(
      spikes,
      outerRadius,
      pointsRandomFactor
    );
  };

  function generateDistortedStarVertices(
    spikesAmount,
    starRadius,
    vertexRandomFactors
  ) {
    let doubledSpikes = spikesAmount * 2;
    let starVertices = [];
    for (let i = 0; i < doubledSpikes; i++) {
      let radius = starRadius;
      if (i % 2 == 0) {
        radius = starRadius * spikeSizeFactor;
      }
      let point = sD.createVector(
        sD.cos((sD.TWO_PI / doubledSpikes) * i) *
          radius *
          stretchX *
          vertexRandomFactors[i].x,
        sD.sin((sD.TWO_PI / doubledSpikes) * i) *
          radius *
          vertexRandomFactors[i].y,
        0
      );
      starVertices.push(point);
    }
    return starVertices;
  }

  function generateRandomnessPerVertex() {
    /**
     * @todo randomnessX and randomnessY
     */
    let randomnessPerVertex = [];
    for (let i = 0; i < spikes * 2; i++) {
      let randomFactorX = sD.random(1 - randomness, 1 + randomness);
      let randomFactorY = sD.random(1 - randomness, 1 + randomness);
      randomnessPerVertex.push(sD.createVector(randomFactorX, randomFactorY));
    }
    return randomnessPerVertex;
  }

  sD.draw = function () {
    sD.background(220);
    //fill(255);
    sD.stroke(0);
    sD.strokeWeight(2);
    sD.beginShape();
    points.forEach((point, index) => {
      sD.vertex(point.x, point.y, point.z);
    });
    sD.endShape(sD.CLOSE);
  };

  sD.windowResized = function () {
    sketchContainer = document
      .getElementById("soapDish")
      .getBoundingClientRect();
    width = sketchContainer.width;
    height = sketchContainer.height;
    sD.resizeCanvas(width, height);
  };
};

var myp5 = new p5(soapDish, "soapDish");
