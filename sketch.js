// GLOBAL CONTROL: Set to true to use p5.brush watercolor effects, false for original rendering
const USE_BRUSH = true;
const overlayalpha = 50;

function setup() {
  // Diverse colorset from vending machine goods (snacks + beverages)
  let vendingColorset = [
    // Chip bag yellows & golds
    [255, 215, 0], // Bright gold (Lay's Classic)
    [255, 195, 50], // Warm yellow (snack bags)
    [242, 169, 0], // Golden yellow

    // Oranges & warm tones
    [255, 140, 0], // Vibrant orange (Doritos, Crush)
    [255, 99, 71], // Tomato red-orange (Doritos Nacho)
    [255, 127, 80], // Coral (snack packaging)

    // Reds & pinks
    [220, 20, 60], // Crimson (Pepsi, Doritos)
    [199, 21, 133], // Deep pink (candy/gum wrappers)
    [178, 34, 34], // Fire brick (Dr Pepper, dark reds)
    [240, 80, 80], // Salmon red (Pringles)

    // Blues & purples
    [0, 48, 135], // Deep Pepsi blue
    [65, 105, 225], // Royal blue (Gatorade, packaging)
    [138, 43, 226], // Blue violet (candy bars)
    [100, 149, 237], // Cornflower blue (lighter packaging)
    [147, 112, 219], // Medium purple (candy)

    // Greens
    [34, 139, 34], // Forest green (7Up bottles)
    [50, 205, 50], // Lime green (Mountain Dew)
    [173, 255, 47], // Yellow-green (bright Dew)
    [60, 179, 113], // Sea green (mint packaging)
    [144, 238, 144], // Light green (packaging accents)

    // Browns & earth tones
    [139, 69, 19], // Saddle brown (beer bottles)
    [160, 82, 45], // Sienna (chocolate, coffee)
    [205, 133, 63], // Peru brown (lighter brown bags)
    [188, 143, 143], // Rosy brown (chocolate bars)

    // Metallic & silver tones
    [192, 192, 192], // Silver (beverage packaging)
    [169, 169, 169], // Dark gray (metallic chips)
    [211, 211, 211], // Light gray (silver accents)

    // Additional vibrant tones
    [255, 20, 147], // Deep pink (bright candy)
    [255, 165, 0], // Orange (Fanta, cheese puffs)
    [70, 130, 180], // Steel blue (cans)
    [147, 197, 114], // Muted sage green
    [230, 190, 255], // Lavender (light purple snacks)
  ];

  // Define polygon types for each segment
  let polygonTypes = ["triangle", "square", "hexagon", "diamond"];

  // Define different goodsize and goodensity for each segment
  let goodsizes = [
    random(30, 90), // Segment 1
    random(20, 80), // Segment 2
    random(50, 90), // Segment 3
    random(35, 85), // Segment 4
  ];

  // Create canvas - WEBGL mode required for p5.brush
  if (USE_BRUSH && typeof brush !== "undefined") {
    createCanvas(600, 600, WEBGL);
    background(40); // Blackchalk color
    // Shift origin to top-left for consistency with 2D mode
    translate(-width / 2, -height / 2);
    // Initialize p5.brush
    brush.load();
    configureBrushDefaults();
  } else {
    createCanvas(600, 600);
    background(40); // Blackchalk color
  }

  // Step 1: Pick first line connecting two opposite edges
  let line1 = {};
  let line1Vertical = random() < 0.5;

  if (line1Vertical) {
    // Line 1 connects top-bottom
    line1.x1 = random(100, width - 100);
    line1.y1 = 0;
    line1.x2 = random(100, width - 100);
    line1.y2 = height;
  } else {
    // Line 1 connects left-right
    line1.x1 = 0;
    line1.y1 = random(100, height - 100);
    line1.x2 = width;
    line1.y2 = random(100, height - 100);
  }

  // Step 2: Find a perpendicular line that connects the other two opposite edges
  let line2 = {};
  let angle1 = atan2(line1.y2 - line1.y1, line1.x2 - line1.x1);
  let angle2 = angle1 + HALF_PI;
  let maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Pick a random point on line1
    let t = random(0.2, 0.8); // Stay away from edges
    let px = line1.x1 + t * (line1.x2 - line1.x1);
    let py = line1.y1 + t * (line1.y2 - line1.y1);

    // Find where perpendicular line hits canvas edges
    line2 = findEdgePoints(px, py, angle2);

    // Check if line2 connects the other two opposite edges
    if (connectsOppositeEdges(line2) && !connectsSameEdges(line1, line2)) {
      break;
    }
  }

  // Use the intersection point as center (the "heart")
  let intersection = findLineIntersection(line1, line2);
  let cx = intersection.x;
  let cy = intersection.y;
  let heart = { x: cx, y: cy };

  // Collect all 4 edge points where lines hit the canvas
  let edgePoints = [
    { x: line1.x1, y: line1.y1 },
    { x: line1.x2, y: line1.y2 },
    { x: line2.x1, y: line2.y1 },
    { x: line2.x2, y: line2.y2 },
  ];

  // Define the 4 corners
  let corners = [
    { x: 0, y: 0, name: "top-left" },
    { x: width, y: 0, name: "top-right" },
    { x: width, y: height, name: "bottom-right" },
    { x: 0, y: height, name: "bottom-left" },
  ];

  let densityreduce = 0.4;
  let goodensities = [
    random(1.7, 2.3) - densityreduce, // Segment 1 density multiplier
    random(1.8, 2.2) - densityreduce, // Segment 2 density multiplier
    random(1.6, 2.4) - densityreduce, // Segment 3 density multiplier
    random(1.9, 2.1) - densityreduce, // Segment 4 density multiplier
  ];

  // For each corner, find its 2 closest edge points and draw the segment
  for (let i = 0; i < 4; i++) {
    // Find the 2 edge points closest to this corner
    let closestPoints = findClosestEdgePoints(corners[i], edgePoints);

    // Only draw if we have exactly 2 edge points for this corner
    if (closestPoints.length === 2) {
      // Define the segment boundary
      let segmentVertices = [
        corners[i],
        closestPoints[0],
        { x: cx, y: cy },
        closestPoints[1],
      ];

      // Fill segment with grid of polygons aligned with the lines
      fillSegmentWithPolygons(
        segmentVertices,
        polygonTypes[i],
        vendingColorset,
        angle1,
        goodsizes[i],
        goodensities[i],
      );
    }
  }

  // Draw pepcircle1 around the heart
  // Circle center is randomly placed within a distance range from heart
  let minDistFromHeart = 20;
  let maxDistFromHeart = 80;
  let distFromHeart = random(minDistFromHeart, maxDistFromHeart);
  let angleFromHeart = random(TWO_PI);

  let pepcircle1 = {
    x: heart.x + cos(angleFromHeart) * distFromHeart,
    y: heart.y + sin(angleFromHeart) * distFromHeart,
    radius: 0,
  };

  // Radius must be larger than distance from circle center to heart
  let minRadius = distFromHeart;
  pepcircle1.radius = random(minRadius + 10, minRadius + 60);

  // Create pepcircle2
  // Sample a point at distance [pepcircle1.radius, pepcircle1.radius * 1.5] from pepcircle1
  let distFromPepcircle1 = random(pepcircle1.radius, pepcircle1.radius * 1.5);
  let angleFromPepcircle1 = random(TWO_PI);

  let pepcircle2 = {
    x: pepcircle1.x + cos(angleFromPepcircle1) * distFromPepcircle1,
    y: pepcircle1.y + sin(angleFromPepcircle1) * distFromPepcircle1,
    radius: random(pepcircle1.radius * 0.5, pepcircle1.radius),
  };

  // Draw pepcircle1 (red)
  let redColor = [220, 60, 60];
  if (USE_BRUSH && typeof brush !== "undefined") {
    configureCircleBrush();
  }

  drawOverlayCircle(
    pepcircle1.x,
    pepcircle1.y,
    pepcircle1.radius,
    redColor,
    overlayalpha,
  );
  drawFilledCircle(pepcircle1.x, pepcircle1.y, pepcircle1.radius, redColor);

  // Draw pepcircle2 (blue)
  let blueColor = [72, 65, 209];
  if (USE_BRUSH && typeof brush !== "undefined") {
    configureCircleBrush();
  }
  drawFilledCircle(pepcircle2.x, pepcircle2.y, pepcircle2.radius, blueColor);
  drawOverlayCircle(
    pepcircle2.x,
    pepcircle2.y,
    pepcircle2.radius,
    blueColor,
    overlayalpha,
  );

  // Draw intersection in white
  if (USE_BRUSH && typeof brush !== "undefined") {
    configureCircleBrush();
  }
  drawCircleIntersection(pepcircle1, pepcircle2);
  drawOverlayIntersection(pepcircle1, pepcircle2, overlayalpha);

  // Draw the 2 perpendicular lines on top
  // stroke(60, 90, 180);
  noStroke();
  strokeWeight(4);
  line(line1.x1, line1.y1, line1.x2, line1.y2);
  line(line2.x1, line2.y1, line2.x2, line2.y2);
}

