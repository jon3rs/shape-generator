A little p5.js-based shape generator that lets you create one or multiple distorted stars that can be connected and downloaded as .stl-file.

Try it yourself ➡️ https://jon3rs.github.io/shape-generator/

Besides the wish for a procrastination project and maybe a printable soap dish or earring the main goal of this project was/is to solidify and expand my knowledge on geometry, vectors, etc., e.g.:

- how to generate a circle?
- in 3D space?
- on a plane that's perpendicular to a given vector?
- how to [connect](https://p5js.org/reference/p5/vertex/) the circle's generated vertices to form a cylinder?
- how to calculate the normal vector of each shape?
- how to calculate the circles' stretch factors at the intersection points of two vectors, so that the individual cylinders' thickness remains the same?

---

### to dos

- [x] do modulo approach instead of if-else
- [x] cross product of prev and next uv
- [x] generate circle on resulting plane
- [x] generate offset/stretch
- [x] make bisectorVectors always point outwards of star (not with %2)
- [x] add connection-splines
- [x] add normals to connection splines
- [x] update splines on spikes.update
- [x] add github page
- [ ] create actual readme
- [ ] actually print some shapes
- [ ] refactor
  - setup of control-elements contains a lot of repetition, look for ways to minimize
  - star-class in own file?

#### Bugs

- [ ] wrong slider positions on init

#### UI/UX

- [ ] dimensions guidelines (width, depth and height)
- [ ] responsiveness
  - [ ] bigger font and slider-thumb size (maybe even remove sliders completely if always bad for mobile)
- [ ] clearify that "randomize" only refers to the random factor of the individual dots
  - better label? (maybe randomize points position?)
- further controls
  - [ ] segmentsAmount star/connector
  - [ ] strength randomness (total vs x/y or even z?)

#### Further Feature Ideas

- [ ] rounded inner (and/or outer) corners of star
  - as long as the angle between two consecutive vectors > maxAngle add intermediate points
- [ ] add bubbles-option (randomly spread spheres along the stars vertices)
- [ ] add steps to reproduce/diy tutorial calculate cylindrical shapes vertices in 3D space
