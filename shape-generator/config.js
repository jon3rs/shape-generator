export const CONFIG = {
  stars: {
    innerStar: {
      innerRadius: 40,
      outerRadius: 70,
    },
    outerStar: {
      enabled: true,
      innerRadius: 100,
      outerRadius: 120,
    },
    spikes: 7,
    iterations: 5,
    stretchX: 1.5,
    thickness: 5,
    segments: 10,
  },
  connectors: {
    enabled: true,
    thickness: 5,
  },
  drawSkin: true,
  randomSeed: 0,
};

export const UI_CONFIG = {
  toggles: [
    {
      id: "draw-skin",
      path: "drawSkin",
    },
    {
      id: "outer-star",
      path: "stars.outerStar.enabled",
      toggles: [
        "inner-radius2",
        "outer-radius2",
        "iterations",
        "connections-thickness",
        "connections",
      ],
    },
    {
      id: "connections",
      path: "connectors.enabled",
      toggles: ["connections-thickness"],
    },
  ],
  buttons: [
    {
      id: "randomize-dots",
      path: "randomSeed",
    },
  ],
  sliders: [
    {
      id: "inner-radius",
      label: "Inner Radius",
      path: "stars.innerStar.innerRadius",
      min: 0,
      max: 400,
      step: 1,
    },
    {
      id: "outer-radius",
      label: "Outer Radius",
      path: "stars.innerStar.outerRadius",
      min: 0,
      max: 400,
      step: 1,
    },
    {
      id: "spikes",
      label: "Spikes",
      path: "stars.spikes",
      min: 3,
      max: 50,
      step: 1,
    },
    {
      id: "segments",
      label: "Detail",
      path: "stars.segments",
      min: 3,
      max: 50,
      step: 1,
    },
    {
      id: "star-thickness",
      label: "Thickness",
      path: "stars.thickness",
      min: 0.1,
      max: 10,
      step: 0.1,
    },
    {
      id: "stretch-x",
      label: "Horizontal Stretch",
      path: "stars.stretchX",
      min: 0,
      max: 5,
      step: 0.01,
    },
    {
      id: "inner-radius2",
      label: "Inner Radius",
      path: "stars.outerStar.innerRadius",
      min: 0,
      max: 400,
      step: 1,
    },
    {
      id: "outer-radius2",
      label: "Outer Radius",
      path: "stars.outerStar.outerRadius",
      min: 0,
      max: 400,
      step: 1,
    },
    {
      id: "iterations",
      label: "Iterations",
      path: "stars.iterations",
      min: 2,
      max: 20,
      step: 1,
    },
    {
      id: "connections-thickness",
      label: "Thickness",
      path: "connectors.thickness",
      min: 0,
      max: 10,
      step: 0.1,
    },
  ],
};