function configureBrushDefaults() {
  // Global brush setup for the whole sketch
  // brush.pick("marker");
  // brush.strokeWeight(1.1);
  // brush.bleed(0.06, "in");
  let brushes = [
    "2B",
    // "HB",
    // "2H",
    "cpencil",
    "pen",
    "rotring",
    "spray",
    "marker",
    "marker2",
    // "charcoal",
    "hatch_brush",
  ];
  let brushtype = "spray";
  brush.pick(brushtype);
  console.log("selected brush", brushtype);
}

function configureCircleBrush() {
  // Conspicuous solid fills for circles and intersection (no transparency)
  // brush.pick("marker");
  // brush.strokeWeight(100);
  // brush.noStroke();
}

function drawOverlayCircle(x, y, radius, color, alpha) {
  // Normal p5 fill overlay, independent from brush
  fill(color[0], color[1], color[2], alpha);
  noStroke();
  circle(x, y, radius * 2);
}

// ============================================================
// DRAWING FUNCTIONS - Handle both p5.brush and standard modes
// ============================================================

function drawFilledCircle(x, y, radius, color) {
  if (USE_BRUSH && typeof brush !== "undefined") {
    // Build circle vertices for p5.brush
    let vertices = [];
    let steps = 60;
    for (let i = 0; i < steps; i++) {
      let angle = (TWO_PI / steps) * i;
      let px = x + cos(angle) * radius;
      let py = y + sin(angle) * radius;
      vertices.push([px, py]);
    }

    // Configure watercolor effect
    brush.fill(color, 255);
    //brush.fillTexture(0.5, 0.4);
    brush.polygon(vertices);

    // OTHER BRUSH OPTIONS (tunable parameters and usage)
    // - brush.set("HB", "#002185", 1.2): name + color + weight multiplier
    // - brush.stroke("#ff4d4d"): stroke color for lines/edges
    // - brush.strokeWeight(1.5): thickness multiplier for the active brush
    // - brush.noStroke(): disable outlines for subsequent shapes
    //
    // HATCHING (distance, angle, options):
    // - brush.hatch(6, 30, {rand: 0.1, continuous: true, gradient: 0.2})
    // - brush.setHatch("rotring", "green", 1.1)
    // - brush.noHatch()
    //
    // VECTOR FIELDS (flow lines):
    // brush.field("waves") / brush.noField();
    // brush.refreshField(frameCount / 10);
    //
    // MARKER BRUSH PARAMETERS (built-in "marker" preset):
    // - type: "marker" (preset type)
    // - weight: base tip size (default ~2.5)
    // - vibration: stroke jitter/spread (default ~0.08)
    // - opacity: base alpha (default ~30)
    // - spacing: distance between stamps (default ~0.4)
    // - pressure: {curve: [a, b], min_max: [min, max]}
    //   - curve controls the pressure response bell curve
    //   - min_max sets pressure range (invert to flip pressure)
    //
    // CUSTOM BRUSH PARAMETERS TO TUNE:
    // - type: "standard" | "spray" | "marker" | "custom" | "image"
    // - weight: base tip size (larger = thicker stroke)
    // - vibration: jitter/spread of the stroke
    // - definition/quality: clarity and continuity for standard brushes
    // - opacity: base alpha (0-255)
    // - spacing: distance between brush stamps
    // - blend: true/false for paint mixing
    // - pressure: curve + min/max pressure response
    // - tip: custom geometry function (for type: "custom")
    // - image: {src: "..."} for type: "image" brushes
    // - rotate: "none" | "natural" | "random"
  } else {
    fill(color[0], color[1], color[2]);
    noStroke();
    circle(x, y, radius * 2);
  }
}

