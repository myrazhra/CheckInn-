import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';
import { calculateDijkstraRoute, isRouteStillValid } from '../../utils/navigationGraph';
import { RouteResult, VenueZone } from '../../types';
import { playHapticSound } from '../../utils/audioFeedback';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Compass,
  Layers,
  MapPin,
  Users,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle2,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Target,
  LocateFixed,
  Clock,
  Footprints,
  Navigation,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getOccupancyStatus, getStatusColor, calculateOccupancyPercent } from '../../utils/crowdLogic';

interface VirtualCrowdPerson {
  mesh: THREE.Group;
  currentEdgeFrom: string;
  currentEdgeTo: string;
  progress: number;
  speed: number;
  targetZoneId: string;
  isQueuing: boolean;
  state: 'walking' | 'queuing' | 'lingering';
  lingerTicks: number;
}

export const Venue3DMap: React.FC<{ isOrganizerView?: boolean }> = ({ isOrganizerView = false }) => {
  const {
    zones,
    nodes,
    edges,
    activeFloorView,
    setActiveFloorView,
    selectedStartNodeId,
    setSelectedStartNodeId,
    selectedTargetNodeId,
    setSelectedTargetNodeId,
    activeScenario,
    setCrowdScenario,
    crowdMultiplier,
    setCrowdMultiplier,
    simulationSpeed,
    setSimulationSpeed,
    isSimulationPaused,
    setIsSimulationPaused,
    showAnimatedPeople,
    setShowAnimatedPeople,
    showCrowdHeatmap,
    setShowCrowdHeatmap,
    useCameraDataGlobal,
    setUseCameraDataGlobal,
    toggleEdgeClosure,
    toggleZoneClosure,
  } = useApp();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Waze-Style Navigation State
  const [isNavSimulating, setIsNavSimulating] = useState(false);
  const [navSimProgress, setNavSimProgress] = useState(0); // 0 to 100%
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentHapticCue, setCurrentHapticCue] = useState<string>('');
  const [rerouteNotice, setRerouteNotice] = useState<string>('');
  const [destinationReached, setDestinationReached] = useState(false);
  const [cameraMode, setCameraMode] = useState<'chase' | 'overview'>('chase');
  const [isCameraDetached, setIsCameraDetached] = useState(false);
  const [dynamicDistToTurn, setDynamicDistToTurn] = useState<number>(0);
  const [dynamicRemainingDist, setDynamicRemainingDist] = useState<number>(0);
  const [dynamicEtaSeconds, setDynamicEtaSeconds] = useState<number>(0);

  // Computed Route
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);

  // Three.js References for Animation Loop
  const visitorMarkerRef = useRef<THREE.Group | null>(null);
  const destinationMarkerRef = useRef<THREE.Group | null>(null);
  const remainingRouteLineRef = useRef<THREE.Line | null>(null);
  const completedRouteLineRef = useRef<THREE.Line | null>(null);
  const virtualCrowdRef = useRef<VirtualCrowdPerson[]>([]);
  const zoneMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Camera tracking control refs
  const cameraModeRef = useRef<'chase' | 'overview'>('chase');
  const isCameraDetachedRef = useRef<boolean>(false);
  const lookTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation values kept in refs for lossless 60Hz loop
  const navAnimRef = useRef({
    isPlaying: false,
    speedMultiplier: 1.0,
    currentWaypointIndex: 0,
    segmentProgress: 0,
    totalDistanceTraveled: 0,
    totalDistance: 0,
    currentSegmentDist: 10,
  });

  const propsRef = useRef({
    nodes,
    edges,
    zones,
    activeFloorView,
    showAnimatedPeople,
    showCrowdHeatmap,
    isSimulationPaused,
    simulationSpeed,
    activeScenario,
    useCameraDataGlobal,
  });

  useEffect(() => {
    propsRef.current = {
      nodes,
      edges,
      zones,
      activeFloorView,
      showAnimatedPeople,
      showCrowdHeatmap,
      isSimulationPaused,
      simulationSpeed,
      activeScenario,
      useCameraDataGlobal,
    };
  }, [
    nodes,
    edges,
    zones,
    activeFloorView,
    showAnimatedPeople,
    showCrowdHeatmap,
    isSimulationPaused,
    simulationSpeed,
    activeScenario,
    useCameraDataGlobal,
  ]);

  // Compute Route
  const handleCalculateRoute = useCallback(() => {
    const route = calculateDijkstraRoute(
      selectedStartNodeId,
      selectedTargetNodeId,
      nodes,
      edges
    );
    setActiveRoute(route);
    setRerouteNotice('');
    setDestinationReached(false);
    if (route) {
      setDynamicRemainingDist(route.totalDistance);
      setDynamicEtaSeconds(route.estimatedTimeSeconds);
      if (route.steps[0]) {
        setDynamicDistToTurn(Math.round(route.steps[0].distance));
      }
    }
    return route;
  }, [selectedStartNodeId, selectedTargetNodeId, nodes, edges]);

  useEffect(() => {
    handleCalculateRoute();
  }, [handleCalculateRoute]);

  // Check if route gets blocked by a closed edge
  useEffect(() => {
    if (activeRoute && activeRoute.nodePath.length > 1) {
      const stillValid = isRouteStillValid(activeRoute.nodePath, edges);
      if (!stillValid) {
        setRerouteNotice('Corridor closure detected! Recalculating alternative safe route...');
        playHapticSound('warning');
        setCurrentHapticCue('⚠️ Route Blocked — Detour Recalculating');

        const newRoute = calculateDijkstraRoute(
          selectedStartNodeId,
          selectedTargetNodeId,
          nodes,
          edges
        );
        if (newRoute) {
          setActiveRoute(newRoute);
          navAnimRef.current.currentWaypointIndex = 0;
          navAnimRef.current.segmentProgress = 0;
        } else {
          setActiveRoute(null);
          setIsNavSimulating(false);
          navAnimRef.current.isPlaying = false;
          setRerouteNotice('No accessible route currently available between these zones.');
        }
      }
    }
  }, [edges, activeRoute, selectedStartNodeId, selectedTargetNodeId, nodes]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f2ea);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(45, 55, 45);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.88);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ee, 0.92);
    dirLight.position.set(35, 55, 35);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Level 1 Floor
    const floor1Geo = new THREE.PlaneGeometry(90, 70);
    const floor1Mat = new THREE.MeshStandardMaterial({
      color: 0xe8ddc8,
      roughness: 0.85,
    });
    const floor1 = new THREE.Mesh(floor1Geo, floor1Mat);
    floor1.rotation.x = -Math.PI / 2;
    floor1.position.y = -0.05;
    floor1.receiveShadow = true;
    scene.add(floor1);

    // Level 2 Floor Slab
    const floor2Geo = new THREE.BoxGeometry(70, 0.4, 50);
    const floor2Mat = new THREE.MeshStandardMaterial({
      color: 0xdfd4bd,
      roughness: 0.85,
    });
    const floor2 = new THREE.Mesh(floor2Geo, floor2Mat);
    floor2.position.set(0, 4.8, 0);
    floor2.receiveShadow = true;
    scene.add(floor2);

    // Grid Overlay
    const gridHelper = new THREE.GridHelper(90, 45, 0x142b4a, 0xd4c7af);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Build Venue Zones
    const zoneMeshes = new Map<string, THREE.Mesh>();
    zones.forEach((z) => {
      const geo = new THREE.BoxGeometry(z.dimensions.width, z.dimensions.height, z.dimensions.depth);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x142b4a,
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: 0.82,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(z.position.x, z.position.y + z.dimensions.height / 2, z.position.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { zoneId: z.id, name: z.name, floor: z.floor };
      scene.add(mesh);
      zoneMeshes.set(z.id, mesh);

      const edgesGeo = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edgesGeo, lineMat);
      mesh.add(wireframe);
    });
    zoneMeshesRef.current = zoneMeshes;

    // Corridor Edges
    const edgeLinesGroup = new THREE.Group();
    edges.forEach((e) => {
      const fromN = nodes.find((n) => n.id === e.fromNodeId);
      const toN = nodes.find((n) => n.id === e.toNodeId);
      if (fromN && toN) {
        const yFrom = fromN.floor === 1 ? 0.05 : 5.05;
        const yTo = toN.floor === 1 ? 0.05 : 5.05;
        const points = [
          new THREE.Vector3(fromN.x, yFrom, fromN.z),
          new THREE.Vector3(toN.x, yTo, toN.z),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineDashedMaterial({
          color: 0x142b4a,
          dashSize: 1,
          gapSize: 0.5,
          opacity: 0.35,
          transparent: true,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        edgeLinesGroup.add(line);
      }
    });
    scene.add(edgeLinesGroup);

    // ==========================================
    // WAZE-STYLE MOVING NAVIGATION MARKER (CHEVRON BEACON)
    // ==========================================
    const visitorGroup = new THREE.Group();

    // 1. Sleek 3D Navigation Arrow/Chevron
    const chevronShape = new THREE.Shape();
    chevronShape.moveTo(0, 1.6);
    chevronShape.lineTo(1.1, -1.0);
    chevronShape.lineTo(0, -0.4);
    chevronShape.lineTo(-1.1, -1.0);
    chevronShape.closePath();

    const extrudeSettings = { depth: 0.45, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
    const chevronGeo = new THREE.ExtrudeGeometry(chevronShape, extrudeSettings);
    const chevronMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9, // Bright navigation cyan/blue
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.2,
    });
    const chevronMesh = new THREE.Mesh(chevronGeo, chevronMat);
    chevronMesh.rotation.x = -Math.PI / 2;
    chevronMesh.position.y = 0.5;
    visitorGroup.add(chevronMesh);

    // 2. High-glow ground pulse ring
    const groundRingGeo = new THREE.RingGeometry(1.2, 2.2, 32);
    const groundRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const groundRing = new THREE.Mesh(groundRingGeo, groundRingMat);
    groundRing.rotation.x = -Math.PI / 2;
    groundRing.position.y = 0.08;
    visitorGroup.add(groundRing);

    // 3. Floating User Beacon Orb
    const orbGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 2.0;
    visitorGroup.add(orb);

    visitorGroup.visible = false;
    scene.add(visitorGroup);
    visitorMarkerRef.current = visitorGroup;

    // ==========================================
    // 3D DESTINATION BEACON PIN (HIGH VISIBILITY)
    // ==========================================
    const destGroup = new THREE.Group();

    // Destination Pin Head
    const pinHeadGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const pinHeadMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red finish
      emissive: 0xb91c1c,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const pinHead = new THREE.Mesh(pinHeadGeo, pinHeadMat);
    pinHead.position.y = 4.2;
    destGroup.add(pinHead);

    // Tapered Pin Stem
    const pinStemGeo = new THREE.ConeGeometry(0.45, 2.6, 16);
    const pinStemMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const pinStem = new THREE.Mesh(pinStemGeo, pinStemMat);
    pinStem.rotation.x = Math.PI;
    pinStem.position.y = 2.4;
    destGroup.add(pinStem);

    // Glowing Concentric Destination Ground Ring
    const destRingGeo = new THREE.RingGeometry(1.5, 2.8, 32);
    const destRingMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const destRing = new THREE.Mesh(destRingGeo, destRingMat);
    destRing.rotation.x = -Math.PI / 2;
    destRing.position.y = 0.08;
    destGroup.add(destRing);

    destGroup.visible = false;
    scene.add(destGroup);
    destinationMarkerRef.current = destGroup;

    // ==========================================
    // ROUTE LINES: COMPLETED (GREY) & REMAINING (VIBRANT EMERALD)
    // ==========================================
    // 1. Remaining Route Line (Active ahead)
    const remainingMat = new THREE.LineBasicMaterial({
      color: 0x10b981, // Vibrant emerald green
      linewidth: 5,
    });
    const remainingLineObj = new THREE.Line(new THREE.BufferGeometry(), remainingMat);
    scene.add(remainingLineObj);
    remainingRouteLineRef.current = remainingLineObj;

    // 2. Completed Route Line (Traversed behind)
    const completedMat = new THREE.LineDashedMaterial({
      color: 0x94a3b8, // Muted slate grey
      dashSize: 1.0,
      gapSize: 0.5,
      linewidth: 3,
    });
    const completedLineObj = new THREE.Line(new THREE.BufferGeometry(), completedMat);
    scene.add(completedLineObj);
    completedRouteLineRef.current = completedLineObj;

    // Virtual Crowd
    const crowdList: VirtualCrowdPerson[] = [];
    const crowdCount = 38;
    const colors = [0x142b4a, 0x0b1f36, 0x3b82f6, 0x10b981, 0xef4444, 0xf59e0b, 0x8b5cf6];

    for (let i = 0; i < crowdCount; i++) {
      const pGroup = new THREE.Group();
      const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.1, 8);
      const chosenColor = colors[i % colors.length];
      const bodyMat = new THREE.MeshStandardMaterial({ color: chosenColor, roughness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.9;
      pGroup.add(body);

      const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.7;
      pGroup.add(head);

      const randomEdge = edges[Math.floor(Math.random() * edges.length)];
      pGroup.scale.set(0.9, 0.9, 0.9);
      scene.add(pGroup);

      crowdList.push({
        mesh: pGroup,
        currentEdgeFrom: randomEdge.fromNodeId,
        currentEdgeTo: randomEdge.toNodeId,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        targetZoneId: zones[Math.floor(Math.random() * zones.length)].id,
        isQueuing: false,
        state: 'walking',
        lingerTicks: 0,
      });
    }
    virtualCrowdRef.current = crowdList;

    // Pointer Interaction (Detect user manual pan/drag to detach camera)
    const domEl = renderer.domElement;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isPointerDownRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerStartRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isPointerDownRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - pointerStartRef.current.x;
      const dy = clientY - pointerStartRef.current.y;

      if (Math.hypot(dx, dy) > 15) {
        // User manually panned away
        isCameraDetachedRef.current = true;
        setIsCameraDetached(true);
      }
    };

    const handlePointerUp = () => {
      isPointerDownRef.current = false;
    };

    domEl.addEventListener('mousedown', handlePointerDown);
    domEl.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    domEl.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // ==========================================
    // 60FPS ANIMATION LOOP (WAZE CHASE CAMERA & REAL-TIME ROUTE SEGMENTS)
    // ==========================================
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const {
        nodes: curNodes,
        edges: curEdges,
        zones: curZones,
        activeFloorView: curFloor,
        showAnimatedPeople: curShowPeople,
        showCrowdHeatmap: curShowHeatmap,
        isSimulationPaused: curPaused,
        simulationSpeed: curSpeed,
        activeScenario: curScenario,
      } = propsRef.current;

      // Animate Destination Pin Pulse
      if (destGroup.visible) {
        destRing.scale.set(1 + 0.3 * Math.sin(elapsed * 4), 1 + 0.3 * Math.sin(elapsed * 4), 1);
        pinHead.position.y = 4.2 + 0.25 * Math.sin(elapsed * 3);
        pinStem.position.y = 2.4 + 0.25 * Math.sin(elapsed * 3);
      }

      // Update Zones
      curZones.forEach((z) => {
        const mesh = zoneMeshes.get(z.id);
        if (mesh) {
          const status = getOccupancyStatus(z);
          const colorHex = getStatusColor(status);
          const mat = mesh.material as THREE.MeshStandardMaterial;

          if (curShowHeatmap) {
            mat.color.set(colorHex);
            mat.opacity = z.isClosed ? 0.35 : 0.85;
          } else {
            mat.color.set(0x142b4a);
            mat.opacity = 0.8;
          }

          if (status === 'critical') {
            const scalePulse = 1 + 0.04 * Math.sin(elapsed * 6);
            mesh.scale.set(1, scalePulse, 1);
          } else {
            mesh.scale.set(1, 1, 1);
          }

          if (z.floor !== curFloor) {
            mat.opacity *= 0.4;
          }
        }
      });

      // Animate Crowd
      if (curShowPeople && !curPaused) {
        crowdList.forEach((person, idx) => {
          person.mesh.visible = true;
          if (curScenario === 'registration_queue' && idx < 20) {
            person.currentEdgeTo = 'n-l1-reg';
          } else if (curScenario === 'crowded_exhibition' && idx < 26) {
            person.currentEdgeTo = 'n-l1-ex-north';
          } else if (curScenario === 'busy_food_court' && idx < 22) {
            person.currentEdgeTo = 'n-l1-food';
          }

          const fromNode = curNodes.find((n) => n.id === person.currentEdgeFrom);
          const toNode = curNodes.find((n) => n.id === person.currentEdgeTo);

          if (fromNode && toNode) {
            person.progress += person.speed * curSpeed;
            if (person.progress >= 1) {
              person.progress = 0;
              person.currentEdgeFrom = person.currentEdgeTo;
              const availableEdges = curEdges.filter(
                (e) => !e.isClosed && (e.fromNodeId === person.currentEdgeFrom || e.toNodeId === person.currentEdgeFrom)
              );
              if (availableEdges.length > 0) {
                const nextE = availableEdges[Math.floor(Math.random() * availableEdges.length)];
                person.currentEdgeTo = nextE.fromNodeId === person.currentEdgeFrom ? nextE.toNodeId : nextE.fromNodeId;
              }
            }

            const yFrom = fromNode.floor === 1 ? 0 : 5;
            const yTo = toNode.floor === 1 ? 0 : 5;
            const curX = THREE.MathUtils.lerp(fromNode.x, toNode.x, person.progress);
            const curZ = THREE.MathUtils.lerp(fromNode.z, toNode.z, person.progress);
            const curY = THREE.MathUtils.lerp(yFrom, yTo, person.progress);
            const bob = Math.abs(Math.sin(elapsed * 10 * person.speed * 200 + idx)) * 0.15;
            person.mesh.position.set(curX, curY + bob, curZ);

            const dirX = toNode.x - fromNode.x;
            const dirZ = toNode.z - fromNode.z;
            if (Math.hypot(dirX, dirZ) > 0.01) {
              person.mesh.rotation.y = Math.atan2(dirX, dirZ);
            }
          }
        });
      } else {
        crowdList.forEach((person) => {
          person.mesh.visible = false;
        });
      }

      // ==========================================
      // MOVING MARKER SIMULATION & WAZE CHASE CAMERA
      // ==========================================
      const nav = navAnimRef.current;
      const marker = visitorMarkerRef.current;

      if (nav.isPlaying && marker && activeRoute && activeRoute.nodePath.length > 1) {
        const path = activeRoute.nodePath;
        const wpIdx = nav.currentWaypointIndex;

        if (wpIdx < path.length - 1) {
          const fromNode = curNodes.find((n) => n.id === path[wpIdx])!;
          const toNode = curNodes.find((n) => n.id === path[wpIdx + 1])!;

          if (fromNode && toNode) {
            const edgeDist = Math.hypot(toNode.x - fromNode.x, toNode.z - fromNode.z) || 5;
            nav.currentSegmentDist = edgeDist;

            // Step advance
            const stepDelta = ((2.0 * curSpeed * delta) / edgeDist) * 1.5;
            nav.segmentProgress += stepDelta;
            nav.totalDistanceTraveled += 2.0 * curSpeed * delta * 1.5;

            // Remaining dynamic calculations
            const totalRemaining = Math.max(0, Math.round(activeRoute.totalDistance - nav.totalDistanceTraveled));
            setDynamicRemainingDist(totalRemaining);

            const distToNextNode = Math.max(0, Math.round((1 - nav.segmentProgress) * edgeDist));
            setDynamicDistToTurn(distToNextNode);

            const etaSec = Math.max(0, Math.round(totalRemaining / (1.5 * curSpeed)));
            setDynamicEtaSeconds(etaSec);

            // Total Progress
            const pct = Math.min(100, Math.round((nav.totalDistanceTraveled / (activeRoute.totalDistance || 1)) * 100));
            setNavSimProgress(pct);

            const yFrom = fromNode.floor === 1 ? 0 : 5;
            const yTo = toNode.floor === 1 ? 0 : 5;

            const posX = THREE.MathUtils.lerp(fromNode.x, toNode.x, nav.segmentProgress);
            const posZ = THREE.MathUtils.lerp(fromNode.z, toNode.z, nav.segmentProgress);
            const posY = THREE.MathUtils.lerp(yFrom, yTo, nav.segmentProgress);

            marker.position.set(posX, posY, posZ);

            // Orient marker in direction of movement
            const angle = Math.atan2(toNode.x - fromNode.x, toNode.z - fromNode.z);
            marker.rotation.y = angle;

            // Pulse beacon ring
            groundRing.scale.set(1 + 0.25 * Math.sin(elapsed * 8), 1 + 0.25 * Math.sin(elapsed * 8), 1);
            orb.position.y = 2.0 + 0.15 * Math.sin(elapsed * 10);

            // ==========================================
            // DYNAMIC ROUTE SPLIT: COMPLETED (BEHIND) vs REMAINING (AHEAD)
            // ==========================================
            if (completedRouteLineRef.current && remainingRouteLineRef.current) {
              const currentPos = new THREE.Vector3(posX, posY + 0.25, posZ);

              // 1. Completed points: from path[0] up to path[wpIdx], then currentPos
              const completedPoints: THREE.Vector3[] = [];
              for (let i = 0; i <= wpIdx; i++) {
                const n = curNodes.find((nd) => nd.id === path[i]);
                if (n) completedPoints.push(new THREE.Vector3(n.x, n.floor === 1 ? 0.25 : 5.25, n.z));
              }
              completedPoints.push(currentPos);
              completedRouteLineRef.current.geometry.dispose();
              completedRouteLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(completedPoints);
              completedRouteLineRef.current.computeLineDistances();
              completedRouteLineRef.current.visible = true;

              // 2. Remaining points: currentPos, then path[wpIdx+1] onwards to destination
              const remainingPoints: THREE.Vector3[] = [currentPos];
              for (let i = wpIdx + 1; i < path.length; i++) {
                const n = curNodes.find((nd) => nd.id === path[i]);
                if (n) remainingPoints.push(new THREE.Vector3(n.x, n.floor === 1 ? 0.35 : 5.35, n.z));
              }
              remainingRouteLineRef.current.geometry.dispose();
              remainingRouteLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(remainingPoints);
              remainingRouteLineRef.current.visible = true;
            }

            // ==========================================
            // WAZE-STYLE 3D CHASE CAMERA FOLLOW
            // ==========================================
            if (cameraModeRef.current === 'chase' && !isCameraDetachedRef.current) {
              // Third-person chase perspective directly behind the marker
              const chaseDist = 18;
              const chaseHeight = 13;
              const targetCamX = posX - Math.sin(angle) * chaseDist;
              const targetCamZ = posZ - Math.cos(angle) * chaseDist;
              const targetCamY = posY + chaseHeight;

              camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.08);

              // Look ahead along route trajectory
              const lookAheadDist = 9;
              const targetLook = new THREE.Vector3(
                posX + Math.sin(angle) * lookAheadDist,
                posY + 1.2,
                posZ + Math.cos(angle) * lookAheadDist
              );
              lookTargetRef.current.lerp(targetLook, 0.09);
              camera.lookAt(lookTargetRef.current);
            }

            // Next Waypoint Arrival Check
            if (nav.segmentProgress >= 1) {
              nav.segmentProgress = 0;
              nav.currentWaypointIndex++;
              setCurrentStepIndex(Math.min(nav.currentWaypointIndex, activeRoute.steps.length - 1));

              // Floor transition check
              if (toNode.floor !== curFloor) {
                setActiveFloorView(toNode.floor);
              }

              // Sound & tactile feedback
              const nextStep = activeRoute.steps[nav.currentWaypointIndex];
              if (nextStep) {
                if (nextStep.action === 'turn_left') {
                  playHapticSound('left');
                  setCurrentHapticCue('◄◄ Turn Left Cue (Simulated)');
                } else if (nextStep.action === 'turn_right') {
                  playHapticSound('right');
                  setCurrentHapticCue('►► Turn Right Cue (Simulated)');
                } else if (nextStep.action === 'take_stairs') {
                  playHapticSound('destination');
                  setCurrentHapticCue('▲ Stairs / Elevator Transition');
                } else if (nextStep.action === 'arrive') {
                  playHapticSound('destination');
                  setCurrentHapticCue('★ Destination Nearby');
                }
              }
            }
          }
        } else {
          // Destination Reached!
          nav.isPlaying = false;
          setIsNavSimulating(false);
          setDestinationReached(true);
          playHapticSound('destination');
          setCurrentHapticCue('★ Arrived at Destination');
        }
      } else if (!nav.isPlaying && cameraModeRef.current === 'overview' && !isCameraDetachedRef.current) {
        // Return camera to elevated isometric overview
        camera.position.lerp(new THREE.Vector3(45, 55, 45), 0.05);
        lookTargetRef.current.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        camera.lookAt(lookTargetRef.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', handlePointerDown);
      domEl.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domEl.removeEventListener('touchstart', handlePointerDown);
      domEl.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [zones, nodes, edges, setActiveFloorView]);

  // Update Route Geometry & Destination Marker on activeRoute change
  useEffect(() => {
    if (!sceneRef.current) return;
    if (!activeRoute || activeRoute.nodePath.length < 2) {
      if (remainingRouteLineRef.current) remainingRouteLineRef.current.visible = false;
      if (completedRouteLineRef.current) completedRouteLineRef.current.visible = false;
      if (destinationMarkerRef.current) destinationMarkerRef.current.visible = false;
      return;
    }

    const points: THREE.Vector3[] = [];
    activeRoute.nodePath.forEach((nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        const y = node.floor === 1 ? 0.35 : 5.35;
        points.push(new THREE.Vector3(node.x, y, node.z));
      }
    });

    if (remainingRouteLineRef.current) {
      remainingRouteLineRef.current.geometry.dispose();
      remainingRouteLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(points);
      remainingRouteLineRef.current.visible = true;
    }

    if (completedRouteLineRef.current) {
      completedRouteLineRef.current.visible = false;
    }

    // Place visitor marker at start
    if (visitorMarkerRef.current && points[0]) {
      visitorMarkerRef.current.position.copy(points[0]);
      visitorMarkerRef.current.visible = true;
    }

    // Place destination marker at target node
    if (destinationMarkerRef.current && points[points.length - 1]) {
      const destPoint = points[points.length - 1];
      destinationMarkerRef.current.position.set(destPoint.x, destPoint.y, destPoint.z);
      destinationMarkerRef.current.visible = true;
    }
  }, [activeRoute, nodes]);

  // Waze Navigation Controls
  const handleStartNavigation = () => {
    if (!activeRoute || activeRoute.nodePath.length < 2) return;
    setIsNavSimulating(true);
    setDestinationReached(false);
    cameraModeRef.current = 'chase';
    setCameraMode('chase');
    isCameraDetachedRef.current = false;
    setIsCameraDetached(false);

    navAnimRef.current.isPlaying = true;
    navAnimRef.current.currentWaypointIndex = 0;
    navAnimRef.current.segmentProgress = 0;
    navAnimRef.current.totalDistanceTraveled = 0;
    navAnimRef.current.totalDistance = activeRoute.totalDistance;
    setCurrentStepIndex(0);
    setNavSimProgress(0);

    const firstStep = activeRoute.steps[0];
    if (firstStep) {
      setCurrentHapticCue(`Starting Route: ${firstStep.instruction}`);
      playHapticSound('destination');
    }
  };

  const handlePauseResume = () => {
    const next = !isNavSimulating;
    setIsNavSimulating(next);
    navAnimRef.current.isPlaying = next;
  };

  const handleRecenter = () => {
    isCameraDetachedRef.current = false;
    setIsCameraDetached(false);
    cameraModeRef.current = 'chase';
    setCameraMode('chase');
  };

  const toggleCameraMode = () => {
    const nextMode = cameraMode === 'chase' ? 'overview' : 'chase';
    cameraModeRef.current = nextMode;
    setCameraMode(nextMode);
    isCameraDetachedRef.current = false;
    setIsCameraDetached(false);
  };

  const handleEndNavigation = () => {
    navAnimRef.current.isPlaying = false;
    setIsNavSimulating(false);
    navAnimRef.current.currentWaypointIndex = 0;
    navAnimRef.current.segmentProgress = 0;
    setNavSimProgress(0);
    setDestinationReached(false);
    cameraModeRef.current = 'overview';
    setCameraMode('overview');
    isCameraDetachedRef.current = false;
    setIsCameraDetached(false);

    if (visitorMarkerRef.current && activeRoute) {
      const startNode = nodes.find((n) => n.id === activeRoute.nodePath[0]);
      if (startNode) {
        visitorMarkerRef.current.position.set(startNode.x, startNode.floor === 1 ? 0.35 : 5.35, startNode.z);
      }
    }
    if (completedRouteLineRef.current) completedRouteLineRef.current.visible = false;
    if (remainingRouteLineRef.current && activeRoute) {
      const points = activeRoute.nodePath.map((nid) => {
        const n = nodes.find((node) => node.id === nid)!;
        return new THREE.Vector3(n.x, n.floor === 1 ? 0.35 : 5.35, n.z);
      });
      remainingRouteLineRef.current.geometry.dispose();
      remainingRouteLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }
  };

  const destinationNode = nodes.find((n) => n.id === selectedTargetNodeId);
  const currentStep = activeRoute?.steps[currentStepIndex] || activeRoute?.steps[0];
  const nextStep = activeRoute?.steps[currentStepIndex + 1];

  // Helper icon for maneuver
  const getManeuverIcon = (action?: string) => {
    switch (action) {
      case 'turn_left':
        return CornerUpLeft;
      case 'turn_right':
        return CornerUpRight;
      case 'take_stairs':
        return Layers;
      case 'arrive':
        return Target;
      default:
        return ArrowUp;
    }
  };

  const ManeuverIcon = getManeuverIcon(currentStep?.action);

  return (
    <div className="space-y-6">
      {/* 3D Map Viewport Container */}
      <div className="bg-white rounded-3xl border border-[#E8DDC8] overflow-hidden shadow-xs relative">
        {/* ========================================================= */}
        {/* WAZE-STYLE FLOATING TOP MANEUVER CARD (When Navigating) */}
        {/* ========================================================= */}
        {isNavSimulating && activeRoute ? (
          <div className="absolute top-4 left-4 right-4 z-20 pointer-events-auto max-w-xl mx-auto animate-in slide-in-from-top-4 duration-300">
            <div className="bg-[#0B1F36]/95 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                  <ManeuverIcon className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-emerald-400">
                      In {dynamicDistToTurn}m
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                      Step {currentStepIndex + 1} of {activeRoute.steps.length}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white leading-tight mt-0.5">
                    {currentStep?.instruction || 'Follow path ahead'}
                  </h3>
                  {nextStep && (
                    <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                      <span className="text-emerald-400 font-semibold">Then:</span> {nextStep.instruction}
                    </p>
                  )}
                </div>
              </div>

              {/* End Nav cross icon */}
              <button
                type="button"
                onClick={handleEndNavigation}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="End Navigation"
                aria-label="End Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Top Floating Bar */
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#E8DDC8] shadow-sm">
              <span className="text-xs font-bold text-[#142B4A] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#142B4A]" />
                3D Indoor Wayfinding
              </span>
              <span className="text-[#64748B]">&bull;</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveFloorView(1)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeFloorView === 1 ? 'bg-[#142B4A] text-white' : 'text-[#64748B] hover:text-[#142B4A]'
                  }`}
                >
                  Level 1
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFloorView(2)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeFloorView === 2 ? 'bg-[#142B4A] text-white' : 'text-[#64748B] hover:text-[#142B4A]'
                  }`}
                >
                  Level 2
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#E8DDC8] shadow-sm">
              <span className="text-[11px] font-semibold text-[#64748B]">Mode:</span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                Simulated Indoor Navigation (Demo Mode)
              </span>
            </div>
          </div>
        )}

        {/* Floating Right Controls (Recenter, Camera View, Speed) */}
        <div className="absolute top-24 right-4 z-20 flex flex-col items-end gap-2.5 pointer-events-auto">
          {/* Recenter Map Button (Waze Style) */}
          {(isCameraDetached || cameraMode === 'overview') && isNavSimulating && (
            <button
              type="button"
              onClick={handleRecenter}
              className="py-2 px-3.5 rounded-2xl bg-[#0B1F36] hover:bg-[#142B4A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xl border border-white/20 transition-all cursor-pointer animate-in fade-in"
            >
              <LocateFixed className="w-4 h-4 text-emerald-400" />
              <span>Recenter Map</span>
            </button>
          )}

          {/* Camera Chase vs Overview Switcher */}
          <button
            type="button"
            onClick={toggleCameraMode}
            className="p-2.5 rounded-2xl bg-white/90 hover:bg-white text-[#142B4A] border border-[#E8DDC8] shadow-md transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5"
            title={cameraMode === 'chase' ? 'Switch to Overview Map' : 'Switch to Waze Chase Cam'}
          >
            <Navigation className={`w-4 h-4 ${cameraMode === 'chase' ? 'text-emerald-600' : 'text-[#64748B]'}`} />
            <span className="hidden sm:inline">
              {cameraMode === 'chase' ? '3D Chase Cam' : 'Overview'}
            </span>
          </button>
        </div>

        {/* 3D Canvas Mount Element */}
        <div
          ref={containerRef}
          className="w-full h-[540px] bg-[#F6F2EA] cursor-grab active:cursor-grabbing"
        />

        {/* ========================================================= */}
        {/* WAZE-STYLE BOTTOM NAVIGATION HUD BAR */}
        {/* ========================================================= */}
        {isNavSimulating && activeRoute && (
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#E8DDC8] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#142B4A] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Navigation className="w-6 h-6 text-[#E8DDC8]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">
                    Navigating To
                  </span>
                  <h4 className="font-black text-base text-[#0B1F36] leading-tight truncate max-w-[220px]">
                    {destinationNode?.name || 'Destination'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-bold mt-0.5">
                    <span className="text-emerald-700 font-extrabold">{dynamicRemainingDist} m</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-[#142B4A]">~{dynamicEtaSeconds}s ETA</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-[#64748B] font-normal">Level {destinationNode?.floor}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Navigation Control Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handlePauseResume}
                  className="py-2.5 px-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#E8DDC8] text-[#142B4A] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {navAnimRef.current.isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleEndNavigation}
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>End Route</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reroute Alert Banner */}
        {rerouteNotice && (
          <div className="absolute top-20 left-4 right-4 z-20 pointer-events-auto max-w-md mx-auto">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{rerouteNotice}</span>
            </div>
          </div>
        )}

        {/* Destination Reached Banner */}
        {destinationReached && (
          <div className="absolute bottom-6 left-4 right-4 z-20 pointer-events-auto max-w-sm mx-auto">
            <div className="p-5 bg-emerald-600 text-white rounded-2xl shadow-2xl text-center space-y-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#E8DDC8]" />
              <h4 className="font-bold text-base">You Have Arrived!</h4>
              <p className="text-xs text-emerald-100 leading-relaxed">
                You have reached <strong>{destinationNode?.name}</strong>. Enjoy your session!
              </p>
              <button
                type="button"
                onClick={handleEndNavigation}
                className="mt-2 py-1.5 px-4 rounded-xl bg-white text-emerald-900 font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Planner & Simulation Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#142B4A]" />
              <h3 className="font-bold text-base text-[#0B1F36]">Indoor Route Planner</h3>
            </div>
            {activeRoute && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#F6F2EA] text-[#142B4A]">
                {activeRoute.totalDistance}m &bull; ~{activeRoute.estimatedTimeSeconds}s walk
              </span>
            )}
          </div>

          {/* Node Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172437] mb-1.5">
                Current Location (Start)
              </label>
              <select
                value={selectedStartNodeId}
                onChange={(e) => setSelectedStartNodeId(e.target.value)}
                disabled={isNavSimulating}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] font-medium focus:ring-2 focus:ring-[#142B4A] disabled:opacity-60"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    L{n.floor} &bull; {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172437] mb-1.5">
                Destination Room / Hall
              </label>
              <select
                value={selectedTargetNodeId}
                onChange={(e) => setSelectedTargetNodeId(e.target.value)}
                disabled={isNavSimulating}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] font-medium focus:ring-2 focus:ring-[#142B4A] disabled:opacity-60"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    L{n.floor} &bull; {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Simulation Action Bar */}
          <div className="pt-2 border-t border-[#E8DDC8] flex flex-wrap items-center gap-2.5">
            {!isNavSimulating ? (
              <button
                type="button"
                onClick={handleStartNavigation}
                disabled={!activeRoute}
                className="flex-1 py-3 px-5 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-[#E8DDC8]" />
                <span>Start Navigation (Waze-Style)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseResume}
                className="flex-1 py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Navigation</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleStartNavigation}
              className="py-3 px-3.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#E8DDC8]/60 text-[#142B4A] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Restart from Beginning"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restart</span>
            </button>

            <button
              type="button"
              onClick={handleEndNavigation}
              className="py-3 px-3.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-red-50 hover:text-red-600 text-[#142B4A] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="End Navigation"
            >
              <Square className="w-4 h-4" />
              <span className="hidden sm:inline">End</span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-[11px] font-semibold text-[#64748B] mr-1">Speed:</span>
              {[1, 2, 4].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSimulationSpeed(s)}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    simulationSpeed === s
                      ? 'bg-[#142B4A] text-white'
                      : 'bg-[#F6F2EA] text-[#64748B] hover:text-[#142B4A]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Turn-by-Turn Directions List */}
          {activeRoute && (
            <div className="pt-2 border-t border-[#E8DDC8]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A] block mb-2">
                Step-by-Step Directions ({activeRoute.steps.length} Steps)
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {activeRoute.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      idx === currentStepIndex && isNavSimulating
                        ? 'bg-emerald-50 border border-emerald-300 font-bold text-emerald-950 shadow-xs'
                        : 'bg-[#F6F2EA]/50 text-[#172437]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#142B4A]/10 text-[#142B4A] flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{st.instruction}</span>
                    </div>
                    {st.distance > 0 && (
                      <span className="text-[10px] text-[#64748B] font-mono shrink-0">
                        {Math.round(st.distance)}m
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Crowd Intelligence & Scenarios Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#142B4A]" />
              <h3 className="font-bold text-base text-[#0B1F36]">Crowd Simulation Scenarios</h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              Demo Simulation
            </span>
          </div>

          {/* Scenario Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'normal', label: '1. Normal Flow' },
              { id: 'registration_queue', label: '2. Registration Queue' },
              { id: 'crowded_exhibition', label: '3. Crowded Expo' },
              { id: 'busy_food_court', label: '4. Busy Food Court' },
              { id: 'blocked_entrance', label: '5. Blocked Entrance' },
              { id: 'crowd_dispersal', label: '6. Crowd Dispersal' },
            ].map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setCrowdScenario(sc.id as any)}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                  activeScenario === sc.id
                    ? 'bg-[#142B4A] text-white border-[#142B4A] shadow-xs'
                    : 'bg-[#F6F2EA]/60 text-[#172437] border-[#E8DDC8] hover:bg-[#E8DDC8]/40'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Toggle Switches */}
          <div className="pt-3 border-t border-[#E8DDC8] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#172437]">Show Animated 3D People</span>
              <button
                type="button"
                onClick={() => setShowAnimatedPeople(!showAnimatedPeople)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  showAnimatedPeople ? 'bg-[#142B4A]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    showAnimatedPeople ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#172437]">Crowd Density Heatmap Overlay</span>
              <button
                type="button"
                onClick={() => setShowCrowdHeatmap(!showCrowdHeatmap)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  showCrowdHeatmap ? 'bg-[#142B4A]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    showCrowdHeatmap ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Zone Occupancy Monitor List */}
          <div className="pt-3 border-t border-[#E8DDC8]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A] block mb-2">
              Zone Capacities &amp; Occupancy
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {zones.map((z) => {
                const count = useCameraDataGlobal ? z.currentCameraCount : z.currentSimulatedCount;
                const pct = calculateOccupancyPercent(count, z.capacity);
                const status = getOccupancyStatus(z);
                const colorHex = getStatusColor(status);

                return (
                  <div
                    key={z.id}
                    className="p-2.5 rounded-xl border border-[#E8DDC8]/80 bg-[#F6F2EA]/40 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: colorHex }}
                        />
                        <span className="font-bold text-[#142B4A]">{z.name}</span>
                        {z.isClosed && (
                          <span className="text-[10px] text-red-600 font-bold">(CLOSED)</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#64748B]">
                        L{z.floor} &bull; {count}/{z.capacity} attendees ({pct}%)
                      </span>
                    </div>

                    {isOrganizerView && (
                      <button
                        type="button"
                        onClick={() => toggleZoneClosure(z.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                          z.isClosed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                        }`}
                      >
                        {z.isClosed ? 'Reopen Zone' : 'Close Zone'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
