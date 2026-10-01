export type Option = {
  element: HTMLElement;
  images: {
    elements: HTMLImageElement[];
    aspectRatio?: number;
    width?: number;
    height?: number;
    borderRadius?: number;
  };
  gap?: number;
  dividers?: boolean;
  perspective?: number;
  scroll?: boolean;
  drag?: boolean;
  duration?: number;
  y?: number;
  z?: number;
  backCardVisible?: boolean;
  theme?: "light" | "dark";
  direction?: "up" | "down" | "backward" | "forward";
  /** Element width (px) at which the scene renders at 1:1. Narrower elements zoom the
   *  whole ribbon out uniformly so it fits; omit to always render at 1:1. */
  fitWidth?: number;
  /** Lower bound for that zoom-out (default 0.4) */
  minScale?: number;
  /** Cap on device pixel ratio for the canvas (default 2) */
  maxPixelRatio?: number;
};

export type CurvedRibbonController = (() => void) & {
  destroy: () => void;
  next: () => void;
  prev: () => void;
  play: () => void;
  pause: () => void;
  scrollTo: (index: number) => void;
  seek: (progress: number) => void;
  setProgress: (progress: number) => void;
};

// 4x4 Matrix math utilities
const mat4 = {
  perspective(out: Float32Array, fovRad: number, aspect: number, near: number, far: number) {
    const f = 1.0 / Math.tan(fovRad / 2);
    out.fill(0);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
    return out;
  },
  lookAt(out: Float32Array, eye: [number, number, number], center: [number, number, number], up: [number, number, number]) {
    let z0 = eye[0] - center[0], z1 = eye[1] - center[1], z2 = eye[2] - center[2];
    let len = Math.hypot(z0, z1, z2);
    if (len === 0) z2 = 1; else { len = 1 / len; z0 *= len; z1 *= len; z2 *= len; }

    let x0 = up[1] * z2 - up[2] * z1, x1 = up[2] * z0 - up[0] * z2, x2 = up[0] * z1 - up[1] * z0;
    len = Math.hypot(x0, x1, x2);
    if (len === 0) { x0 = 0; x1 = 0; x2 = 0; } else { len = 1 / len; x0 *= len; x1 *= len; x2 *= len; }

    let y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;

    out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
    out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
    out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
    out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
    out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
    out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
    out[15] = 1;
    return out;
  },
};