function fillSegmentWithPolygons(
  segmentVertices,
  polygonType,
  colorset,
  gridAngle,
  goodSize,
  goodensity,
) {
  // Fill a segment with a grid of polygons aligned with the lines
  // goodSize: base distance between polygon centers
  // goodensity: density multiplier (higher = denser grid, more polygons)

  // Apply density to grid spacing (inverse relationship: higher density = smaller spacing)
  let effectiveGridSize = goodSize / goodensity;

  // Find bounding box of the segment
  let minX = min(segmentVertices.map((v) => v.x));
  let maxX = max(segmentVertices.map((v) => v.x));
  let minY = min(segmentVertices.map((v) => v.y));
  let maxY = max(segmentVertices.map((v) => v.y));

  // Calculate grid directions (aligned with the lines)
  let dx1 = cos(gridAngle);
  let dy1 = sin(gridAngle);
  let dx2 = cos(gridAngle + HALF_PI);
  let dy2 = sin(gridAngle + HALF_PI);

  // Find center of segment for grid origin
  let centerX = (minX + maxX) / 2;
  let centerY = (minY + maxY) / 2;

  // Determine how many grid steps we need in each direction
  let maxDist = max(maxX - minX, maxY - minY) * 1.5;
  let steps = ceil(maxDist / effectiveGridSize);

  // Create rotated grid of polygons
  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      // Calculate position in rotated grid
      let x =
        centerX + i * effectiveGridSize * dx1 + j * effectiveGridSize * dx2;
      let y =
        centerY + i * effectiveGridSize * dy1 + j * effectiveGridSize * dy2;

      // Check if this point is inside the segment
      if (pointInPolygon(x, y, segmentVertices)) {
        // Randomize polygon size within [goodSize*0.8, goodSize*1.2]
        let randomSize = random(goodSize * 0.6, goodSize * 1.7) * 0.4;

        // Randomly sample a color from the colorset
        let randomColor = random(colorset);

        // Draw polygon at this position with rotation and random properties
        drawPolygon(x, y, polygonType, randomColor, randomSize, gridAngle);
      }
    }
  }
}

