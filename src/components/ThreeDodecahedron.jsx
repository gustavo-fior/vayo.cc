/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeDodecahedron = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  useEffect(() => {
    let camera;
    let scene;
    let renderer;
    let geometry;
    let material;
    let mesh;

    const init = () => {
      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.05,
        100
      );
      camera.position.z = 2;

      scene = new THREE.Scene();

      geometry = new THREE.DodecahedronGeometry(1.2, 1);

      const pos = geometry.attributes.position?.array;
      const col = [];

      if (!pos) return;

      for (let i = 0; i < pos?.length; i += 3) {
        col.push(Math.random(), Math.random(), Math.random());
      }

      geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(col, 3)
      );

      material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        shininess: 90,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 0.9,
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const wireframe = new THREE.WireframeGeometry(geometry);
      const line = new THREE.LineSegments(wireframe);

      // line.material.depthTest = false;
      // line.material.opacity = 0.75;
      // line.material.transparent = true;
      // line.material.color = new THREE.Color('white');

      scene.add(line);

      const light = new THREE.PointLight(0xffffff, 1);
      light.position.set(5, 5, 5);
      scene.add(light);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvasRef.current,
      });
      renderer.setSize(window.innerWidth/10, window.innerHeight/10);
      renderer.setClearColor(0x000000, 0); // Set background color to transparent

      animate();
    };

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;

      const time = Date.now() * 0.00023;

      const rx = Math.sin(time * 0.7) * 10.5;
      const ry = Math.cos(time * 0.5) * 10.5;
      const rz = Math.sin(time * 0.3) * 10.5;

      camera.position.set(rx, ry, rz).normalize().multiplyScalar(2.5);
      camera.lookAt(scene.position);

      const scale = Math.sin(time) * 0.4 + 0.7;
      mesh.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    init();

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return <canvas ref={canvasRef}></canvas>;
};

export default ThreeDodecahedron;