export const curvedRibbonGallery = ({
  element,
  images: { elements: images, aspectRatio, width, height, borderRadius = 0 },
  gap = 24,
  dividers = true,
  perspective = 1300,
  scroll = false,
  drag = true,
  duration: customDuration,
  y = 48,
  z = 520,
  backCardVisible = true,
  theme = "light",
  direction = "backward",
  fitWidth,
  minScale = 0.4,
  maxPixelRatio = 2,
}: Option): CurvedRibbonController => {
  if (!element || images.length < 4 || images.some((image) => !image)) {
    throw new Error(
      "CurvedRibbonGallery requires an element and at least 4 images",
    );
  }

  const resolvedWidth = width ?? 320;
  const resolvedHeight =
    height ??
    (aspectRatio
      ? resolvedWidth / aspectRatio
      : (resolvedWidth * 9) / 16);

  const totalImages = images.length;
  const duration = customDuration ?? totalImages * 2000;

  // Exact continuous ribbon geometry
  // Pitch angle: steep climb (y ≈ 160) so ribbon spans from bottom of viewport to top
  const pitchY = y ?? 160;
  const chord = resolvedWidth + gap;
  const pathAngle = Math.atan2(pitchY, chord);
  const cosA = Math.cos(pathAngle);
  const sinA = Math.sin(pathAngle);
  const totalRibbonLength = totalImages * chord;

  // Create WebGL Canvas
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    display: "block",
    width: "100%",
    height: "100%",
    position: "absolute",
    inset: "0",
    userSelect: "none",
    touchAction: scroll || drag ? "none" : "",
    cursor: drag ? "grab" : "default",
  });
  element.style.position = "relative";
  element.style.overflow = "hidden";
  element.append(canvas);

  const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
  if (!gl) {
    throw new Error("WebGL is not supported in this browser");
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // 1. Shaders for Continuous Aligned 3D Curved Ribbon
  const vsSource = `
    attribute vec2 a_position; // local quad position [-0.5, 0.5]
    attribute vec2 a_uv;

    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform float u_cardDistance; // distance s along ribbon center line
    uniform vec2 u_cardSize;
    uniform float u_radius;
    uniform float u_cosA;
    uniform float u_sinA;

    varying vec2 v_uv;
    varying float v_depth;
    varying vec3 v_worldPos;

    void main() {
      v_uv = a_uv;

      float sLocal = a_position.x * u_cardSize.x;
      float tLocal = a_position.y * u_cardSize.y;
      float sGlobal = u_cardDistance + sLocal;

      float theta = (sGlobal * u_cosA) / u_radius;
      float x = u_radius * sin(theta);
      float z = u_radius * cos(theta);
      float y = sGlobal * u_sinA + tLocal * u_cosA;

      vec3 pos = vec3(x, y, z);
      v_worldPos = pos;

      vec4 viewPos = u_view * vec4(pos, 1.0);
      v_depth = -viewPos.z;

      gl_Position = u_projection * viewPos;
    }
  `;

  const fsSource = `
    precision highp float;

    uniform sampler2D u_texture;
    uniform float u_borderRadius;
    uniform vec2 u_cardSize;
    uniform float u_radius;
    uniform float u_dimBehind;

    varying vec2 v_uv;
    varying float v_depth;
    varying vec3 v_worldPos;

    float roundedBoxSDF(vec2 p, vec2 b, float r) {
      vec2 d = abs(p) - b + vec2(r);
      return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
    }

    void main() {
      float alpha = 1.0;
      if (u_borderRadius > 0.5) {
        vec2 halfSize = u_cardSize * 0.5;
        vec2 pixelPos = (v_uv - 0.5) * u_cardSize;
        float dist = roundedBoxSDF(pixelPos, halfSize, u_borderRadius);
        alpha = 1.0 - smoothstep(-0.8, 0.8, dist);
        if (alpha <= 0.001) discard;
      }

      vec4 texColor = texture2D(u_texture, v_uv);
      vec3 finalColor = texColor.rgb;

      // Dim behind cards without decreasing opacity:
      float zNorm = clamp((v_worldPos.z + u_radius) / (2.0 * u_radius), 0.0, 1.0);
      float dim = mix(u_dimBehind, 1.0, zNorm);
      finalColor *= dim;

      gl_FragColor = vec4(finalColor, texColor.a * alpha);
    }
  `;

  // 2. Shaders for 3D Continuous Spiral Guide Rails
  const railVsSource = `
    attribute vec3 a_position;
    attribute float a_s;
    uniform mat4 u_projection;
    uniform mat4 u_view;
    varying float v_depth;
    varying float v_s;

    void main() {
      vec4 viewPos = u_view * vec4(a_position, 1.0);
      v_depth = -viewPos.z;
      v_s = a_s;
      gl_Position = u_projection * viewPos;
    }
  `;

  // Distinct rail styling for light vs dark theme
  const railColorVec = theme === "light" ? "vec3(0.20, 0.20, 0.20)" : "vec3(1.0, 1.0, 1.0)";
  const railFsSource = `
    precision highp float;
    varying float v_depth;
    varying float v_s;

    uniform float u_headS;
    uniform float u_tailS;
    uniform float u_isBackward;

    void main() {
      float headFade;
      float tailFade;

      if (u_isBackward > 0.5) {
        // Traveling top to bottom: v_s >= u_headS is drawn, v_s <= u_tailS is trailing
        headFade = clamp((v_s - (u_headS - 80.0)) / 160.0, 0.0, 1.0);
        tailFade = clamp(((u_tailS + 160.0) - v_s) / 320.0, 0.0, 1.0);
      } else {
        // Traveling bottom to top
        headFade = clamp(((u_headS + 80.0) - v_s) / 160.0, 0.0, 1.0);
        tailFade = clamp((v_s - (u_tailS - 160.0)) / 320.0, 0.0, 1.0);
      }

      float visibility = headFade * tailFade;
      if (visibility <= 0.005) {
        discard;
      }

      float depthFade = clamp(1.0 - (v_depth - 500.0) / 1600.0, 0.20, 0.75);
      gl_FragColor = vec4(${railColorVec}, 0.42 * depthFade * visibility);
    }
  `;

  // Shaders compile on the driver's threads; nothing queries their status until
  // the driver reports completion, so building the helix never blocks a frame.
  const parallelCompile = gl.getExtension("KHR_parallel_shader_compile");

  const createShader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };

  const createProgram = (vs: string, fs: string) => {
    const p = gl.createProgram()!;
    gl.attachShader(p, createShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, createShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    return p;
  };

  const isProgramDone = (p: WebGLProgram) =>
    !parallelCompile || gl.getProgramParameter(p, parallelCompile.COMPLETION_STATUS_KHR);

  const assertLinked = (p: WebGLProgram) => {
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${gl.getProgramInfoLog(p)}`);
    }
  };

  const cardProg = createProgram(vsSource, fsSource);
  const railProg = createProgram(railVsSource, railFsSource);

  // 3. Subdivided Mesh Quad for Smooth 3D Ribbon Curvature
  const segmentsX = 24;
  const segmentsY = 1;
  const cardVertices: number[] = [];
  const cardIndices: number[] = [];

  for (let yIdx = 0; yIdx <= segmentsY; yIdx++) {
    const v = yIdx / segmentsY;
    const posY = v - 0.5;
    for (let xIdx = 0; xIdx <= segmentsX; xIdx++) {
      const u = xIdx / segmentsX;
      const posX = u - 0.5;
      cardVertices.push(posX, posY, u, 1.0 - v);
    }
  }

  for (let yIdx = 0; yIdx < segmentsY; yIdx++) {
    for (let xIdx = 0; xIdx < segmentsX; xIdx++) {
      const a = yIdx * (segmentsX + 1) + xIdx;
      const b = a + 1;
      const c = a + (segmentsX + 1);
      const d = c + 1;
      cardIndices.push(a, c, b, b, c, d);
    }
  }

  const cardVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cardVbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cardVertices), gl.STATIC_DRAW);

  const cardIbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cardIbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cardIndices), gl.STATIC_DRAW);

  // 4. Build Continuous 3D Spiral Guide Rails Buffer spanning full screen travel
  const railRangeS = 8800; // spans across entire viewport from below bottom to above top
  const railSamples = 360;
  const railVertices: number[] = [];
  const railOffset = resolvedHeight / 2 + 12;

  [-railOffset, railOffset].forEach((edgeY) => {
    for (let i = 0; i <= railSamples; i++) {
      const s = ((i / railSamples) - 0.5) * railRangeS;
      const theta = (s * cosA) / z;
      const rx = z * Math.sin(theta);
      const rz = z * Math.cos(theta);
      const ry = s * sinA + edgeY * cosA;
      railVertices.push(rx, ry, rz, s);
    }
  });

  const railVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, railVbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(railVertices), gl.STATIC_DRAW);

  // Render scheduling: frames are drawn only while the canvas is on screen and
  // something actually changed (scroll progress, a texture arriving, a resize)
  let rAF = 0;
  let dirty = true;
  let onScreen = true;
  let destroyed = false;
  let requestRender = () => {}; // replaced once the render loop is defined

  // Texture uploads are paced at one per frame so several images finishing
  // their download together never stall a frame
  const uploadQueue: Array<() => void> = [];
  let uploadPump = 0;
  const pumpUploads = () => {
    uploadPump = 0;
    if (destroyed) return;
    uploadQueue.shift()?.();
    if (uploadQueue.length) uploadPump = requestAnimationFrame(pumpUploads);
  };
  const queueUpload = (job: () => void) => {
    uploadQueue.push(job);
    if (!uploadPump) uploadPump = requestAnimationFrame(pumpUploads);
  };

  // 5. Load WebGL Textures with automatic CORS and instant fallback
  const createFallbackCanvas = (index: number) => {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 200;
    const ctx = c.getContext("2d")!;
    const hue = (index * 360) / totalImages;
    const grad = ctx.createLinearGradient(0, 0, 320, 200);
    grad.addColorStop(0, `hsl(${hue}, 65%, 55%)`);
    grad.addColorStop(1, `hsl(${(hue + 45) % 360}, 80%, 35%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 320, 200);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 26px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`Image ${index + 1}`, 160, 100);
    return c;
  };

  const textures: (WebGLTexture | null)[] = images.map((img, index) => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const upload = (source: TexImageSource) => {
      try {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      } catch {
        // Handled silently
      }
    };

    // Instant 1px placeholder until the real image is decoded
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([17, 17, 19, 255]));

    // Decode once, off the main thread, then upload the ready bitmap
    const uploadBitmap = (bmp: ImageBitmap) =>
      queueUpload(() => {
        if (destroyed) {
          bmp.close();
          return;
        }
        upload(bmp);
        bmp.close();
        dirty = true;
        requestRender();
      });

    if (img.src) {
      img
        .decode()
        .then(() => createImageBitmap(img))
        .then(uploadBitmap)
        .catch(() => {
          fetch(img.src, { mode: "cors" })
            .then((r) => r.blob())
            .then((blob) => createImageBitmap(blob))
            .then(uploadBitmap)
            .catch(() => {
              // Image unavailable: show the labelled gradient card instead
              upload(createFallbackCanvas(index));
              dirty = true;
              requestRender();
            });
        });
    }

    return tex;
  });

  // 6. Camera & Projection matrices
  const projMat = new Float32Array(16);
  const viewMat = new Float32Array(16);

  const resize = () => {
    const dpr = Math.min(maxPixelRatio, window.devicePixelRatio || 1);
    const w = element.clientWidth || window.innerWidth;
    const h = element.clientHeight || window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // 1 world unit = `scale` px at the z=0 plane; shrinks the scene on narrow screens
    const scale = fitWidth ? Math.min(1, Math.max(minScale, w / fitWidth)) : 1;
    const fov = 2 * Math.atan(h / scale / (2 * perspective));
    mat4.perspective(projMat, fov, w / h, 10, 4000);
    mat4.lookAt(viewMat, [0, 0, perspective], [0, 0, 0], [0, 1, 0]);
    dirty = true;
    requestRender();
  };

  window.addEventListener("resize", resize);
  const ro = new ResizeObserver(resize);
  ro.observe(element);
  resize();

  // 7. Render Loop with Continuous Spiral Travel:
  // CARDS TRAVEL FROM BOTTOM TO TOP:
  // At progress = 0: Leading card is at y ≈ -360px (bottom-left, peeking into view).
  // At progress = 1: Trailing card has climbed to y ≈ +340px (top-right).
  const sBottomStart = -360 / sinA - (totalImages - 1) * chord;
  const sTopEnd = 340 / sinA;
  const totalTravelRange = sTopEnd - sBottomStart;

  const startTravel = sBottomStart;
  const endTravel = sTopEnd;

  let currentPos = startTravel;
  let targetPos = startTravel;
  let isPlaying = !scroll;
  let lastTime = performance.now();

  // Uniform / attribute locations: looked up once (after compilation completes)
  // instead of on every frame
  let programsReady = false;
  const lookupLocations = () => ({
    cardU: {
      projection: gl.getUniformLocation(cardProg, "u_projection"),
      view: gl.getUniformLocation(cardProg, "u_view"),
      cardSize: gl.getUniformLocation(cardProg, "u_cardSize"),
      radius: gl.getUniformLocation(cardProg, "u_radius"),
      cosA: gl.getUniformLocation(cardProg, "u_cosA"),
      sinA: gl.getUniformLocation(cardProg, "u_sinA"),
      borderRadius: gl.getUniformLocation(cardProg, "u_borderRadius"),
      dimBehind: gl.getUniformLocation(cardProg, "u_dimBehind"),
      distance: gl.getUniformLocation(cardProg, "u_cardDistance"),
      texture: gl.getUniformLocation(cardProg, "u_texture"),
    },
    cardA: {
      position: gl.getAttribLocation(cardProg, "a_position"),
      uv: gl.getAttribLocation(cardProg, "a_uv"),
    },
    railU: {
      projection: gl.getUniformLocation(railProg, "u_projection"),
      view: gl.getUniformLocation(railProg, "u_view"),
      headS: gl.getUniformLocation(railProg, "u_headS"),
      tailS: gl.getUniformLocation(railProg, "u_tailS"),
      isBackward: gl.getUniformLocation(railProg, "u_isBackward"),
    },
    railA: {
      position: gl.getAttribLocation(railProg, "a_position"),
      s: gl.getAttribLocation(railProg, "a_s"),
    },
  });
  let { cardU, cardA, railU, railA } = {} as ReturnType<typeof lookupLocations>;

  requestRender = () => {
    if (rAF || !onScreen || destroyed) return;
    lastTime = performance.now();
    rAF = requestAnimationFrame(render);
  };

  const render = (time: number) => {
    rAF = 0;
    if (!onScreen || destroyed) return;

    if (!programsReady) {
      if (!isProgramDone(cardProg) || !isProgramDone(railProg)) {
        rAF = requestAnimationFrame(render);
        return;
      }
      assertLinked(cardProg);
      assertLinked(railProg);
      ({ cardU, cardA, railU, railA } = lookupLocations());
      programsReady = true;
      dirty = true;
    }

    const dt = Math.min(64, time - lastTime);
    lastTime = time;

    if (isPlaying) {
      targetPos += (dt / duration) * totalTravelRange;
      if (targetPos > endTravel) targetPos = startTravel;
    }

    const delta = targetPos - currentPos;
    const moving = Math.abs(delta) > 0.05;
    currentPos = moving ? currentPos + delta * 0.14 : targetPos;

    // Nothing changed since the last frame: skip drawing and let the loop sleep
    if (!moving && !dirty && !isPlaying) return;
    dirty = false;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render Continuous Aligned Ribbon Cards travelling along spiral
    gl.useProgram(cardProg);
    gl.depthMask(true);
    gl.uniformMatrix4fv(cardU.projection, false, projMat);
    gl.uniformMatrix4fv(cardU.view, false, viewMat);
    gl.uniform2f(cardU.cardSize, resolvedWidth, resolvedHeight);
    gl.uniform1f(cardU.radius, z);
    gl.uniform1f(cardU.cosA, cosA);
    gl.uniform1f(cardU.sinA, sinA);
    gl.uniform1f(cardU.borderRadius, borderRadius);
    gl.uniform1f(cardU.dimBehind, backCardVisible ? (theme === "light" ? 0.70 : 0.42) : 0.05);

    gl.bindBuffer(gl.ARRAY_BUFFER, cardVbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cardIbo);

    const aPosLoc = cardA.position;
    const aUvLoc = cardA.uv;
    gl.enableVertexAttribArray(aPosLoc);
    gl.enableVertexAttribArray(aUvLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aUvLoc, 2, gl.FLOAT, false, 16, 8);

    const distLoc = cardU.distance;
    const texLoc = cardU.texture;
    gl.uniform1i(texLoc, 0);

    // Compute exact continuous position along spiral for each card
    const cardOrder = images.map((_, i) => {
      const s = currentPos + i * chord;
      const theta = (s * cosA) / z;
      const cardX = z * Math.sin(theta);
      const cardZ = z * Math.cos(theta);
      const cardY = s * sinA;
      // Distance squared from camera at (0, 0, perspective)
      const distSq = cardX * cardX + cardY * cardY + (cardZ - perspective) * (cardZ - perspective);
      return { index: i, s, distSq };
    });

    // Draw back-to-front (farthest first, closest last) for optimal alpha blending
    cardOrder.sort((a, b) => b.distSq - a.distSq);

    cardOrder.forEach(({ index, s }) => {
      const tex = textures[index];
      if (!tex) return;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);

      gl.uniform1f(distLoc, s);

      gl.drawElements(gl.TRIANGLES, cardIndices.length, gl.UNSIGNED_SHORT, 0);
    });

    // Render 3D Spiral Guide Rails on top of cards
    if (dividers) {
      gl.depthMask(false);
      gl.useProgram(railProg);
      gl.uniformMatrix4fv(railU.projection, false, projMat);
      gl.uniformMatrix4fv(railU.view, false, viewMat);

      // Line path travels from TOP to BOTTOM as cards travel from bottom to top:
      // When cards are at bottom (currentPos = startTravel), scrollProgress = 0 (line is at TOP).
      // When cards reach top (currentPos = endTravel), scrollProgress = 1 (line reaches BOTTOM).
      const scrollProgress = Math.max(0, Math.min(1, (currentPos - startTravel) / totalTravelRange));

      const sTopStart = 420 / sinA;
      const sBottomEnd = -400 / sinA - (totalImages - 1) * chord;
      const lineRange = sTopStart - sBottomEnd;

      // Line head starts at the top (+200) and sweeps downwards along the spiral:
      const headS = sTopStart + 200 - scrollProgress * (lineRange + 600);
      // Line tail follows behind after drawing in:
      const tailProgress = Math.max(0, (scrollProgress - 0.35) / 0.65);
      const tailS = sTopStart + 2400 - tailProgress * (lineRange + 2800);

      gl.uniform1f(railU.headS, headS);
      gl.uniform1f(railU.tailS, tailS);
      gl.uniform1f(railU.isBackward, 1.0);

      gl.bindBuffer(gl.ARRAY_BUFFER, railVbo);
      const posLoc = railA.position;
      const sLoc = railA.s;

      // 4 floats per vertex: rx, ry, rz, s -> stride = 16 bytes
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 16, 0);

      if (sLoc !== -1) {
        gl.enableVertexAttribArray(sLoc);
        gl.vertexAttribPointer(sLoc, 1, gl.FLOAT, false, 16, 12);
      }

      const ptsPerRail = railSamples + 1;
      gl.drawArrays(gl.LINE_STRIP, 0, ptsPerRail);
      gl.drawArrays(gl.LINE_STRIP, ptsPerRail, ptsPerRail);
      gl.depthMask(true);
    }

    // Keep going while the ribbon is still easing toward its target
    rAF = requestAnimationFrame(render);
  };

  // Pause entirely while the canvas is off screen
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) {
      dirty = true;
      requestRender();
    } else if (rAF) {
      cancelAnimationFrame(rAF);
      rAF = 0;
    }
  });
  visibilityObserver.observe(element);
  requestRender();

  // 8. Interactive Scroll & Pointer Dragging
  let isDragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let velocity = 0;

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    isPlaying = false;
    targetPos += (event.deltaY + event.deltaX) * 1.5;
    requestRender();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    isPlaying = false;
    isDragging = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    velocity = 0;
    canvas.style.cursor = "grabbing";
    try { canvas.setPointerCapture(event.pointerId); } catch {}
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!isDragging) return;
    const deltaX = event.clientX - lastPointerX;
    const deltaY = event.clientY - lastPointerY;
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    velocity = delta;

    targetPos -= delta * 2.2;
    requestRender();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    canvas.style.cursor = drag ? "grab" : "default";
    try { canvas.releasePointerCapture(event.pointerId); } catch {}
    targetPos -= velocity * 8.0;
    requestRender();
  };

  if (scroll) {
    canvas.addEventListener("wheel", onWheel, { passive: false });
  }

  if (drag) {
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
  }

  const destroy = () => {
    destroyed = true;
    if (rAF) cancelAnimationFrame(rAF);
    if (uploadPump) cancelAnimationFrame(uploadPump);
    visibilityObserver.disconnect();
    window.removeEventListener("resize", resize);
    ro.disconnect();
    canvas.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    textures.forEach((t) => t && gl.deleteTexture(t));
    gl.deleteBuffer(cardVbo);
    gl.deleteBuffer(cardIbo);
    gl.deleteBuffer(railVbo);
    gl.deleteProgram(cardProg);
    gl.deleteProgram(railProg);
    canvas.remove();
  };

  const controller = Object.assign(destroy, {
    destroy,
    next: () => {
      isPlaying = false;
      targetPos += chord;
      requestRender();
    },
    prev: () => {
      isPlaying = false;
      targetPos -= chord;
      requestRender();
    },
    play: () => {
      isPlaying = true;
      requestRender();
    },
    pause: () => {
      isPlaying = false;
    },
    scrollTo: (index: number) => {
      isPlaying = false;
      targetPos = index * chord;
      requestRender();
    },
    seek: (progress: number) => {
      isPlaying = false;
      targetPos = startTravel + progress * totalTravelRange;
      requestRender();
    },
    setProgress: (progress: number) => {
      isPlaying = false;
      targetPos = startTravel + progress * totalTravelRange;
      requestRender();
    },
  });

  return controller;
};

export default curvedRibbonGallery;