function drawPolygon(x, y, type, color, size, rotation) {
  // Draw different types of polygons with rotation
  if (USE_BRUSH && typeof brush !== "undefined") {
    // Build vertices in local space, then transform to world space
    let vertices = buildPolygonVertices(type, size);
    let transformed = transformVertices(vertices, x, y, rotation);

    // Configure watercolor effect for polygons
    brush.fill(color, 255);
    //brush.fillTexture(0.45, 0.35);
    brush.polygon(transformed);
  } else {
    push();
    translate(x, y);
    rotate(rotation);

    fill(color[0], color[1], color[2]);
    // stroke(255);
    noStroke();
    strokeWeight(1);

    if (type === "triangle") {
      // Equilateral triangle
      let h = (size * sqrt(3)) / 2;
      triangle(0, -size * 0.6, -size * 0.5, h * 0.4, size * 0.5, h * 0.4);
    } else if (type === "square") {
      // Square
      rectMode(CENTER);
      square(0, 0, size);
    } else if (type === "hexagon") {
      // Hexagon
      beginShape();
      for (let i = 0; i < 6; i++) {
        let angle = (TWO_PI / 6) * i - HALF_PI;
        let px = cos(angle) * size * 0.5;
        let py = sin(angle) * size * 0.5;
        vertex(px, py);
      }
      endShape(CLOSE);
    } else if (type === "diamond") {
      // Diamond (rhombus)
      beginShape();
      vertex(0, -size * 0.5);
      vertex(size * 0.4, 0);
      vertex(0, size * 0.5);
      vertex(-size * 0.4, 0);
      endShape(CLOSE);
    }

    pop();
  }
}

function buildPolygonVertices(type, size) {
  let vertices = [];

  if (type === "triangle") {
    // Equilateral triangle
    let h = (size * sqrt(3)) / 2;
    vertices = [
      [0, -size * 0.6],
      [-size * 0.5, h * 0.4],
      [size * 0.5, h * 0.4],
    ];
  } else if (type === "square") {
    // Square
    let half = size * 0.5;
    vertices = [
      [-half, -half],
      [half, -half],
      [half, half],
      [-half, half],
    ];
  } else if (type === "hexagon") {
    // Hexagon
    for (let i = 0; i < 6; i++) {
      let angle = (TWO_PI / 6) * i - HALF_PI;
      let px = cos(angle) * size * 0.5;
      let py = sin(angle) * size * 0.5;
      vertices.push([px, py]);
    }
  } else if (type === "diamond") {
    // Diamond (rhombus)
    vertices = [
      [0, -size * 0.5],
      [size * 0.4, 0],
      [0, size * 0.5],
      [-size * 0.4, 0],
    ];
  }

  return vertices;
}

