const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const frag = `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    if (gridRotation != 0.0) {
        uv = rotate(gridRotation * pi / 180.0) * uv;
    }

    float dist = length(uv);
    float func = sin(pi * (iTime - dist));
    vec2 rippleUv = uv + uv * func * rippleIntensity;

    if (mouseInteraction && mouseInfluence > 0.0) {
        vec2 mouseUv = (mousePosition * 2.0 - 1.0);
        mouseUv.x *= iResolution.x / iResolution.y;
        float mouseDist = length(uv - mouseUv);
        
        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
        
        float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
        rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
    }

    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
    vec2 b = abs(a);

    float aaWidth = 0.5;
    vec2 smoothB = vec2(
        smoothstep(0.0, aaWidth, b.x),
        smoothstep(0.0, aaWidth, b.y)
    );

    vec3 color = vec3(0.0);
    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
    color += exp(-gridThickness * smoothB.y);
    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

    if (glowIntensity > 0.0) {
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
    }

    float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
    
    vec2 vignetteCoords = vUv - 0.5;
    float vignetteDistance = length(vignetteCoords);
    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
    vignette = clamp(vignette, 0.0, 1.0);
    
    vec3 t;
    if (enableRainbow) {
        t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
        ) + 0.5;
    } else {
        t = gridColor;
    }

    float finalFade = ddd * vignette;
    float alpha = length(color) * finalFade * opacity;
    gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}
`;

function initColorBends(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  if (!window.THREE) {
    console.error('THREE.js not loaded');
    return;
  }

  const config = {
    enableRainbow: false,
    gridColor: '#ffffff',
    rippleIntensity: 0.05,
    gridSize: 10.0,
    gridThickness: 15.0,
    fadeDistance: 1.5,
    vignetteStrength: 2.0,
    glowIntensity: 0.1,
    opacity: 1.0,
    gridRotation: 0,
    mouseInteraction: true,
    mouseInteractionRadius: 1
  };

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  
  const toVec3 = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? new THREE.Vector3(parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255)
      : new THREE.Vector3(1, 1, 1);
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      enableRainbow: { value: config.enableRainbow },
      gridColor: { value: toVec3(config.gridColor) },
      rippleIntensity: { value: config.rippleIntensity },
      gridSize: { value: config.gridSize },
      gridThickness: { value: config.gridThickness },
      fadeDistance: { value: config.fadeDistance },
      vignetteStrength: { value: config.vignetteStrength },
      glowIntensity: { value: config.glowIntensity },
      opacity: { value: config.opacity },
      gridRotation: { value: config.gridRotation },
      mouseInteraction: { value: config.mouseInteraction },
      mousePosition: { value: new THREE.Vector2(0.5, 0.5) },
      mouseInfluence: { value: 0 },
      mouseInteractionRadius: { value: config.mouseInteractionRadius }
    },
    transparent: true,
    blending: THREE.NormalBlending
  });

  // Read theme on load
  let initialTheme = 'dark';
  try {
      initialTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
  } catch(e) {}
  
  if (initialTheme === 'light') {
      material.uniforms.gridColor.value = toVec3('#7c3aed'); // Darker purple for light mode
  } else {
      material.uniforms.gridColor.value = toVec3('#c084fc'); // Lighter purple for dark mode
  }

  window.addEventListener('themeChanged', (e) => {
    const theme = e.detail;
    if (theme === 'light') {
        material.uniforms.gridColor.value = toVec3('#7c3aed');
    } else {
        material.uniforms.gridColor.value = toVec3('#c084fc');
    }
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true
  });
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const handleResize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    material.uniforms.iResolution.value.set(w, h);
  };

  handleResize();
  window.addEventListener('resize', handleResize);

  const mousePositionRef = { x: 0.5, y: 0.5 };
  const targetMouseRef = { x: 0.5, y: 0.5 };
  let targetInfluence = 0;

  const handleMouseMove = e => {
    if (!config.mouseInteraction) return;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width || 1);
    const y = 1.0 - (e.clientY - rect.top) / (rect.height || 1);
    targetMouseRef.x = x;
    targetMouseRef.y = y;
  };

  const handleMouseEnter = () => {
    if (!config.mouseInteraction) return;
    targetInfluence = 1.0;
  };

  const handleMouseLeave = () => {
    if (!config.mouseInteraction) return;
    targetInfluence = 0.0;
  };

  if (config.mouseInteraction) {
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
  }

  const clock = new THREE.Clock();
  let rafId;

  const loop = () => {
    const dt = clock.getDelta();
    const elapsed = clock.elapsedTime;
    
    material.uniforms.iTime.value = elapsed;

    const lerpFactor = 0.1;
    mousePositionRef.x += (targetMouseRef.x - mousePositionRef.x) * lerpFactor;
    mousePositionRef.y += (targetMouseRef.y - mousePositionRef.y) * lerpFactor;

    const currentInfluence = material.uniforms.mouseInfluence.value;
    material.uniforms.mouseInfluence.value += (targetInfluence - currentInfluence) * 0.05;

    material.uniforms.mousePosition.value.set(mousePositionRef.x, mousePositionRef.y);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(loop);
  };
  
  rafId = requestAnimationFrame(loop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initColorBends('#color-bends-bg'));
} else {
  initColorBends('#color-bends-bg');
}