function transformVertices(vertices, x, y, rotation) {
  let cosR = cos(rotation);
  let sinR = sin(rotation);
  return vertices.map(([vx, vy]) => [
    x + vx * cosR - vy * sinR,
    y + vx * sinR + vy * cosR,
  ]);
}

function drawCircleIntersection(circle1, circle2) {
  // Calculate distance between circle centers
  let d = dist(circle1.x, circle1.y, circle2.x, circle2.y);

  // Check if circles intersect
  if (
    d >= circle1.radius + circle2.radius ||
    d <= abs(circle1.radius - circle2.radius)
  ) {
    // No intersection or one circle is inside the other
    return;
  }

  // Calculate intersection points using circle-circle intersection formula
  let a =
    (circle1.radius * circle1.radius -
      circle2.radius * circle2.radius +
      d * d) /
    (2 * d);
  let h = sqrt(circle1.radius * circle1.radius - a * a);

  // Point on line between centers
  let px = circle1.x + (a * (circle2.x - circle1.x)) / d;
  let py = circle1.y + (a * (circle2.y - circle1.y)) / d;

  // The two intersection points
  let ix1 = px + (h * (circle2.y - circle1.y)) / d;
  let iy1 = py - (h * (circle2.x - circle1.x)) / d;
  let ix2 = px - (h * (circle2.y - circle1.y)) / d;
  let iy2 = py + (h * (circle2.x - circle1.x)) / d;

  // Calculate angles from each circle center to intersection points
  let angle1_1 = atan2(iy1 - circle1.y, ix1 - circle1.x);
  let angle1_2 = atan2(iy2 - circle1.y, ix2 - circle1.x);
  let angle2_1 = atan2(iy1 - circle2.y, ix1 - circle2.x);
  let angle2_2 = atan2(iy2 - circle2.y, ix2 - circle2.x);

  // Determine which arc direction to use (we want the smaller arc towards the other circle)
  let mid1 = (angle1_1 + angle1_2) / 2;
  let angleTo2 = atan2(circle2.y - circle1.y, circle2.x - circle1.x);

  // Normalize angle difference
  let diff = angleTo2 - mid1;
  while (diff > PI) diff -= TWO_PI;
  while (diff < -PI) diff += TWO_PI;

  // If the midpoint of the arc is not towards circle2, swap the angles
  if (abs(diff) > HALF_PI) {
    let temp = angle1_1;
    angle1_1 = angle1_2;
    angle1_2 = temp;
  }

  // Same for circle2
  let mid2 = (angle2_1 + angle2_2) / 2;
  let angleTo1 = atan2(circle1.y - circle2.y, circle1.x - circle2.x);

  diff = angleTo1 - mid2;
  while (diff > PI) diff -= TWO_PI;
  while (diff < -PI) diff += TWO_PI;

  if (abs(diff) > HALF_PI) {
    let temp = angle2_1;
    angle2_1 = angle2_2;
    angle2_2 = temp;
  }

  // Draw the lens-shaped intersection
  let steps = 50;

  if (USE_BRUSH && typeof brush !== "undefined") {
    let vertices = [];

    // Arc from circle1 using proper angle interpolation
    for (let i = 0; i <= steps; i++) {
      let angle = lerpAngle(angle1_1, angle1_2, i / steps);
      let xp = circle1.x + cos(angle) * circle1.radius;
      let yp = circle1.y + sin(angle) * circle1.radius;
      vertices.push([xp, yp]);
    }

    // Arc from circle2 (reverse direction)
    for (let i = 0; i <= steps; i++) {
      let angle = lerpAngle(angle2_2, angle2_1, i / steps);
      let xp = circle2.x + cos(angle) * circle2.radius;
      let yp = circle2.y + sin(angle) * circle2.radius;
      vertices.push([xp, yp]);
    }

    brush.noStroke();
    brush.fill([255, 255, 255], 255);
    //brush.fillTexture(0.3, 0.5);
    brush.polygon(vertices);
  } else {
    fill(255); // White
    noStroke();
    beginShape();

    // Arc from circle1 using proper angle interpolation
    for (let i = 0; i <= steps; i++) {
      let angle = lerpAngle(angle1_1, angle1_2, i / steps);
      let x = circle1.x + cos(angle) * circle1.radius;
      let y = circle1.y + sin(angle) * circle1.radius;
      vertex(x, y);
    }

    // Arc from circle2 (reverse direction)
    for (let i = 0; i <= steps; i++) {
      let angle = lerpAngle(angle2_2, angle2_1, i / steps);
      let x = circle2.x + cos(angle) * circle2.radius;
      let y = circle2.y + sin(angle) * circle2.radius;
      vertex(x, y);
    }

    endShape(CLOSE);
  }
}

function drawOverlayIntersection(circle1, circle2, alpha) {
  // Normal p5 fill overlay for the lens shape
  let d = dist(circle1.x, circle1.y, circle2.x, circle2.y);
  if (
    d >= circle1.radius + circle2.radius ||
    d <= abs(circle1.radius - circle2.radius)
  ) {
    return;
  }

  let a =
    (circle1.radius * circle1.radius -
      circle2.radius * circle2.radius +
      d * d) /
    (2 * d);
  let h = sqrt(circle1.radius * circle1.radius - a * a);

  let px = circle1.x + (a * (circle2.x - circle1.x)) / d;
  let py = circle1.y + (a * (circle2.y - circle1.y)) / d;

  let ix1 = px + (h * (circle2.y - circle1.y)) / d;
  let iy1 = py - (h * (circle2.x - circle1.x)) / d;
  let ix2 = px - (h * (circle2.y - circle1.y)) / d;
  let iy2 = py + (h * (circle2.x - circle1.x)) / d;

  let angle1_1 = atan2(iy1 - circle1.y, ix1 - circle1.x);
  let angle1_2 = atan2(iy2 - circle1.y, ix2 - circle1.x);
  let angle2_1 = atan2(iy1 - circle2.y, ix1 - circle2.x);
  let angle2_2 = atan2(iy2 - circle2.y, ix2 - circle2.x);

  let mid1 = (angle1_1 + angle1_2) / 2;
  let angleTo2 = atan2(circle2.y - circle1.y, circle2.x - circle1.x);

  let diff = angleTo2 - mid1;
  while (diff > PI) diff -= TWO_PI;
  while (diff < -PI) diff += TWO_PI;

  if (abs(diff) > HALF_PI) {
    let temp = angle1_1;
    angle1_1 = angle1_2;
    angle1_2 = temp;
  }

  let mid2 = (angle2_1 + angle2_2) / 2;
  let angleTo1 = atan2(circle1.y - circle2.y, circle1.x - circle2.x);

  diff = angleTo1 - mid2;
  while (diff > PI) diff -= TWO_PI;
  while (diff < -PI) diff += TWO_PI;

  if (abs(diff) > HALF_PI) {
    let temp = angle2_1;
    angle2_1 = angle2_2;
    angle2_2 = temp;
  }

  let steps = 50;
  fill(255, 255, 255, alpha);
  noStroke();
  beginShape();
  for (let i = 0; i <= steps; i++) {
    let angle = lerpAngle(angle1_1, angle1_2, i / steps);
    let x = circle1.x + cos(angle) * circle1.radius;
    let y = circle1.y + sin(angle) * circle1.radius;
    vertex(x, y);
  }
  for (let i = 0; i <= steps; i++) {
    let angle = lerpAngle(angle2_2, angle2_1, i / steps);
    let x = circle2.x + cos(angle) * circle2.radius;
    let y = circle2.y + sin(angle) * circle2.radius;
    vertex(x, y);
  }
  endShape(CLOSE);
}

function lerpAngle(a1, a2, t) {
  // Properly interpolate between two angles, taking the shortest path
  let diff = a2 - a1;

  // Normalize to [-PI, PI]
  while (diff > PI) diff -= TWO_PI;
  while (diff < -PI) diff += TWO_PI;

  return a1 + diff * t;
}

function pointInPolygon(px, py, vertices) {
  // Ray casting algorithm to check if point is inside polygon
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    let xi = vertices[i].x,
      yi = vertices[i].y;
    let xj = vertices[j].x,
      yj = vertices[j].y;

    let intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function findClosestEdgePoints(corner, edgePoints) {
  // Find the 2 edge points that share edges with this corner
  let result = [];

  for (let point of edgePoints) {
    // Check if point shares an edge with the corner
    if (point.x === corner.x || point.y === corner.y) {
      result.push(point);
    }
  }

  // Sort by distance to corner to get the closest 2
  result.sort((a, b) => {
    let distA = dist(a.x, a.y, corner.x, corner.y);
    let distB = dist(b.x, b.y, corner.x, corner.y);
    return distA - distB;
  });

  return result.slice(0, 2);
}

function connectsOppositeEdges(line) {
  // Check if a line connects opposite edges (not adjacent edges)
  let edge1 = getEdge(line.x1, line.y1);
  let edge2 = getEdge(line.x2, line.y2);

  // Opposite edges: top-bottom or left-right
  if (
    (edge1 === "top" && edge2 === "bottom") ||
    (edge1 === "bottom" && edge2 === "top")
  ) {
    return true; // Top and bottom are opposite
  }
  if (
    (edge1 === "left" && edge2 === "right") ||
    (edge1 === "right" && edge2 === "left")
  ) {
    return true; // Left and right are opposite
  }

  return false; // Adjacent edges
}

function connectsSameEdges(line1, line2) {
  // Check if two lines share any edge
  let edges1 = [getEdge(line1.x1, line1.y1), getEdge(line1.x2, line1.y2)];
  let edges2 = [getEdge(line2.x1, line2.y1), getEdge(line2.x2, line2.y2)];

  // Check if any edge is shared
  for (let e1 of edges1) {
    for (let e2 of edges2) {
      if (e1 === e2) {
        return true;
      }
    }
  }
  return false;
}

function findLineIntersection(line1, line2) {
  // Find intersection point of two lines
  let x1 = line1.x1,
    y1 = line1.y1;
  let x2 = line1.x2,
    y2 = line1.y2;
  let x3 = line2.x1,
    y3 = line2.y1;
  let x4 = line2.x2,
    y4 = line2.y2;

  let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (abs(denom) < 0.001) {
    // Lines are parallel, return midpoint
    return { x: width / 2, y: height / 2 };
  }

  let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1),
  };
}

function getEdge(x, y) {
  // Determine which edge a point is on (with small tolerance)
  let tolerance = 0.1;

  if (abs(y) < tolerance) return "top";
  if (abs(y - height) < tolerance) return "bottom";
  if (abs(x) < tolerance) return "left";
  if (abs(x - width) < tolerance) return "right";

  // Shouldn't happen, but return something
  return "unknown";
}

function findEdgePoints(cx, cy, angle) {
  // Find where a line through (cx, cy) at given angle hits canvas edges
  let dx = cos(angle);
  let dy = sin(angle);

  let points = [];

  // Check intersection with left edge (x = 0)
  if (abs(dx) > 0.001) {
    let t = -cx / dx;
    let y = cy + t * dy;
    if (y >= 0 && y <= height) {
      points.push({ x: 0, y: y, t: t });
    }
  }

  // Check intersection with right edge (x = width)
  if (abs(dx) > 0.001) {
    let t = (width - cx) / dx;
    let y = cy + t * dy;
    if (y >= 0 && y <= height) {
      points.push({ x: width, y: y, t: t });
    }
  }

  // Check intersection with top edge (y = 0)
  if (abs(dy) > 0.001) {
    let t = -cy / dy;
    let x = cx + t * dx;
    if (x >= 0 && x <= width) {
      points.push({ x: x, y: 0, t: t });
    }
  }

  // Check intersection with bottom edge (y = height)
  if (abs(dy) > 0.001) {
    let t = (height - cy) / dy;
    let x = cx + t * dx;
    if (x >= 0 && x <= width) {
      points.push({ x: x, y: height, t: t });
    }
  }

  // Sort by t value to get the two points on opposite sides
  points.sort((a, b) => a.t - b.t);

  // Return the first and last points (opposite sides)
  return {
    x1: points[0].x,
    y1: points[0].y,
    x2: points[points.length - 1].x,
    y2: points[points.length - 1].y,
  };
}

function draw() {
  // No animation needed
  noLoop();
}
